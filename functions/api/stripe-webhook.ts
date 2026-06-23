/**
 * POST /api/stripe-webhook
 * Handles Stripe payment_intent.succeeded to:
 *  1. Confirm the booking row
 *  2. Upsert customer (dedup by email)
 *  3. Tag customer as "safe_at_home"
 *  4. Create assessment row
 *  5. Create Google Calendar event
 *  6. Send confirmation email via Resend
 */

import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;      // PEM, newlines as \n
  GOOGLE_CALENDAR_ID: string;      // e.g. primary or a specific cal ID
  FROM_EMAIL: string;              // e.g. bookings@tucsonhandyman.pro
  OWNER_EMAIL: string;             // John's email
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') ?? '';

  // Verify webhook signature
  if (!(await verifyStripeSignature(body, sig, env.STRIPE_WEBHOOK_SECRET))) {
    return new Response('Signature mismatch', { status: 400 });
  }

  const event = JSON.parse(body) as StripeEvent;

  if (event.type === 'payment_intent.succeeded') {
    await handlePaymentSucceeded(event.data.object as StripePaymentIntent, env);
  }

  return new Response('ok');
};

// ── main handler ──────────────────────────────────────────────────────────────

async function handlePaymentSucceeded(intent: StripePaymentIntent, env: Env) {
  const m = intent.metadata;
  const { customer_name, customer_email, customer_phone, address, date, slot_start, slot_end, notes } = m;

  // 1. Confirm booking
  const bookingResult = await env.DB.prepare(
    `UPDATE bookings SET stripe_status='paid', status='confirmed'
     WHERE stripe_payment_intent_id=? RETURNING id`
  )
    .bind(intent.id)
    .first<{ id: number }>();

  const bookingId = bookingResult?.id;

  // 2. Upsert customer
  const existing = await env.DB.prepare(
    `SELECT id FROM customers WHERE email=?`
  )
    .bind(customer_email)
    .first<{ id: number }>();

  let customerId: number;

  if (existing) {
    customerId = existing.id;
    await env.DB.prepare(
      `UPDATE customers SET name=?, phone=?, updated_at=datetime('now') WHERE id=?`
    )
      .bind(customer_name, customer_phone, customerId)
      .run();
  } else {
    const ins = await env.DB.prepare(
      `INSERT INTO customers (name, email, phone) VALUES (?,?,?) RETURNING id`
    )
      .bind(customer_name, customer_email, customer_phone)
      .first<{ id: number }>();
    customerId = ins!.id;
  }

  // Update booking with customer_id
  if (bookingId) {
    await env.DB.prepare(`UPDATE bookings SET customer_id=? WHERE id=?`)
      .bind(customerId, bookingId)
      .run();
  }

  // 3. Tag customer as safe_at_home
  const tag = await env.DB.prepare(
    `SELECT id FROM tags WHERE name='safe_at_home'`
  ).first<{ id: number }>();

  let tagId: number;
  if (tag) {
    tagId = tag.id;
  } else {
    const t = await env.DB.prepare(
      `INSERT INTO tags (name) VALUES ('safe_at_home') RETURNING id`
    ).first<{ id: number }>();
    tagId = t!.id;
  }

  await env.DB.prepare(
    `INSERT OR IGNORE INTO customer_tags (customer_id, tag_id) VALUES (?,?)`
  )
    .bind(customerId, tagId)
    .run();

  // 4. Create assessment row
  await env.DB.prepare(
    `INSERT INTO assessments (customer_id, booking_id, address, notes, assessed_at)
     VALUES (?,?,?,?,?)`
  )
    .bind(customerId, bookingId ?? null, address, notes || '', `${date}T${slot_start}:00`)
    .run();

  // 5. Google Calendar event
  let googleEventId: string | null = null;
  try {
    googleEventId = await createCalendarEvent(env, {
      summary: `Safe at Home Assessment – ${customer_name}`,
      description: `Customer: ${customer_name}\nPhone: ${customer_phone}\nAddress: ${address}\nNotes: ${notes || 'None'}`,
      date,
      startTime: slot_start,
      endTime: slot_end,
    });

    if (googleEventId && bookingId) {
      await env.DB.prepare(`UPDATE bookings SET google_event_id=? WHERE id=?`)
        .bind(googleEventId, bookingId)
        .run();
    }
  } catch (err) {
    console.error('Calendar error (non-fatal):', err);
  }

  // 6. Send emails
  const slotLabel = `${fmt(slot_start)} – ${fmt(slot_end)}`;
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  await Promise.allSettled([
    // Confirmation to customer
    sendEmail(env.RESEND_API_KEY, {
      from: env.FROM_EMAIL,
      to: customer_email,
      subject: 'Your Safe at Home Assessment is Confirmed',
      html: customerEmailHtml({ customer_name, dateLabel, slotLabel, address }),
    }),
    // Notification to John
    sendEmail(env.RESEND_API_KEY, {
      from: env.FROM_EMAIL,
      to: env.OWNER_EMAIL,
      subject: `New Booking: Safe at Home – ${customer_name} on ${dateLabel}`,
      html: ownerEmailHtml({ customer_name, customer_email, customer_phone, address, notes, dateLabel, slotLabel }),
    }),
  ]);
}

// ── Google Calendar ───────────────────────────────────────────────────────────

async function createCalendarEvent(
  env: Env,
  opts: { summary: string; description: string; date: string; startTime: string; endTime: string }
): Promise<string> {
  const accessToken = await getGoogleAccessToken(env);

  const event = {
    summary: opts.summary,
    description: opts.description,
    start: { dateTime: `${opts.date}T${opts.startTime}:00`, timeZone: 'America/Phoenix' },
    end: { dateTime: `${opts.date}T${opts.endTime}:00`, timeZone: 'America/Phoenix' },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'email', minutes: 1440 }, { method: 'popup', minutes: 60 }],
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env.GOOGLE_CALENDAR_ID)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Calendar API error: ${err}`);
  }

  const data = await res.json() as { id: string };
  return data.id;
}

/** Mint a Google OAuth2 access token from a service account using RS256 JWT */
async function getGoogleAccessToken(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Build JWT header.payload
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payload = btoa(JSON.stringify(claim)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const sigInput = `${header}.${payload}`;

  // Import PEM private key
  const pemKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const keyData = pemToBinary(pemKey);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(sigInput));
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${sigInput}.${sig}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json() as { access_token: string };
  return tokenData.access_token;
}

function pemToBinary(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

// ── Stripe webhook verification ───────────────────────────────────────────────

async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  try {
    const ts = header.split(',').find(p => p.startsWith('t='))?.split('=')[1];
    const v1 = header.split(',').find(p => p.startsWith('v1='))?.split('=')[1];
    if (!ts || !v1) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${payload}`));
    const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    return computed === v1;
  } catch {
    return false;
  }
}

// ── Email helpers ─────────────────────────────────────────────────────────────

async function sendEmail(apiKey: string, opts: { from: string; to: string; subject: string; html: string }) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });
}

function customerEmailHtml({ customer_name, dateLabel, slotLabel, address }: Record<string, string>) {
  return `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
  <h2 style="color:#d97706">Your Assessment is Confirmed ✓</h2>
  <p>Hi ${customer_name},</p>
  <p>We've confirmed your <strong>Safe at Home Assessment</strong>. Here are your details:</p>
  <table style="border-collapse:collapse;width:100%;margin:16px 0">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Date</td><td style="padding:8px;border-bottom:1px solid #eee"><strong>${dateLabel}</strong></td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Time</td><td style="padding:8px;border-bottom:1px solid #eee"><strong>${slotLabel}</strong></td></tr>
    <tr><td style="padding:8px;color:#666">Address</td><td style="padding:8px"><strong>${address}</strong></td></tr>
  </table>
  <p>Our technician will arrive during your window. You'll receive a call 30 minutes before arrival.</p>
  <p>Questions? Reply to this email or call <a href="tel:+15205550100">(520) 555-0100</a>.</p>
  <p style="margin-top:32px;color:#666;font-size:14px">— Tucson Handyman Pro</p>
</div>`;
}

function ownerEmailHtml(data: Record<string, string>) {
  return `
<div style="font-family:sans-serif;max-width:560px;color:#1a1a1a">
  <h2>New Safe at Home Booking</h2>
  <table style="border-collapse:collapse;width:100%">
    <tr><td style="padding:6px;color:#666;border-bottom:1px solid #eee">Name</td><td style="padding:6px;border-bottom:1px solid #eee">${data.customer_name}</td></tr>
    <tr><td style="padding:6px;color:#666;border-bottom:1px solid #eee">Email</td><td style="padding:6px;border-bottom:1px solid #eee">${data.customer_email}</td></tr>
    <tr><td style="padding:6px;color:#666;border-bottom:1px solid #eee">Phone</td><td style="padding:6px;border-bottom:1px solid #eee">${data.customer_phone}</td></tr>
    <tr><td style="padding:6px;color:#666;border-bottom:1px solid #eee">Address</td><td style="padding:6px;border-bottom:1px solid #eee">${data.address}</td></tr>
    <tr><td style="padding:6px;color:#666;border-bottom:1px solid #eee">Date</td><td style="padding:6px;border-bottom:1px solid #eee">${data.dateLabel}</td></tr>
    <tr><td style="padding:6px;color:#666;border-bottom:1px solid #eee">Time</td><td style="padding:6px;border-bottom:1px solid #eee">${data.slotLabel}</td></tr>
    <tr><td style="padding:6px;color:#666">Notes</td><td style="padding:6px">${data.notes || '—'}</td></tr>
  </table>
</div>`;
}

// ── Formatting ────────────────────────────────────────────────────────────────

function fmt(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface StripeEvent {
  type: string;
  data: { object: unknown };
}

interface StripePaymentIntent {
  id: string;
  metadata: Record<string, string>;
}
