/**
 * POST /api/create-payment-intent
 * Creates a Stripe PaymentIntent for a Safe at Home assessment booking.
 * Returns { clientSecret } to the frontend.
 *
 * Body: { name, email, phone, address, notes, date, slotStart, slotEnd }
 */

import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
}

const ASSESSMENT_PRICE_CENTS = 9900; // $99.00 — update as needed

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { name, email, phone, address, notes, date, slotStart, slotEnd } = body;

  if (!name || !email || !phone || !address || !date || !slotStart || !slotEnd) {
    return json({ error: 'Missing required fields' }, 400);
  }

  // Re-check slot availability (race-condition guard)
  const { results } = await env.DB.prepare(
    `SELECT id FROM bookings WHERE slot_date = ? AND slot_start = ? AND status != 'cancelled'`
  )
    .bind(date, slotStart)
    .all();

  if (results.length > 0) {
    return json({ error: 'That slot was just taken. Please pick another time.' }, 409);
  }

  // Also enforce max 2/day
  const { results: dayResults } = await env.DB.prepare(
    `SELECT id FROM bookings WHERE slot_date = ? AND status != 'cancelled'`
  )
    .bind(date)
    .all();

  if (dayResults.length >= 2) {
    return json({ error: 'No more slots available on that date.' }, 409);
  }

  // Create Stripe PaymentIntent
  const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: String(ASSESSMENT_PRICE_CENTS),
      currency: 'usd',
      'metadata[customer_name]': name,
      'metadata[customer_email]': email,
      'metadata[customer_phone]': phone,
      'metadata[address]': address,
      'metadata[date]': date,
      'metadata[slot_start]': slotStart,
      'metadata[slot_end]': slotEnd,
      'metadata[notes]': notes || '',
      description: `Safe at Home Assessment – ${date} ${slotStart}`,
    }),
  });

  if (!stripeRes.ok) {
    const err = await stripeRes.json() as { error?: { message?: string } };
    console.error('Stripe error', err);
    return json({ error: err?.error?.message || 'Payment setup failed' }, 500);
  }

  const intent = await stripeRes.json() as { id: string; client_secret: string };

  // Save a PENDING booking row immediately so the slot shows as held
  await env.DB.prepare(
    `INSERT INTO bookings
       (service, slot_date, slot_start, slot_end, address, notes,
        stripe_payment_intent_id, stripe_status, amount_cents, status)
     VALUES ('safe_at_home_assessment', ?, ?, ?, ?, ?, ?, 'pending', ?, 'pending')`
  )
    .bind(date, slotStart, slotEnd, address, notes || '', intent.id, ASSESSMENT_PRICE_CENTS)
    .run();

  return json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
