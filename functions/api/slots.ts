/**
 * GET /api/slots?date=YYYY-MM-DD
 * Returns available 2.5-hour slots for a given date.
 *
 * Fixed slots:
 *   08:30 – 11:00  (morning)
 *   12:00 – 14:30  (afternoon)
 *
 * Pending bookings expire after 15 minutes.
 * Max 2 confirmed bookings per day.
 *
 * Future: add provider support by filtering on provider_id.
 */

import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

const SLOT_DURATION_MINUTES = 150; // 2.5 hours
const PENDING_EXPIRY_MINUTES = 15;

// Fixed slot start times. Adjust here when adding providers or distance-aware scheduling.
const ALL_SLOTS = ['08:30', '12:00'];
// 08:30 → 11:00  |  12:00 → 14:30  (1hr gap = natural buffer between jobs)

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: 'date param required (YYYY-MM-DD)' }, 400);
  }

  // Reject past dates
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    return json({ slots: [] });
  }

  // Fetch active bookings for this date:
  // - paid/confirmed always block
  // - pending only blocks if created within the last 15 minutes
  const { results } = await env.DB.prepare(
    `SELECT slot_start FROM bookings
     WHERE slot_date = ?
       AND status != 'cancelled'
       AND (
         stripe_status = 'paid'
         OR created_at > datetime('now', '-${PENDING_EXPIRY_MINUTES} minutes')
       )`
  )
    .bind(date)
    .all<{ slot_start: string }>();

  const booked = new Set(results.map((r) => r.slot_start));

  // Max 2 confirmed bookings per day
  if (booked.size >= 2) {
    return json({ slots: [] });
  }

  const available = ALL_SLOTS.filter((s) => !booked.has(s)).map((start) => ({
    start,
    end: addMinutes(start, SLOT_DURATION_MINUTES),
    label: `${fmt(start)} – ${fmt(addMinutes(start, SLOT_DURATION_MINUTES))}`,
  }));

  return json({ date, slots: available });
};

// ── helpers ──────────────────────────────────────────────────────────────────

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function fmt(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
