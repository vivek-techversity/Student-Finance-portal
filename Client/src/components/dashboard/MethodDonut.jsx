import { useMemo } from 'react';
import { fmt$ } from '../../utils/formatters';

const T = {
  border: '#E7E4E0',
  label:  '#A8A29E',
  sub:    '#78716C',
  text:   '#1C1917',
  iconBg: '#F5F3F0',
  track:  '#F0EDE9',
  accent: '#6366F1',
};

const METHOD_ICONS = {
  'Bank Transfer': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
      <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
      <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
    </svg>
  ),
  'UPI': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  'PayPal': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
    </svg>
  ),
  'EMI': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  'Other': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
};

/**
 * Props:
 *   payments — all payments array
 */
export default function MethodDonut({ payments }) {
  const data = useMemo(() => {
    const m = {};
    payments.forEach((p) => {
      const method = p.method || 'Other';
      if (!m[method]) m[method] = { count: 0, total: 0 };
      m[method].count++;
      m[method].total += p.amountUSD;
    });
    return Object.entries(m)
      .map(([method, v]) => ({ method, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [payments]);

  const grandTotal = data.reduce((a, d) => a + d.total, 0);
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.iconBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: T.text }}>Payment Methods</p>
            <p className="text-[11px]" style={{ color: T.label }}>Distribution by volume</p>
          </div>
        </div>
        <p className="text-sm font-extrabold tabular-nums" style={{ color: T.text }}>{fmt$(grandTotal)}</p>
      </div>

      <div className="px-5 py-4">
        {payments.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm" style={{ color: T.label }}>No payments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((d) => {
              const pct = grandTotal > 0 ? (d.total / grandTotal) * 100 : 0;
              const widthPct = Math.max(4, (d.total / max) * 100);
              const opacity = 0.35 + 0.65 * (d.total / max);

              return (
                <div key={d.method} className="flex items-center gap-3">
                  {/* Icon + label */}
                  <div className="w-28 flex-shrink-0 flex items-center gap-1.5" style={{ color: T.sub }}>
                    {METHOD_ICONS[d.method] || METHOD_ICONS['Other']}
                    <span className="text-xs font-semibold truncate" style={{ color: T.text }}>{d.method}</span>
                  </div>

                  {/* Bar track */}
                  <div className="flex-1 rounded-full h-7 overflow-hidden relative" style={{ background: T.track }}>
                    <div
                      className="h-full rounded-full flex items-center px-3 transition-all duration-500"
                      style={{ width: `${widthPct}%`, backgroundColor: T.accent, opacity }}
                    >
                      <span className="text-[11px] font-bold text-white whitespace-nowrap">{d.count}x</span>
                    </div>
                  </div>

                  {/* Pct + value */}
                  <div className="w-24 flex-shrink-0 text-right">
                    <p className="text-xs font-bold tabular-nums" style={{ color: T.text }}>{pct.toFixed(0)}%</p>
                    <p className="text-[11px] tabular-nums" style={{ color: T.label }}>{fmt$(d.total)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}