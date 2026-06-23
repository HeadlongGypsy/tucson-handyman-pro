/**
 * SafeAtHomeBooking.tsx
 *
 * Full booking flow for Safe at Home Assessment:
 *   Step 1 – Pick a date
 *   Step 2 – Pick an available slot
 *   Step 3 – Fill in details
 *   Step 4 – Pay with Stripe (Stripe.js / Payment Element)
 *   Step 5 – Confirmation
 *
 * Required: loadStripe from @stripe/stripe-js + @stripe/react-stripe-js
 * Install:  npm install @stripe/stripe-js @stripe/react-stripe-js
 *
 * Usage:
 *   <SafeAtHomeBooking stripePublishableKey="pk_live_..." />
 */

import { useState, useEffect, useCallback } from 'react';
import {
  loadStripe,
  type Stripe,
  type StripeElements,
} from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Slot {
  start: string;
  end: string;
  label: string;
}

interface BookingForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

type Step = 'date' | 'slot' | 'details' | 'payment' | 'confirmation';

interface Props {
  stripePublishableKey: string;
}

// ── Root component ────────────────────────────────────────────────────────────

export default function SafeAtHomeBooking({ stripePublishableKey }: Props) {
  const [stripePromise] = useState(() => loadStripe(stripePublishableKey));
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState<BookingForm>({ name: '', email: '', phone: '', address: '', notes: '' });
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  const handleDateSelected = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep('slot');
  };

  const handleSlotSelected = (slot: Slot) => {
    setSelectedSlot(slot);
    setStep('details');
  };

  const handleDetailsSubmit = async (formData: BookingForm) => {
    setForm(formData);
    setError('');

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
          slotStart: selectedSlot!.start,
          slotEnd: selectedSlot!.end,
        }),
      });

      const data = await res.json() as { clientSecret?: string; error?: string };
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setClientSecret(data.clientSecret!);
      setStep('payment');
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="sah-booking">
      <ProgressBar step={step} />

      {step === 'date' && (
        <DatePicker onSelect={handleDateSelected} />
      )}
      {step === 'slot' && (
        <SlotPicker
          date={selectedDate}
          onSelect={handleSlotSelected}
          onBack={() => setStep('date')}
        />
      )}
      {step === 'details' && (
        <DetailsForm
          initial={form}
          date={selectedDate}
          slot={selectedSlot!}
          onSubmit={handleDetailsSubmit}
          onBack={() => setStep('slot')}
          error={error}
        />
      )}
      {step === 'payment' && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
          <PaymentStep
            form={form}
            date={selectedDate}
            slot={selectedSlot!}
            onSuccess={() => setStep('confirmation')}
            onBack={() => setStep('details')}
          />
        </Elements>
      )}
      {step === 'confirmation' && (
        <Confirmation form={form} date={selectedDate} slot={selectedSlot!} />
      )}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

const STEPS: { id: Step; label: string }[] = [
  { id: 'date', label: 'Date' },
  { id: 'slot', label: 'Time' },
  { id: 'details', label: 'Details' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirmation', label: 'Done' },
];

function ProgressBar({ step }: { step: Step }) {
  const current = STEPS.findIndex(s => s.id === step);
  return (
    <div className="sah-progress">
      {STEPS.map((s, i) => (
        <div key={s.id} className={`sah-progress-step ${i <= current ? 'active' : ''}`}>
          <div className="sah-progress-dot">{i < current ? '✓' : i + 1}</div>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Date picker ───────────────────────────────────────────────────────

function DatePicker({ onSelect }: { onSelect: (date: string) => void }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const todayStr = today.toISOString().slice(0, 10);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isBeforeToday = viewYear < today.getFullYear() || (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  return (
    <div className="sah-step">
      <h3>Choose a Date</h3>
      <p className="sah-subtitle">Select a day for your Safe at Home Assessment</p>

      <div className="sah-calendar">
        <div className="sah-cal-header">
          <button onClick={prevMonth} disabled={isBeforeToday} className="sah-cal-nav">‹</button>
          <strong>{monthLabel}</strong>
          <button onClick={nextMonth} className="sah-cal-nav">›</button>
        </div>
        <div className="sah-cal-grid">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="sah-cal-dow">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isWeekend = new Date(viewYear, viewMonth, day).getDay() % 6 === 0;
            const isPast = dateStr < todayStr;
            const disabled = isWeekend || isPast;
            return (
              <button
                key={day}
                className={`sah-cal-day ${disabled ? 'disabled' : 'available'}`}
                disabled={disabled}
                onClick={() => onSelect(dateStr)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
      <p className="sah-hint">Monday – Friday only. Weekends unavailable.</p>
    </div>
  );
}

// ── Step 2: Slot picker ───────────────────────────────────────────────────────

function SlotPicker({ date, onSelect, onBack }: { date: string; onSelect: (slot: Slot) => void; onBack: () => void }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/slots?date=${date}`)
      .then(r => r.json())
      .then((data: { slots: Slot[] }) => { setSlots(data.slots); setLoading(false); })
      .catch(() => { setError('Could not load availability. Please try again.'); setLoading(false); });
  }, [date]);

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="sah-step">
      <h3>Choose a Time</h3>
      <p className="sah-subtitle">{dateLabel}</p>

      {loading && <div className="sah-loading">Checking availability…</div>}
      {error && <div className="sah-error">{error}</div>}
      {!loading && !error && slots.length === 0 && (
        <div className="sah-empty">
          <p>No slots available on this date.</p>
          <button className="sah-btn-secondary" onClick={onBack}>Pick a different day</button>
        </div>
      )}
      {!loading && slots.length > 0 && (
        <div className="sah-slots">
          {slots.map(slot => (
            <button key={slot.start} className="sah-slot" onClick={() => onSelect(slot)}>
              <span className="sah-slot-label">{slot.label}</span>
              <span className="sah-slot-duration">2.5 hours</span>
            </button>
          ))}
        </div>
      )}

      <button className="sah-btn-back" onClick={onBack}>← Back</button>
    </div>
  );
}

// ── Step 3: Details form ──────────────────────────────────────────────────────

function DetailsForm({
  initial, date, slot, onSubmit, onBack, error
}: {
  initial: BookingForm;
  date: string;
  slot: Slot;
  onSubmit: (form: BookingForm) => Promise<void>;
  onBack: () => void;
  error: string;
}) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<BookingForm>>({});

  const set = (field: keyof BookingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = (): boolean => {
    const errs: Partial<BookingForm> = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) errs.phone = '10-digit phone required';
    if (!form.address.trim()) errs.address = 'Required';
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="sah-step">
      <h3>Your Information</h3>
      <div className="sah-booking-summary">
        <strong>{dateLabel}</strong> · {slot.label}
      </div>

      <div className="sah-field">
        <label>Full Name *</label>
        <input value={form.name} onChange={set('name')} placeholder="Jane Smith" />
        {validationErrors.name && <span className="sah-field-error">{validationErrors.name}</span>}
      </div>
      <div className="sah-field">
        <label>Email *</label>
        <input type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" />
        {validationErrors.email && <span className="sah-field-error">{validationErrors.email}</span>}
      </div>
      <div className="sah-field">
        <label>Phone *</label>
        <input type="tel" value={form.phone} onChange={set('phone')} placeholder="(520) 555-0100" />
        {validationErrors.phone && <span className="sah-field-error">{validationErrors.phone}</span>}
      </div>
      <div className="sah-field">
        <label>Service Address *</label>
        <input value={form.address} onChange={set('address')} placeholder="123 Main St, Tucson, AZ 85701" />
        {validationErrors.address && <span className="sah-field-error">{validationErrors.address}</span>}
      </div>
      <div className="sah-field">
        <label>Notes <span className="sah-optional">(optional)</span></label>
        <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Anything we should know before we arrive?" />
      </div>

      {error && <div className="sah-error">{error}</div>}

      <div className="sah-price-notice">
        Assessment fee: <strong>$99.00</strong> — collected to confirm your booking.
      </div>

      <div className="sah-actions">
        <button className="sah-btn-back" onClick={onBack}>← Back</button>
        <button className="sah-btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Setting up payment…' : 'Continue to Payment →'}
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Stripe Payment ────────────────────────────────────────────────────

function PaymentStep({
  form, date, slot, onSuccess, onBack
}: {
  form: BookingForm;
  date: string;
  slot: Slot;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message ?? 'Payment error');
      setLoading(false);
      return;
    }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking-confirmed`,
        payment_method_data: {
          billing_details: { name: form.name, email: form.email, phone: form.phone },
        },
      },
      redirect: 'if_required',
    });

    if (confirmErr) {
      setError(confirmErr.message ?? 'Payment failed');
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="sah-step">
      <h3>Payment</h3>
      <div className="sah-booking-summary">
        <strong>{dateLabel}</strong> · {slot.label}<br />
        <span>{form.name} · {form.address}</span>
      </div>

      <div className="sah-payment-element">
        <PaymentElement />
      </div>

      {error && <div className="sah-error">{error}</div>}

      <div className="sah-price-row">
        <span>Safe at Home Assessment</span>
        <strong>$99.00</strong>
      </div>

      <div className="sah-actions">
        <button className="sah-btn-back" onClick={onBack} disabled={loading}>← Back</button>
        <button className="sah-btn-primary" onClick={handlePay} disabled={loading || !stripe}>
          {loading ? 'Processing…' : 'Pay $99 & Confirm →'}
        </button>
      </div>
    </div>
  );
}

// ── Step 5: Confirmation ──────────────────────────────────────────────────────

function Confirmation({ form, date, slot }: { form: BookingForm; date: string; slot: Slot }) {
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="sah-step sah-confirmation">
      <div className="sah-check">✓</div>
      <h3>You're on the schedule!</h3>
      <p>A confirmation email is on its way to <strong>{form.email}</strong>.</p>

      <div className="sah-confirm-details">
        <div><span>Date</span><strong>{dateLabel}</strong></div>
        <div><span>Time</span><strong>{slot.label}</strong></div>
        <div><span>Address</span><strong>{form.address}</strong></div>
      </div>

      <p className="sah-hint">Our technician will call 30 minutes before arriving. Questions? Call <a href="tel:+15205550100">(520) 555-0100</a>.</p>
    </div>
  );
}

// ── Stripe appearance ─────────────────────────────────────────────────────────

const stripeAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#d97706',
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '8px',
  },
};
