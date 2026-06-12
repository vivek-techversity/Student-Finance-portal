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

// ── Warm neutral design tokens (matches StudentModal exactly) ─────────────────
const T = {
  inputBg:          '#F5F3F0',
  inputBorder:      '#D9D5D0',
  inputFocusBorder: '#1C1917',
  inputFocusShadow: '0 0 0 3px rgba(28,25,23,0.08)',
  inputText:        '#1C1917',
  sectionBg:        '#FAFAF9',
  sectionBorder:    '#E7E4E0',
  labelColor:       '#A8A29E',
  divider:          '#E7E4E0',
  cancelBg:         '#EAE8E4',
  cancelText:       '#78716C',
  saveBg:           '#1C1917',
  saveHover:        '#292524',
};

const inputBase = {
  border: `1px solid ${T.inputBorder}`,
  borderRadius: '10px',
  padding: '9px 12px',
  fontSize: '13px',
  color: T.inputText,
  background: T.inputBg,
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
};

// ── Styled Input ──────────────────────────────────────────────────────────────
function StyledInput({ style = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{
        ...inputBase,
        ...(focused ? { borderColor: T.inputFocusBorder, boxShadow: T.inputFocusShadow, background: '#fff' } : {}),
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

// ── Styled Select ─────────────────────────────────────────────────────────────
function StyledSelect({ children, style = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      style={{
        ...inputBase,
        cursor: 'pointer',
        ...(focused ? { borderColor: T.inputFocusBorder, boxShadow: T.inputFocusShadow, background: '#fff' } : {}),
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    >
      {children}
    </select>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: 500, color: T.labelColor, letterSpacing: '0.01em' }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: '11px', color: '#EF4444' }}>{error}</p>}
    </div>
  );
}

// ── Section Label (matches StudentModal) ──────────────────────────────────────
function SectionLabel({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
      <div style={{
        width: '22px', height: '22px', borderRadius: '6px',
        background: '#EAE8E4', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#57534E', flexShrink: 0,
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '10px', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {children}
      </p>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const StudentIcon = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const PayIcon     = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const DeductIcon  = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const NoteIcon    = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;

/**
 * Props:
 *   students  — all students array
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
    if (!form.studentId)                                            e.studentId    = 'Select a student';
    if (!form.date)                                                 e.date         = 'Required';
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

  // Live calculations
  const netUSD =
    Number(form.amountUSD || 0) -
    Number(form.bankCharge || 0) -
    Number(form.gatewayFee || 0) -
    Number(form.otherDeduction || 0);
  const netINR = netUSD * Number(form.exchangeRate || 0);

  const selectedStudent = students?.find((s) => s._id === form.studentId);

  const sectionStyle = {
    background: T.sectionBg,
    border: `1px solid ${T.sectionBorder}`,
    borderRadius: '14px',
    padding: '16px',
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit Payment' : 'Record Payment'}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* ── Student ──────────────────────────────────── */}
        <div style={sectionStyle}>
          <SectionLabel icon={StudentIcon}>Student</SectionLabel>
          <Field label="Student *" error={errors.studentId}>
            <StyledSelect
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
            </StyledSelect>
            {selectedStudent && (
              <p style={{ fontSize: '11px', color: '#6366F1', marginTop: '2px' }}>
                {selectedStudent.region} · {selectedStudent.program}
              </p>
            )}
          </Field>
        </div>

        {/* ── Payment Details ───────────────────────────── */}
        <div style={sectionStyle}>
          <SectionLabel icon={PayIcon}>Payment Details</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Payment Date *" error={errors.date}>
              <StyledInput
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </Field>
            <Field label="Method">
              <StyledSelect value={form.method} onChange={(e) => set('method', e.target.value)}>
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </StyledSelect>
            </Field>
            <Field label="Amount (USD) *" error={errors.amountUSD}>
              <StyledInput
                type="number"
                value={form.amountUSD}
                onChange={(e) => set('amountUSD', e.target.value)}
                placeholder="500"
              />
            </Field>
            <Field label="Exchange Rate (₹/USD) *" error={errors.exchangeRate}>
              <div style={{ position: 'relative' }}>
                <StyledInput
                  type="number"
                  value={form.exchangeRate}
                  onChange={(e) => set('exchangeRate', e.target.value)}
                  placeholder="83"
                  style={{ paddingRight: liveRate ? '80px' : undefined }}
                />
                {liveRate && (
                  <button
                    type="button"
                    onClick={() => set('exchangeRate', liveRate.toFixed(2))}
                    style={{
                      position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '10px', fontWeight: 700, color: '#57534E', background: '#EAE8E4',
                      border: 'none', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer',
                    }}
                  >
                    Live ₹{liveRate.toFixed(1)}
                  </button>
                )}
              </div>
            </Field>
          </div>
        </div>

        {/* ── Deductions ────────────────────────────────── */}
        <div style={{ ...sectionStyle, background: '#F9F8F7', borderColor: '#E0DDD9' }}>
          <SectionLabel icon={DeductIcon}>Deductions (Optional)</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Field label="Bank Charge">
              <StyledInput
                type="number"
                value={form.bankCharge}
                onChange={(e) => set('bankCharge', e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Gateway Fee">
              <StyledInput
                type="number"
                value={form.gatewayFee}
                onChange={(e) => set('gatewayFee', e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Other">
              <StyledInput
                type="number"
                value={form.otherDeduction}
                onChange={(e) => set('otherDeduction', e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>
        </div>

        {/* ── Net summary ───────────────────────────────── */}
        {form.amountUSD && Number(form.amountUSD) > 0 && (
          <div style={{
            borderRadius: '14px', overflow: 'hidden',
            border: `1px solid ${T.divider}`,
          }}>
            <div style={{ padding: '10px 16px', background: '#1C1917' }}>
              <p style={{ fontSize: '10px', fontWeight: 800, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Net Summary
              </p>
            </div>
            <div style={{ padding: '12px 16px', background: T.sectionBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '11px', color: T.labelColor, marginBottom: '2px' }}>Net Received (USD)</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#10B981', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  ${netUSD.toFixed(2)}
                </p>
              </div>
              {netINR > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: T.labelColor, marginBottom: '2px' }}>In INR</p>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: '#10B981', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                    ₹{Math.round(netINR).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Note ──────────────────────────────────────── */}
        <div style={sectionStyle}>
          <SectionLabel icon={NoteIcon}>Note (Optional)</SectionLabel>
          <Field label="Note">
            <StyledInput
              type="text"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              placeholder="e.g. Second installment"
            />
          </Field>
        </div>

        {/* ── Actions ───────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px', fontSize: '13px', fontWeight: 600,
              color: T.cancelText, background: T.cancelBg, border: 'none',
              borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E0DDD9'}
            onMouseLeave={e => e.currentTarget.style.background = T.cancelBg}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '9px 22px', fontSize: '13px', fontWeight: 700,
              color: 'white', border: 'none', borderRadius: '10px',
              cursor: saving ? 'not-allowed' : 'pointer',
              background: saving ? '#78716C' : T.saveBg,
              opacity: saving ? 0.7 : 1,
              transition: 'background 0.15s',
              display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = T.saveHover; }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = T.saveBg; }}
          >
            {saving && (
              <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/>
              </svg>
            )}
            {isEdit ? 'Save Changes' : 'Record Payment'}
          </button>
        </div>

      </div>
    </Modal>
  );
}