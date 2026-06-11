import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

const METHODS = ['Bank Transfer', 'UPI', 'PayPal', 'EMI', 'Other'];

const EMPTY = {
  studentId:      '',
  date:           '',
  amountUSD:      '',
  exchangeRate:   '83',
  method:         'Bank Transfer',
  bankCharge:     '',
  gatewayFee:     '',
  otherDeduction: '',
  note:           '',
};

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50
        placeholder:text-slate-400 outline-none transition-all
        focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 ${className}`}
      {...props}
    />
  );
}

function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50
        outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20
        focus:border-indigo-400 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

/**
 * Props:
 *   students  — all students array (for student selector)
 *   pre       — pre-selected student object | null
 *   initial   — payment object for edit mode | null
 *   liveRate  — number | null
 *   onClose   — fn()
 *   onSave    — fn(formData)
 */
export default function PaymentModal({ students, pre, initial, liveRate, onClose, onSave }) {
  const isEdit = !!initial;

  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (isEdit && initial) {
      // Edit mode — prefill from existing payment
      setForm({
        studentId:      initial.studentId?._id || initial.studentId || '',
        date:           initial.date           || todayStr,
        amountUSD:      initial.amountUSD      ?? '',
        exchangeRate:   initial.exchangeRate   ?? '83',
        method:         initial.method         || 'Bank Transfer',
        bankCharge:     initial.bankCharge     ?? '',
        gatewayFee:     initial.gatewayFee     ?? '',
        otherDeduction: initial.otherDeduction ?? '',
        note:           initial.note           || '',
      });
    } else {
      // Add mode
      setForm({
        ...EMPTY,
        date:         todayStr,
        studentId:    pre?._id || '',
        exchangeRate: liveRate ? liveRate.toFixed(2) : '83',
      });
    }
  }, [initial, pre, liveRate]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.studentId)                                           e.studentId    = 'Select a student';
    if (!form.date)                                                e.date         = 'Required';
    if (!form.amountUSD || isNaN(+form.amountUSD) || +form.amountUSD <= 0)
                                                                   e.amountUSD    = 'Must be > 0';
    if (!form.exchangeRate || isNaN(+form.exchangeRate) || +form.exchangeRate <= 0)
                                                                   e.exchangeRate = 'Must be > 0';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      setSaving(true);
      await onSave({
        studentId:      form.studentId,
        date:           form.date,
        amountUSD:      Number(form.amountUSD),
        exchangeRate:   Number(form.exchangeRate),
        method:         form.method,
        bankCharge:     Number(form.bankCharge)     || 0,
        gatewayFee:     Number(form.gatewayFee)     || 0,
        otherDeduction: Number(form.otherDeduction) || 0,
        note:           form.note.trim(),
        ...(isEdit && { _id: initial._id }),
      });
    } finally {
      setSaving(false);
    }
  };

  // Live INR estimate
  const netUSD =
    Number(form.amountUSD || 0) -
    Number(form.bankCharge || 0) -
    Number(form.gatewayFee || 0) -
    Number(form.otherDeduction || 0);
  const netINR = netUSD * Number(form.exchangeRate || 0);

  const selectedStudent = students?.find((s) => s._id === form.studentId);

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit Payment' : 'Record Payment'}
      size="md"
    >
      <div className="space-y-5">

        {/* ── Student selector ──────────────────── */}
        <Field label="Student *" error={errors.studentId}>
          <Select
            value={form.studentId}
            onChange={(e) => set('studentId', e.target.value)}
            disabled={!!pre || isEdit}
          >
            <option value="">Select student…</option>
            {students?.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} — {s.university}
              </option>
            ))}
          </Select>
          {selectedStudent && (
            <p className="text-[11px] text-indigo-500 mt-0.5">
              {selectedStudent.region} · {selectedStudent.program}
            </p>
          )}
        </Field>

        {/* ── Date + Method ─────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Payment Date *" error={errors.date}>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </Field>
          <Field label="Method">
            <Select value={form.method} onChange={(e) => set('method', e.target.value)}>
              {METHODS.map((m) => <option key={m}>{m}</option>)}
            </Select>
          </Field>
        </div>

        {/* ── Amount + Rate ──────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (USD) *" error={errors.amountUSD}>
            <Input
              type="number"
              value={form.amountUSD}
              onChange={(e) => set('amountUSD', e.target.value)}
              placeholder="500"
            />
          </Field>
          <Field label="Exchange Rate (₹/USD) *" error={errors.exchangeRate}>
            <div className="relative">
              <Input
                type="number"
                value={form.exchangeRate}
                onChange={(e) => set('exchangeRate', e.target.value)}
                placeholder="83"
                className="w-full"
              />
              {liveRate && (
                <button
                  type="button"
                  onClick={() => set('exchangeRate', liveRate.toFixed(2))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold
                    text-indigo-500 hover:text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded"
                >
                  Live ₹{liveRate.toFixed(1)}
                </button>
              )}
            </div>
          </Field>
        </div>

        {/* ── Deductions ────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Deductions (optional)
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Bank Charge">
              <Input
                type="number"
                value={form.bankCharge}
                onChange={(e) => set('bankCharge', e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Gateway Fee">
              <Input
                type="number"
                value={form.gatewayFee}
                onChange={(e) => set('gatewayFee', e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Other">
              <Input
                type="number"
                value={form.otherDeduction}
                onChange={(e) => set('otherDeduction', e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>
        </div>

        {/* ── Net summary pill ──────────────────── */}
        {form.amountUSD && Number(form.amountUSD) > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3
            flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
                Net Received
              </p>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">
                ${netUSD.toFixed(2)}
              </p>
            </div>
            {netINR > 0 && (
              <div className="text-right">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
                  In INR
                </p>
                <p className="text-lg font-bold text-emerald-700 mt-0.5">
                  ₹{Math.round(netINR).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Note ──────────────────────────────── */}
        <Field label="Note (optional)">
          <Input
            type="text"
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="e.g. Second installment"
          />
        </Field>

        {/* ── Actions ───────────────────────────── */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100
              rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-lg
              hover:bg-indigo-600 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3"
                  strokeDasharray="32" strokeDashoffset="12"/>
              </svg>
            )}
            {isEdit ? 'Save Changes' : 'Record Payment'}
          </button>
        </div>

      </div>
    </Modal>
  );
}