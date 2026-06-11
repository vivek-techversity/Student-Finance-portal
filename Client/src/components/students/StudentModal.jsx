import { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';

const EMPTY = {
  name: '', email: '', phone: '', registrationDate: '',
  region: '', program: '', university: '',
  journeyStatus: 'Admission',
  totalFee: '', exchangeRate: '83',
  uniFee: '', consultantComm: '', thesisCost: '', shipmentCost: '',
  initPayAmt: '', initPayMethod: 'Bank Transfer',
  initBankCharge: '', initGatewayFee: '', initOtherDed: '',
};

// All world countries
const REGIONS = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin',
  'Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia',
  'Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica',
  'Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini',
  'Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada',
  'Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia',
  'Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati',
  'Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania',
  'Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania',
  'Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique',
  'Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea',
  'North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay',
  'Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis',
  'Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe',
  'Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia',
  'Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan',
  'Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste',
  'Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine',
  'United Arab Emirates','UK','USA','Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela',
  'Vietnam','Yemen','Zambia','Zimbabwe',
];
const PROGRAMS = [
  'PhD Programs',
  'DBA Programs',
  'EdD Programs',
  'Honorary Doctorate',
  'Honorary Professorship',
  'Executive Education',
  'Certification Programs',
];
const METHODS  = ['Bank Transfer', 'UPI', 'PayPal', 'EMI'];
const JOURNEY_STAGES = ['Admission', 'Activation', 'Learning', 'Research', 'Submission', 'Conferment', 'Alumni', 'Ghost', 'Refund', 'Admission Cancelled'];

const inputStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '9px 12px',
  fontSize: '13px',
  color: '#1e293b',
  background: '#f8fafc',
  outline: 'none',
  width: '100%',
  transition: 'all 0.15s',
  fontFamily: 'inherit',
};

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: '11px', color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

function StyledInput({ className = '', style = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{
        ...inputStyle,
        ...(focused ? { background: 'white', borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' } : {}),
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

function StyledSelect({ children, style = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      style={{
        ...inputStyle,
        cursor: 'pointer',
        ...(focused ? { background: 'white', borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' } : {}),
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

// ── SearchableCountry ────────────────────────────────────────────────────────
function SearchableCountry({ value, onChange, error }) {
  const [query, setQuery]       = useState('');
  const [open, setOpen]         = useState(false);
  const [focused, setFocused]   = useState(false);
  const wrapRef                 = useState(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return REGIONS;
    const q = query.toLowerCase();
    return REGIONS.filter(c => c.toLowerCase().includes(q));
  }, [query]);

  const select = (country) => {
    onChange(country);
    setQuery('');
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        ...inputStyle,
        display: 'flex', alignItems: 'center', gap: '6px',
        cursor: 'text', padding: '0',
        ...(focused ? { background: 'white', borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' } : {}),
        ...(error ? { borderColor: '#ef4444' } : {}),
      }}
        onClick={() => { setOpen(true); }}
      >
        {value && !open ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 12px' }}>
            <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>{value}</span>
            <button type="button" onClick={e => { e.stopPropagation(); onChange(''); setQuery(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px', padding: '0', lineHeight: 1 }}>✕</button>
          </div>
        ) : (
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => { setFocused(true); setOpen(true); }}
            onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150); }}
            placeholder={value || 'Search country…'}
            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '13px', color: '#1e293b', fontFamily: 'inherit', padding: '9px 12px' }}
          />
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 999,
          background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '200px', overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '12px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>No country found</div>
          ) : (
            filtered.map(country => (
              <div key={country}
                onMouseDown={() => select(country)}
                style={{
                  padding: '8px 12px', fontSize: '13px', cursor: 'pointer',
                  color: country === value ? '#6366f1' : '#1e293b',
                  fontWeight: country === value ? 700 : 400,
                  background: country === value ? 'rgba(99,102,241,0.06)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = country === value ? 'rgba(99,102,241,0.06)' : 'transparent'}
              >
                {country}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

// ── NEW: SelectWithOther ─────────────────────────────────────────────────────
// Jab "Other" select ho → ek custom text input slide in ho jaata hai
function SelectWithOther({ value, onChange, options, placeholder, inputPlaceholder = 'Type custom value...' }) {
  // Agar edit mode mein value standard options mein nahi hai → automatically "Other" mode
  const isCustomValue = value !== '' && !options.includes(value);
  const [otherMode, setOtherMode] = useState(isCustomValue);

  // Edit mode: jab initial value load ho (useEffect from parent) → sync karo
  useEffect(() => {
    if (value !== '' && !options.includes(value)) {
      setOtherMode(true);
    }
  }, []); // only on mount

  // Dropdown mein kya dikhao
  const dropdownValue = otherMode ? '__other__' : (value || '');

  const handleDropdown = (e) => {
    if (e.target.value === '__other__') {
      setOtherMode(true);
      onChange(''); // custom input blank se shuru
    } else {
      setOtherMode(false);
      onChange(e.target.value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <StyledSelect value={dropdownValue} onChange={handleDropdown}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__other__">Other</option>
      </StyledSelect>

      {/* Custom input — smoothly appear karta hai */}
      {otherMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          animation: 'slideDown 0.18s ease-out',
        }}>
          <StyledInput
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={inputPlaceholder}
            autoFocus
            style={{ flex: 1 }}
          />
          {/* X button — wapas dropdown pe jaao */}
          <button
            type="button"
            onClick={() => { setOtherMode(false); onChange(''); }}
            title="Cancel custom"
            style={{
              flexShrink: 0,
              width: '30px', height: '30px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

// ── Stage Colors ─────────────────────────────────────────────────────────────
const STAGE_COLORS = {
  'Admission':   { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', dot: '#3b82f6' },
  'Activation':  { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', dot: '#22c55e' },
  'Learning':    { bg: '#fefce8', border: '#fde68a', text: '#a16207', dot: '#eab308' },
  'Research':    { bg: '#fdf4ff', border: '#e9d5ff', text: '#7e22ce', dot: '#a855f7' },
  'Submission':  { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', dot: '#f97316' },
  'Conferment':  { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e', dot: '#14b8a6' },
  'Alumni':             { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', dot: '#f43f5e' },
  'Ghost':              { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', dot: '#94a3b8' },
  'Refund':             { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', dot: '#ef4444' },
  'Admission Cancelled':{ bg: '#f1f5f9', border: '#cbd5e1', text: '#334155', dot: '#475569' },
};

function LifecycleSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = value || 'Admission';
  const sc = STAGE_COLORS[selected];

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button — selected stage ka color dikhao */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: '13px', fontWeight: 700,
          background: sc.bg, border: `1.5px solid ${sc.border}`, color: sc.text,
          boxShadow: `0 2px 8px ${sc.dot}22`, transition: 'all 0.15s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '9px', height: '9px', borderRadius: '50%',
            background: sc.dot, boxShadow: `0 0 0 3px ${sc.dot}33`, flexShrink: 0,
          }} />
          {selected}
        </span>
        {/* Arrow */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M2 4l4 4 4-4" stroke={sc.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown list */}
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, zIndex: 999,
            background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.12)', overflow: 'hidden',
          }}
          onMouseLeave={() => setOpen(false)}
        >
          {JOURNEY_STAGES.map((stage, i) => {
            const c = STAGE_COLORS[stage];
            const isActive = stage === selected;
            return (
              <div
                key={stage}
                onMouseDown={() => { onChange(stage); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', cursor: 'pointer', fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? c.text : '#334155',
                  background: isActive ? c.bg : 'white',
                  borderBottom: i < JOURNEY_STAGES.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = c.bg; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'white'; }}
              >
                <span style={{
                  width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
                  background: c.dot,
                  boxShadow: isActive ? `0 0 0 3px ${c.dot}33` : 'none',
                }} />
                <span style={{ flex: 1 }}>{stage}</span>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke={c.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '10px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
      {children}
    </p>
  );
}

function fmt(n) {
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtINR(n) {
  return '₹' + Math.abs(Math.round(n)).toLocaleString('en-IN');
}

export default function StudentModal({ initial, liveRate, totalPaid = 0, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [emailLookup, setEmailLookup] = useState({ loading: false, found: false, notFound: false });

  useEffect(() => {
    if (initial) {
      setForm({ ...EMPTY, ...initial,
        journeyStatus:  initial.journeyStatus  ?? 'Admission',
        totalFee:       initial.totalFee       ?? '',
        exchangeRate:   initial.exchangeRate   ?? '83',
        uniFee:         initial.uniFee         ?? '',
        consultantComm: initial.consultantComm ?? '',
        thesisCost:     initial.thesisCost     ?? '',
        shipmentCost:   initial.shipmentCost   ?? '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setForm({ ...EMPTY, registrationDate: today, exchangeRate: liveRate ? liveRate.toFixed(2) : '83' });
    }
  }, [initial, liveRate]);

  // Email se auto-fill: valid email type karne ke baad 600ms wait karke lookup karo
  useEffect(() => {
    if (isEdit) return; // edit mode mein auto-fill nahi
    const email = form.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailLookup({ loading: false, found: false, notFound: false });
      return;
    }
    setEmailLookup(p => ({ ...p, loading: true, found: false, notFound: false }));
    const timer = setTimeout(async () => {
      try {
        const { default: api } = await import('../../api/axios');
        const { data } = await api.get(`/api/students/lookup/email?email=${encodeURIComponent(email)}`);
        if (data.success && data.data) {
          const s = data.data;
          setForm(p => ({
            ...p,
            name:     s.name     || p.name,
            phone:    s.phone    || p.phone,
            region:   s.region   || p.region,
            program:  s.program  || p.program,
            university: s.university || p.university,
            // payment fields blank rakhte hain — nayi course ke liye fresh fill karo
          }));
          setEmailLookup({ loading: false, found: true, notFound: false });
        }
      } catch {
        setEmailLookup({ loading: false, found: false, notFound: true });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.email, isEdit]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const calc = useMemo(() => {
    const rate       = Number(form.exchangeRate)  || 0;
    const totalFee   = Number(form.totalFee)       || 0;
    const totalFeeINR= totalFee * rate;
    // Edit mode mein actual payments use karo, add mode mein form ka initPayAmt
    const paid       = isEdit ? totalPaid : (Number(form.initPayAmt) || 0);
    const bankCharge = Number(form.initBankCharge) || 0;
    const gatewayFee = Number(form.initGatewayFee) || 0;
    const otherDed   = Number(form.initOtherDed)   || 0;
    const totalDeductions = isEdit ? 0 : (bankCharge + gatewayFee + otherDed);
    const netReceived    = paid - totalDeductions;
    const netReceivedINR = netReceived * rate;
    const uniFee         = Number(form.uniFee)         || 0;
    const consultantComm = Number(form.consultantComm) || 0;
    const thesisCost     = Number(form.thesisCost)     || 0;
    const shipmentCost   = Number(form.shipmentCost)   || 0;
    const totalCosts     = uniFee + consultantComm + thesisCost + shipmentCost;
    const remainingBalance = totalFee - paid;
    const netProfit        = netReceived - totalCosts;
    return { totalFeeINR, totalDeductions, netReceived, netReceivedINR, totalCosts, remainingBalance, netProfit, paid, totalFee };
  }, [form, isEdit, totalPaid]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name             = 'Required';
    if (!form.registrationDate)  e.registrationDate = 'Required';
    if (!form.region.trim())     e.region           = 'Required';
    if (!form.program.trim())    e.program          = 'Required';
    if (!form.university.trim()) e.university       = 'Required';
    if (!form.totalFee || isNaN(+form.totalFee) || +form.totalFee <= 0) e.totalFee = 'Must be > 0';
    if (!form.exchangeRate || isNaN(+form.exchangeRate) || +form.exchangeRate <= 0) e.exchangeRate = 'Must be > 0';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
        registrationDate: form.registrationDate, region: form.region.trim(), program: form.program.trim(),
        university: form.university.trim(), totalFee: Number(form.totalFee),
        exchangeRate: Number(form.exchangeRate),
        journeyStatus: form.journeyStatus || 'Admission',
        uniFee: Number(form.uniFee) || 0, consultantComm: Number(form.consultantComm) || 0,
        thesisCost: Number(form.thesisCost) || 0, shipmentCost: Number(form.shipmentCost) || 0,
        ...(!isEdit && {
          initPayAmt: form.initPayAmt ? Number(form.initPayAmt) : undefined,
          initPayMethod: form.initPayMethod.trim(),
          initBankCharge: Number(form.initBankCharge) || 0,
          initGatewayFee: Number(form.initGatewayFee) || 0,
          initOtherDed: Number(form.initOtherDed) || 0,
        }),
      };
      await onSave(payload);
    } finally { setSaving(false); }
  };

  return (
    <>
      {/* Slide-down animation for custom input */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Modal open onClose={onClose} title={isEdit ? 'Edit Student' : 'Add New Student'} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Basic Info */}
          <div style={{ background: '#fafbff', border: '1px solid #eef0f8', borderRadius: '14px', padding: '16px' }}>
            <SectionLabel>👤 Basic Information</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Full Name *" error={errors.name}>
                <StyledInput value={form.name} onChange={e => set('name', e.target.value)} placeholder="Deepak Nayyar" />
              </Field>
              <Field label="Registration Date *" error={errors.registrationDate}>
                <StyledInput type="date" value={form.registrationDate} onChange={e => set('registrationDate', e.target.value)} />
              </Field>
              <Field label="Email" error={errors.email}>
                <div style={{ position: 'relative' }}>
                  <StyledInput
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="student@email.com"
                    style={{ paddingRight: emailLookup.loading || emailLookup.found || emailLookup.notFound ? '90px' : undefined }}
                  />
                  {!isEdit && emailLookup.loading && (
                    <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.1)', borderRadius: '6px', padding: '3px 7px' }}>
                      Searching…
                    </span>
                  )}
                  {!isEdit && emailLookup.found && (
                    <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', padding: '3px 7px' }}>
                      ✓ Auto-filled
                    </span>
                  )}
                  {!isEdit && emailLookup.notFound && form.email.includes('@') && (
                    <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', borderRadius: '6px', padding: '3px 7px' }}>
                      New student
                    </span>
                  )}
                </div>
                {!isEdit && emailLookup.found && (
                  <p style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>
                    📋 Details auto-filled — sirf payment fields fresh bharni hain
                  </p>
                )}
              </Field>
              <Field label="Phone" error={errors.phone}>
                <StyledInput type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+44 7700 900123" />
              </Field>

              {/* Lifecycle — add aur edit dono mode mein dikhao */}
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Lifecycle / Journey Stage">
                  <LifecycleSelector
                    value={form.journeyStatus || 'Admission'}
                    onChange={v => set('journeyStatus', v)}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Academic */}
          <div style={{ background: '#fafbff', border: '1px solid #eef0f8', borderRadius: '14px', padding: '16px' }}>
            <SectionLabel>🎓 Academic Details</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

              {/* Region — SearchableCountry */}
              <Field label="Region *" error={errors.region}>
                <SearchableCountry
                  value={form.region}
                  onChange={v => set('region', v)}
                  error={errors.region}
                />
              </Field>

              {/* Program — SelectWithOther */}
              <Field label="Program *" error={errors.program}>
                <SelectWithOther
                  value={form.program}
                  onChange={v => set('program', v)}
                  options={PROGRAMS}
                  placeholder="Select program"
                  inputPlaceholder="e.g. Certificate, LLM..."
                />
              </Field>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="University *" error={errors.university}>
                  <StyledInput value={form.university} onChange={e => set('university', e.target.value)} placeholder="Kennedy University" />
                </Field>
              </div>
            </div>
          </div>

          {/* Fee */}
          <div style={{ background: '#fafbff', border: '1px solid #eef0f8', borderRadius: '14px', padding: '16px' }}>
            <SectionLabel>💵 Fee & Exchange Rate</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Total Fee (USD) *" error={errors.totalFee}>
                <StyledInput type="number" value={form.totalFee} onChange={e => set('totalFee', e.target.value)} placeholder="4700" />
              </Field>
              <Field label="Exchange Rate (₹/USD) *" error={errors.exchangeRate}>
                <div style={{ position: 'relative' }}>
                  <StyledInput type="number" value={form.exchangeRate} onChange={e => set('exchangeRate', e.target.value)} placeholder="83" style={{ paddingRight: '80px' }} />
                  {liveRate && (
                    <button type="button" onClick={() => set('exchangeRate', liveRate.toFixed(2))}
                      style={{
                        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '10px', fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.1)',
                        border: 'none', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer',
                      }}>
                      Live ₹{liveRate.toFixed(1)}
                    </button>
                  )}
                </div>
              </Field>
            </div>
            {calc.totalFeeINR > 0 && (
              <div style={{
                marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))',
                border: '1px solid rgba(99,102,241,0.15)',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🇮🇳 Total Fee INR (Auto)</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#6366f1' }}>{fmtINR(calc.totalFeeINR)}</span>
              </div>
            )}
          </div>

          {/* Initial Payment */}
          {!isEdit && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02))',
              border: '1px solid rgba(99,102,241,0.18)', borderRadius: '14px', padding: '16px',
            }}>
              <SectionLabel>💰 Initial Payment (Optional)</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Amount (USD)">
                  <StyledInput type="number" value={form.initPayAmt} onChange={e => set('initPayAmt', e.target.value)} placeholder="0" />
                </Field>

                {/* Method — SelectWithOther */}
                <Field label="Method">
                  <SelectWithOther
                    value={form.initPayMethod}
                    onChange={v => set('initPayMethod', v)}
                    options={METHODS}
                    placeholder="Select method"
                    inputPlaceholder="e.g. Crypto, Cheque..."
                  />
                </Field>

                <Field label="Bank Charge (USD)">
                  <StyledInput type="number" value={form.initBankCharge} onChange={e => set('initBankCharge', e.target.value)} placeholder="0" />
                </Field>
                <Field label="Gateway Fee (USD)">
                  <StyledInput type="number" value={form.initGatewayFee} onChange={e => set('initGatewayFee', e.target.value)} placeholder="0" />
                </Field>
                <Field label="Other Deduction (USD)">
                  <StyledInput type="number" value={form.initOtherDed} onChange={e => set('initOtherDed', e.target.value)} placeholder="0" />
                </Field>
                {calc.paid > 0 && (
                  <Field label="Net Received (Auto)">
                    <div style={{
                      border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '9px 12px',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))',
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#6366f1' }}>
                        {fmt(calc.netReceived)} = {fmtINR(calc.netReceivedINR)}
                      </span>
                    </div>
                  </Field>
                )}
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div style={{ background: '#fafbff', border: '1px solid #eef0f8', borderRadius: '14px', padding: '16px' }}>
            <SectionLabel>🧾 Cost Breakdown (Optional)</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { k: 'uniFee',         label: 'University Fee (USD)' },
                { k: 'consultantComm', label: 'Consultant Comm (USD)' },
                { k: 'thesisCost',     label: 'Thesis Cost (USD)' },
                { k: 'shipmentCost',   label: 'Shipment Cost (USD)' },
              ].map(({ k, label }) => (
                <Field key={k} label={label}>
                  <StyledInput type="number" value={form[k]} onChange={e => set(k, e.target.value)} placeholder="0" />
                </Field>
              ))}
            </div>
            {calc.totalCosts > 0 && (
              <div style={{
                marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))',
                border: '1px solid rgba(99,102,241,0.15)',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Costs (Auto)</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#6366f1' }}>{fmt(calc.totalCosts)}</span>
              </div>
            )}
          </div>

          {/* Full Summary */}
          {calc.totalFee > 0 && (
            <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <div style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
              }}>
                <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(165,180,252,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  🧮 Full Summary
                </p>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fafbff' }}>
                {[
                  { label: 'Total Fee', value: fmt(calc.totalFee), color: '#334155' },
                  calc.paid > 0 && { label: 'Amount Paid', value: `− ${fmt(calc.paid)}`, color: '#10b981' },
                  calc.totalDeductions > 0 && { label: 'Gateway / Bank Charges', value: `− ${fmt(calc.totalDeductions)}`, color: '#f59e0b' },
                  calc.paid > 0 && { label: 'Net Received', value: `${fmt(calc.netReceived)} (${fmtINR(calc.netReceivedINR)})`, color: '#334155' },
                  calc.totalCosts > 0 && { label: 'Total Expenses', value: `− ${fmt(calc.totalCosts)}`, color: '#ef4444' },
                ].filter(Boolean).map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color }}>{value}</span>
                  </div>
                ))}

                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)', margin: '2px 0' }} />

                {calc.paid > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Net Profit (So Far)</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: calc.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                      {calc.netProfit < 0 ? '−' : ''}{fmt(calc.netProfit)}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Remaining Balance</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>{fmt(calc.remainingBalance)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
            <button onClick={onClose}
              style={{
                padding: '9px 18px', fontSize: '13px', fontWeight: 600,
                color: '#64748b', background: '#f1f5f9', border: 'none',
                borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving}
              style={{
                padding: '9px 22px', fontSize: '13px', fontWeight: 700,
                color: 'white', border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer',
                background: saving ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: saving ? 'none' : '0 4px 12px rgba(99,102,241,0.35)',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.boxShadow = '0 6px 16px rgba(99,102,241,0.45)'; }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.35)'; }}>
              {saving && (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/>
                </svg>
              )}
              {isEdit ? 'Save Changes' : 'Add Student'}
            </button>
          </div>

        </div>
      </Modal>
    </>
  );
}