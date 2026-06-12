import { useMemo } from 'react';
import { useAppData } from '../components/layout/AppLayout';
import { fmt$, fmtINR, fmtShort, REGION_COLORS } from '../utils/formatters';

// Warm neutral palette
const T = {
  bg:          '#F5F3F0',
  border:      '#E7E4E0',
  borderLight: '#F0EDE9',
  text:        '#1C1917',
  label:       '#A8A29E',
  sub:         '#78716C',
  card:        '#ffffff',
  iconBg:      '#EDEAE6',
  iconColor:   '#57534E',
  barTrack:    '#E7E4E0',
};

// Summary card accent colors — semantic
const CARD_ACCENTS = {
  collected:   '#1C1917',
  profit:      '#10B981',
  outstanding: '#EF4444',
  deductions:  '#F59E0B',
};

// Bar chart program colors — varied but not indigo-heavy
const PROGRAM_COLORS = ['#1C1917','#10b981','#F59E0B','#8B5CF6','#EF4444','#06B6D4'];

// Method bar colors — semantic per method
const METHOD_COLORS = {
  'Bank Transfer': '#1C1917',
  UPI:             '#10b981',
  PayPal:          '#F59E0B',
  EMI:             '#8B5CF6',
  Other:           '#A8A29E',
};

// Section header SVG icons — no emoji
const SectionIcons = {
  monthly: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  region: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  program: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  methods: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
};

// ── Mini bar ─────────────────────────────────────────────────────
function Bar({ label, value, max, color, sub }) {
  const pct = Math.max(4, (value / Math.max(max, 1)) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <p style={{ fontSize: '12px', fontWeight: 600, color: T.sub, width: '72px', flexShrink: 0, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </p>
      <div style={{ flex: 1, background: T.barTrack, borderRadius: '99px', height: '28px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%', borderRadius: '99px',
            display: 'flex', alignItems: 'center', paddingLeft: '12px', paddingRight: '12px',
            width: `${pct}%`, backgroundColor: color,
            transition: 'width 0.5s ease',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {fmt$(value)}
          </span>
        </div>
      </div>
      {sub != null && (
        <p style={{ fontSize: '11px', color: T.label, width: '32px', flexShrink: 0, textAlign: 'right' }}>{sub}</p>
      )}
    </div>
  );
}

// ── Section card ─────────────────────────────────────────────────
function Section({ iconKey, title, subtitle, children }) {
  return (
    <div style={{ background: T.card, borderRadius: '14px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.borderLight}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: T.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.iconColor, flexShrink: 0 }}>
          {SectionIcons[iconKey]}
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: T.text, margin: 0, letterSpacing: '-0.01em' }}>{title}</p>
          {subtitle && <p style={{ fontSize: '11px', color: T.label, margin: 0 }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { students = [], payments = [], calcs = {}, liveRate, loading } = useAppData();

  const regionData = useMemo(() => {
    const m = {};
    students.forEach((s) => {
      const c = calcs[s._id];
      if (!c) return;
      if (!m[s.region]) m[s.region] = { profit: 0, received: 0, fee: 0, count: 0, outstanding: 0 };
      m[s.region].profit      += c.netProfitUSD;
      m[s.region].received    += c.totalReceived;
      m[s.region].fee         += s.totalFee;
      m[s.region].outstanding += c.outstanding;
      m[s.region].count++;
    });
    return Object.entries(m).map(([region, v]) => ({ region, ...v })).sort((a, b) => b.received - a.received);
  }, [students, calcs]);

  const programData = useMemo(() => {
    const m = {};
    students.forEach((s) => {
      const c = calcs[s._id];
      if (!c) return;
      if (!m[s.program]) m[s.program] = { received: 0, profit: 0, count: 0 };
      m[s.program].received += c.totalReceived;
      m[s.program].profit   += c.netProfitUSD;
      m[s.program].count++;
    });
    return Object.entries(m).map(([program, v]) => ({ program, ...v })).sort((a, b) => b.received - a.received);
  }, [students, calcs]);

  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        total: 0, count: 0,
      });
    }
    payments.forEach((p) => {
      const key = p.date?.slice(0, 7);
      const m   = months.find((x) => x.key === key);
      if (m) { m.total += p.amountUSD; m.count++; }
    });
    return months;
  }, [payments]);

  const methodData = useMemo(() => {
    const m = {};
    payments.forEach((p) => {
      const method = p.method || 'Other';
      if (!m[method]) m[method] = { total: 0, count: 0 };
      m[method].total += p.amountUSD;
      m[method].count++;
    });
    return Object.entries(m).map(([method, v]) => ({ method, ...v })).sort((a, b) => b.total - a.total);
  }, [payments]);

  const totals = useMemo(() => {
    const vals = Object.values(calcs);
    return {
      received:    vals.reduce((a, c) => a + c.totalReceived,   0),
      profit:      vals.reduce((a, c) => a + c.netProfitUSD,    0),
      outstanding: vals.reduce((a, c) => a + c.outstanding,     0),
      deductions:  vals.reduce((a, c) => a + (c.totalDeductions || 0), 0),
    };
  }, [calcs]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${T.text}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Summary cards ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { key: 'collected',   label: 'Total Collected',   value: fmtShort(totals.received),    sub: liveRate ? fmtINR(totals.received * liveRate) : '—',    valueColor: T.text },
          { key: 'profit',      label: 'Net Profit',        value: fmtShort(totals.profit),      sub: liveRate ? fmtINR(totals.profit * liveRate) : '—',      valueColor: '#10B981' },
          { key: 'outstanding', label: 'Total Outstanding', value: fmtShort(totals.outstanding), sub: `${students.filter((s) => calcs[s._id]?.outstanding > 0).length} students`, valueColor: '#EF4444' },
          { key: 'deductions',  label: 'Total Deductions',  value: fmtShort(totals.deductions),  sub: `${payments.length} payments`,                           valueColor: '#F59E0B' },
        ].map((card) => (
          <div
            key={card.key}
            style={{ background: T.card, borderRadius: '14px', border: `1px solid ${T.border}`, overflow: 'hidden' }}
          >
            <div style={{ height: '3px', background: CARD_ACCENTS[card.key] }} />
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: T.label, letterSpacing: '0.01em', marginBottom: '6px' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '22px', fontWeight: 800, color: card.valueColor, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', margin: 0 }}>
                {card.value}
              </p>
              <p style={{ fontSize: '11px', color: T.label, marginTop: '2px' }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Monthly Collections ─────────────────────────────────── */}
      <Section iconKey="monthly" title="Monthly Collections" subtitle="Last 6 months — USD received">
        {monthlyData.every((m) => m.total === 0) ? (
          <p style={{ fontSize: '13px', color: T.label, textAlign: 'center', padding: '24px 0' }}>No payment data yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {monthlyData.map((m) => (
              <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: T.sub, width: '44px', flexShrink: 0, textAlign: 'right' }}>
                  {m.label}
                </p>
                <div style={{ flex: 1, background: T.barTrack, borderRadius: '99px', height: '28px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%', borderRadius: '99px', backgroundColor: '#4F46E5',
                      display: 'flex', alignItems: 'center', paddingLeft: '12px',
                      width: `${Math.max(4, (m.total / maxMonthly) * 100)}%`,
                      transition: 'width 0.5s ease',
                    }}
                  >
                    {m.total > 0 && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                        {fmt$(m.total)}
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: T.label, width: '28px', flexShrink: 0, textAlign: 'right' }}>
                  {m.count}x
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Region + Program ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Region */}
        <Section iconKey="region" title="By Region" subtitle="Net profit per region">
          {regionData.length === 0 ? (
            <p style={{ fontSize: '13px', color: T.label, textAlign: 'center', padding: '24px 0' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {regionData.map((r) => (
                <Bar
                  key={r.region}
                  label={r.region}
                  value={r.profit}
                  max={Math.max(...regionData.map((x) => x.profit), 1)}
                  color={REGION_COLORS[r.region] || '#A8A29E'}
                  sub={r.count}
                />
              ))}
            </div>
          )}

          {regionData.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${T.borderLight}` }}>
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Region', 'Received', 'Outstanding', 'Students'].map((h, i) => (
                      <th key={h} style={{ paddingBottom: '8px', fontWeight: 500, color: T.label, textAlign: i === 0 ? 'left' : 'right', fontSize: '11px', letterSpacing: '0.01em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {regionData.map((r) => (
                    <tr key={r.region} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                      <td style={{ padding: '6px 0', fontWeight: 600, color: T.text }}>{r.region}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', color: '#10B981', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmt$(r.received)}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', color: '#EF4444', fontVariantNumeric: 'tabular-nums' }}>{fmt$(r.outstanding)}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', color: T.sub }}>{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Program */}
        <Section iconKey="program" title="By Program" subtitle="Received amount per program">
          {programData.length === 0 ? (
            <p style={{ fontSize: '13px', color: T.label, textAlign: 'center', padding: '24px 0' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {programData.map((p, i) => (
                <Bar
                  key={p.program}
                  label={p.program}
                  value={p.received}
                  max={Math.max(...programData.map((x) => x.received), 1)}
                  color={PROGRAM_COLORS[i % PROGRAM_COLORS.length]}
                  sub={p.count}
                />
              ))}
            </div>
          )}

          {programData.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${T.borderLight}` }}>
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Program', 'Received', 'Profit', 'Students'].map((h, i) => (
                      <th key={h} style={{ paddingBottom: '8px', fontWeight: 500, color: T.label, textAlign: i === 0 ? 'left' : 'right', fontSize: '11px', letterSpacing: '0.01em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {programData.map((p) => (
                    <tr key={p.program} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                      <td style={{ padding: '6px 0', fontWeight: 600, color: T.text, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.program}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', color: '#10B981', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmt$(p.received)}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', color: '#8B5CF6', fontVariantNumeric: 'tabular-nums' }}>{fmt$(p.profit)}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', color: T.sub }}>{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* ── Payment Methods ─────────────────────────────────────── */}
      <Section iconKey="methods" title="Payment Methods" subtitle="Volume by method">
        {methodData.length === 0 ? (
          <p style={{ fontSize: '13px', color: T.label, textAlign: 'center', padding: '24px 0' }}>No payments yet</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {methodData.map((m) => (
                <Bar
                  key={m.method}
                  label={m.method}
                  value={m.total}
                  max={Math.max(...methodData.map((x) => x.total), 1)}
                  color={METHOD_COLORS[m.method] || T.sub}
                  sub={`${m.count}x`}
                />
              ))}
            </div>
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', alignSelf: 'start' }}>
              <thead>
                <tr>
                  {['Method', 'Total', 'Txns', 'Avg'].map((h, i) => (
                    <th key={h} style={{ paddingBottom: '8px', fontWeight: 500, color: T.label, textAlign: i === 0 ? 'left' : 'right', fontSize: '11px', letterSpacing: '0.01em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {methodData.map((m) => (
                  <tr key={m.method} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                    <td style={{ padding: '6px 0', fontWeight: 600, color: T.text }}>{m.method}</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', color: '#10B981', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmt$(m.total)}</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', color: T.sub }}>{m.count}</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', color: T.label, fontVariantNumeric: 'tabular-nums' }}>{fmt$(m.total / m.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

    </div>
  );
}