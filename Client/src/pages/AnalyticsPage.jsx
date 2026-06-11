import { useMemo } from 'react';
import { useAppData } from '../components/layout/AppLayout';
import { fmt$, fmtINR, fmtShort, REGION_COLORS } from '../utils/formatters';

// ── Reusable mini bar ─────────────────────────────────────────
function Bar({ label, value, max, color, sub }) {
  const pct = Math.max(4, (value / Math.max(max, 1)) * 100);
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs font-semibold text-slate-500 w-20 flex-shrink-0 text-right truncate">
        {label}
      </p>
      <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden">
        <div
          className="h-full rounded-full flex items-center px-3 transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        >
          <span className="text-[11px] font-bold text-white whitespace-nowrap truncate">
            {fmt$(value)}
          </span>
        </div>
      </div>
      {sub != null && (
        <p className="text-xs text-slate-400 w-10 flex-shrink-0 text-right">{sub}</p>
      )}
    </div>
  );
}

// ── Section card wrapper ───────────────────────────────────────
function Section({ icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const {
    students = [],
    payments = [],
    calcs    = {},
    liveRate,
    loading,
  } = useAppData();

  // ── Region aggregates ─────────────────────────────────────────
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
    return Object.entries(m)
      .map(([region, v]) => ({ region, ...v }))
      .sort((a, b) => b.received - a.received);
  }, [students, calcs]);

  // ── Program aggregates ────────────────────────────────────────
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
    return Object.entries(m)
      .map(([program, v]) => ({ program, ...v }))
      .sort((a, b) => b.received - a.received);
  }, [students, calcs]);

  // ── Monthly collections (last 6 months) ───────────────────────
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        total: 0,
        count: 0,
      });
    }
    payments.forEach((p) => {
      const key = p.date?.slice(0, 7);
      const m   = months.find((x) => x.key === key);
      if (m) { m.total += p.amountUSD; m.count++; }
    });
    return months;
  }, [payments]);

  // ── Payment method aggregates ─────────────────────────────────
  const methodData = useMemo(() => {
    const m = {};
    payments.forEach((p) => {
      const method = p.method || 'Other';
      if (!m[method]) m[method] = { total: 0, count: 0 };
      m[method].total += p.amountUSD;
      m[method].count++;
    });
    return Object.entries(m)
      .map(([method, v]) => ({ method, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [payments]);

  // ── Summary totals ────────────────────────────────────────────
  const totals = useMemo(() => {
    const vals = Object.values(calcs);
    return {
      received:    vals.reduce((a, c) => a + c.totalReceived,  0),
      profit:      vals.reduce((a, c) => a + c.netProfitUSD,   0),
      outstanding: vals.reduce((a, c) => a + c.outstanding,    0),
      deductions:  vals.reduce((a, c) => a + c.totalDeductions, 0),
    };
  }, [calcs]);

  const METHOD_COLORS = {
    'Bank Transfer': '#6366f1',
    UPI:             '#10b981',
    PayPal:          '#f59e0b',
    EMI:             '#8b5cf6',
    Other:           '#94a3b8',
  };

  const PROGRAM_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  return (
    <div className="space-y-5">

      {/* ── Summary cards ─────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Collected',   value: fmt$(totals.received),    sub: liveRate ? fmtINR(totals.received * liveRate) : '—',    color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50', tc: 'text-indigo-600' },
          { label: 'Net Profit',        value: fmt$(totals.profit),      sub: liveRate ? fmtINR(totals.profit * liveRate) : '—',      color: 'from-emerald-400 to-green-500', bg: 'bg-emerald-50', tc: 'text-emerald-600' },
          { label: 'Total Outstanding', value: fmt$(totals.outstanding), sub: `${students.filter((s) => calcs[s._id]?.outstanding > 0).length} students`, color: 'from-red-400 to-rose-500', bg: 'bg-red-50', tc: 'text-red-500' },
          { label: 'Total Deductions',  value: fmt$(totals.deductions),  sub: `${payments.length} payments`,                          color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', tc: 'text-amber-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`h-0.5 w-full bg-gradient-to-r ${card.color}`} />
            <div className="p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
              <p className={`text-xl font-bold ${card.tc}`}>{card.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Monthly collections ───────────────── */}
      <Section icon="📅" title="Monthly Collections" subtitle="Last 6 months — USD received">
        {monthlyData.every((m) => m.total === 0) ? (
          <p className="text-sm text-slate-400 text-center py-6">No payment data yet</p>
        ) : (
          <div className="space-y-3">
            {monthlyData.map((m) => (
              <div key={m.key} className="flex items-center gap-3">
                <p className="text-xs font-semibold text-slate-500 w-14 flex-shrink-0 text-right">
                  {m.label}
                </p>
                <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center px-3 transition-all duration-500
                      bg-gradient-to-r from-indigo-400 to-violet-500"
                    style={{ width: `${Math.max(4, (m.total / maxMonthly) * 100)}%` }}
                  >
                    {m.total > 0 && (
                      <span className="text-[11px] font-bold text-white whitespace-nowrap">
                        {fmt$(m.total)}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400 w-8 flex-shrink-0 text-right">{m.count}x</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Region + Program side by side ─────── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Region */}
        <Section icon="🌍" title="By Region" subtitle="Net profit per region">
          {regionData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {regionData.map((r) => (
                <Bar
                  key={r.region}
                  label={r.region}
                  value={r.profit}
                  max={Math.max(...regionData.map((x) => x.profit), 1)}
                  color={REGION_COLORS[r.region] || '#94a3b8'}
                  sub={r.count}
                />
              ))}
            </div>
          )}

          {/* Region table */}
          {regionData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 text-left">
                    <th className="pb-2 font-semibold">Region</th>
                    <th className="pb-2 font-semibold text-right">Received</th>
                    <th className="pb-2 font-semibold text-right">Outstanding</th>
                    <th className="pb-2 font-semibold text-right">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {regionData.map((r) => (
                    <tr key={r.region}>
                      <td className="py-1.5 font-medium text-slate-700">{r.region}</td>
                      <td className="py-1.5 text-right text-emerald-600 font-semibold">{fmt$(r.received)}</td>
                      <td className="py-1.5 text-right text-red-400">{fmt$(r.outstanding)}</td>
                      <td className="py-1.5 text-right text-slate-500">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Program */}
        <Section icon="🎓" title="By Program" subtitle="Received amount per program">
          {programData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
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
            <div className="mt-4 pt-4 border-t border-slate-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 text-left">
                    <th className="pb-2 font-semibold">Program</th>
                    <th className="pb-2 font-semibold text-right">Received</th>
                    <th className="pb-2 font-semibold text-right">Profit</th>
                    <th className="pb-2 font-semibold text-right">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programData.map((p) => (
                    <tr key={p.program}>
                      <td className="py-1.5 font-medium text-slate-700 truncate max-w-[100px]">{p.program}</td>
                      <td className="py-1.5 text-right text-emerald-600 font-semibold">{fmt$(p.received)}</td>
                      <td className="py-1.5 text-right text-violet-600">{fmt$(p.profit)}</td>
                      <td className="py-1.5 text-right text-slate-500">{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* ── Payment Methods ───────────────────── */}
      <Section icon="💳" title="Payment Methods" subtitle="Volume by method">
        {methodData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No payments yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              {methodData.map((m) => (
                <Bar
                  key={m.method}
                  label={m.method}
                  value={m.total}
                  max={Math.max(...methodData.map((x) => x.total), 1)}
                  color={METHOD_COLORS[m.method] || '#94a3b8'}
                  sub={`${m.count}x`}
                />
              ))}
            </div>
            <div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 text-left">
                    <th className="pb-2 font-semibold">Method</th>
                    <th className="pb-2 font-semibold text-right">Total</th>
                    <th className="pb-2 font-semibold text-right">Txns</th>
                    <th className="pb-2 font-semibold text-right">Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {methodData.map((m) => (
                    <tr key={m.method}>
                      <td className="py-1.5 font-medium text-slate-700">{m.method}</td>
                      <td className="py-1.5 text-right text-emerald-600 font-semibold">{fmt$(m.total)}</td>
                      <td className="py-1.5 text-right text-slate-500">{m.count}</td>
                      <td className="py-1.5 text-right text-slate-400">{fmt$(m.total / m.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

    </div>
  );
}