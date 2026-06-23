-- Safe at Home: assessments + bookings tables
-- Run: wrangler d1 execute tucson-handyman-db --file=migrations/0002_safe_at_home.sql

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customers(id),
  booking_id INTEGER REFERENCES bookings(id),
  address TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled | completed | cancelled
  assessed_at TEXT,                          -- ISO datetime of the appointment
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customers(id),
  service TEXT NOT NULL DEFAULT 'safe_at_home_assessment',
  slot_date TEXT NOT NULL,          -- YYYY-MM-DD
  slot_start TEXT NOT NULL,         -- HH:MM  e.g. "08:30"
  slot_end TEXT NOT NULL,           -- HH:MM  e.g. "11:00"
  address TEXT NOT NULL,
  notes TEXT,
  stripe_payment_intent_id TEXT,
  stripe_status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | refunded
  amount_cents INTEGER NOT NULL DEFAULT 0,
  google_event_id TEXT,             -- Calendar event ID for later cancellation
  status TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_date, slot_start);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_assessments_booking ON assessments(booking_id);
