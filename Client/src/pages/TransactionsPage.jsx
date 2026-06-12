import { useMemo, useState } from 'react';
import { useAppData } from '../components/layout/AppLayout';
import { fmt$, fmtDate, fmtINR } from '../utils/formatters';

// Warm neutral palette — matches sidebar/body
const T = {
  bg:        '#F5F3F0',
  border:    '#E7E4E0',
  borderLight: '#F0EDE9',
  text:      '#1C1917',
  label:     '#A8A29E',
  sub:       '#78716C',
  card:      '#ffffff',
  inputBg:   '#F5F3F0',
  hoverBg:   '#F8F6F4',
  primary:   '#1C1917',
  avatarBg:  '#EDEAE6',
  avatarText: '#57534E',
  positive:  '#10B981',
  negative:  '#EF4444',
};

// Method badge — semantic warm tones, no Tailwind color classes
const METHOD_STYLE = {
  'Bank Transfer': { bg: '#EEF2FF', color: '#4338CA' },
  'UPI':           { bg: '#ECFDF5', color: '#065F46' },
  'PayPal':        { bg: '#FFFBEB', color: '#92400E' },
  'EMI':           { bg: '#F5F3FF', color: '#5B21B6' },
  'Other':         { bg: '#F5F3F0', color: '#57534E' },
};

// Method SVG icons — no emoji
const METHOD_ICON_SVG = {
  'Bank Transfer': (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
      <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
      <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
    </svg>
  ),
  'UPI': (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  'PayPal': (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
    </svg>
  ),
  'EMI': (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
};
const DefaultMethodIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

// Summary card accent colors — semantic, not decorative
const SUMMARY_ACCENT = {
  gross:      '#1C1917',  // neutral dark
  net:        '#10B981',  // emerald — positive
  deductions: '#EF4444',  // red — alert
};

export default function TransactionsPage() {
  const { students = [], payments = [], liveRate, loading, onViewStudent } = useAppData();

  const [search, setSearch]       = useState('');
  const [methodFilter, setMethod] = useState('All');
  const [sortDir, setSortDir]     = useState('desc');

  const enriched = useMemo(() => {
    return payments.map((p) => {
      const student = students.find((s) => s._id === (p.studentId?._id || p.studentId));
      const net = p.amountUSD - (p.bankCharge || 0) - (p.gatewayFee || 0) - (p.otherDeduction || 0);
      const deductions = (p.bankCharge || 0) + (p.gatewayFee || 0) + (p.otherDeduction || 0);
      return { ...p, student, net, deductions };
    });
  }, [payments, students]);

  const methods = useMemo(() => {
    const s = new Set(payments.map((p) => p.method || 'Other'));
    return ['All', ...Array.from(s).sort()];
  }, [payments]);

  const filtered = useMemo(() => {
    let list = [...enriched];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.student?.name?.toLowerCase().includes(q) ||
          p.method?.toLowerCase().includes(q) ||
          p.note?.toLowerCase().includes(q)
      );
    }
    if (methodFilter !== 'All') {
      list = list.filter((p) => (p.method || 'Other') === methodFilter);
    }
    list.sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return sortDir === 'desc' ? -diff : diff;
    });
    return list;
  }, [enriched, search, methodFilter, sortDir]);

  const totals = useMemo(() => ({
    gross: filtered.reduce((a, p) => a + p.amountUSD, 0),
    net:   filtered.reduce((a, p) => a + p.net, 0),
    deductions: filtered.reduce((a, p) => a + p.deductions, 0),
  }), [filtered]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div
          style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: `2px solid ${T.primary}`, borderTopColor: 'transparent',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '15px', fontWeight: 800, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>
            All Transactions
          </h1>
          <p style={{ fontSize: '11px', color: T.label, marginTop: '2px' }}>
            {filtered.length} of {payments.length} payments
          </p>
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 600, color: T.sub,
            background: T.card, border: `1px solid ${T.border}`,
            padding: '7px 12px', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'inherit', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = T.bg}
          onMouseLeave={e => e.currentTarget.style.background = T.card}
        >
          {sortDir === 'desc' ? '↓ Newest first' : '↑ Oldest first'}
        </button>
      </div>

      {/* ── Summary cards ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {[
          { key: 'gross',      label: 'Total Gross',      value: fmt$(totals.gross),      sub: liveRate ? fmtINR(totals.gross * liveRate) : '—',      valueColor: T.text },
          { key: 'net',        label: 'Total Net',        value: fmt$(totals.net),        sub: liveRate ? fmtINR(totals.net * liveRate) : '—',        valueColor: SUMMARY_ACCENT.net },
          { key: 'deductions', label: 'Total Deductions', value: fmt$(totals.deductions), sub: `${filtered.length} transactions`,                      valueColor: SUMMARY_ACCENT.deductions },
        ].map((c) => (
          <div
            key={c.key}
            style={{
              background: T.card, borderRadius: '14px',
              border: `1px solid ${T.border}`, overflow: 'hidden',
            }}
          >
            {/* Thin semantic accent top */}
            <div style={{ height: '3px', background: SUMMARY_ACCENT[c.key] }} />
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: T.label, letterSpacing: '0.01em', marginBottom: '6px' }}>
                {c.label}
              </p>
              <p style={{ fontSize: '20px', fontWeight: 800, color: c.valueColor, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', margin: 0 }}>
                {c.value}
              </p>
              <p style={{ fontSize: '11px', color: T.label, marginTop: '2px' }}>{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            flex: 1, minWidth: '180px', maxWidth: '280px',
            background: T.inputBg, border: `1px solid ${T.border}`,
            borderRadius: '10px', padding: '8px 12px',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.label} strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search student, method…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: '13px', color: T.text, width: '100%', fontFamily: 'inherit',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.label, fontSize: '12px', padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Method filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              style={{
                fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '8px',
                border: `1px solid ${methodFilter === m ? T.primary : T.border}`,
                background: methodFilter === m ? T.primary : T.card,
                color: methodFilter === m ? '#ffffff' : T.sub,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Transactions table ───────────────────── */}
      <div
        style={{
          background: T.card, borderRadius: '14px',
          border: `1px solid ${T.border}`, overflow: 'hidden',
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <div
              style={{
                width: '40px', height: '40px', borderRadius: '12px', background: T.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.label} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: T.sub }}>No transactions found</p>
            <p style={{ fontSize: '11px', color: T.label, marginTop: '2px' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1fr',
                gap: '16px', padding: '10px 20px',
                background: T.bg, borderBottom: `1px solid ${T.border}`,
              }}
            >
              {['Student', 'Date & Method', 'Gross', 'Deductions', 'Net', 'Note'].map((h) => (
                <p
                  key={h}
                  style={{ fontSize: '11px', fontWeight: 500, color: T.label, letterSpacing: '0.01em', margin: 0 }}
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((p, i) => {
              const mStyle = METHOD_STYLE[p.method] || METHOD_STYLE.Other;
              const MIcon = METHOD_ICON_SVG[p.method] ? (() => METHOD_ICON_SVG[p.method]) : DefaultMethodIcon;
              const initials = (p.student?.name?.[0] || '?').toUpperCase();

              return (
                <div
                  key={p._id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1fr',
                    gap: '16px', padding: '13px 20px',
                    borderBottom: i < filtered.length - 1 ? `1px solid ${T.borderLight}` : 'none',
                    alignItems: 'center', transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  {/* Student */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: p.student ? 'pointer' : 'default' }}
                    onClick={() => p.student && onViewStudent(p.student)}
                  >
                    <div
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: T.avatarBg, color: T.avatarText,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700, flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '13px', fontWeight: 600, color: T.text,
                          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          transition: 'color 0.12s',
                        }}
                        onMouseEnter={e => { if (p.student) e.target.style.color = '#1C1917'; }}
                      >
                        {p.student?.name || '—'}
                      </p>
                      <p
                        style={{
                          fontSize: '11px', color: T.label, margin: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        {p.student?.university || ''}
                      </p>
                    </div>
                  </div>

                  {/* Date & Method */}
                  <div>
                    <p style={{ fontSize: '12px', color: T.sub, margin: '0 0 3px 0' }}>{fmtDate(p.date)}</p>
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '10px', fontWeight: 600, padding: '2px 7px',
                        borderRadius: '99px', background: mStyle.bg, color: mStyle.color,
                      }}
                    >
                      <MIcon />
                      {p.method || 'Other'}
                    </span>
                  </div>

                  {/* Gross */}
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: T.text, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {fmt$(p.amountUSD)}
                    </p>
                    {p.exchangeRate && (
                      <p style={{ fontSize: '10px', color: T.label, margin: 0 }}>₹{p.exchangeRate}/USD</p>
                    )}
                  </div>

                  {/* Deductions */}
                  <div>
                    {p.deductions > 0 ? (
                      <>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: T.negative, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                          -{fmt$(p.deductions)}
                        </p>
                        <p style={{ fontSize: '10px', color: T.label, margin: 0 }}>charges</p>
                      </>
                    ) : (
                      <p style={{ fontSize: '13px', color: T.border, margin: 0 }}>—</p>
                    )}
                  </div>

                  {/* Net */}
                  <p style={{ fontSize: '13px', fontWeight: 700, color: T.positive, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {fmt$(p.net)}
                  </p>

                  {/* Note */}
                  <p
                    style={{
                      fontSize: '11px', color: T.label, margin: 0,
                      fontStyle: p.note ? 'italic' : 'normal',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {p.note ? `"${p.note}"` : '—'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}