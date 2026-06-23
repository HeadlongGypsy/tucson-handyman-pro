/**
 * GET /api/slots?date=YYYY-MM-DD
 * Returns available 2.5-hour slots for a given date.
 * Business hours: 8:30 AM – 4:00 PM (last slot starts 1:30 PM)
 * Max 2 bookings per day.
 */

import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

const SLOT_DURATION_MINUTES = 150; // 2.5 hours

// All possible slot start times (HH:MM) within 8:30–16:00
const ALL_SLOTS = ['08:30', '11:00', '13:30'];
// 13:30 + 2.5hr = 16:00 exactly ✓

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

  // Fetch confirmed/pending bookings for this date
  const { results } = await env.DB.prepare(
    `SELECT slot_start FROM bookings
     WHERE slot_date = ? AND status != 'cancelled'`
  )
    .bind(date)
    .all<{ slot_start: string }>();

  const booked = new Set(results.map((r) => r.slot_start));

  // Max 2 bookings per day
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
