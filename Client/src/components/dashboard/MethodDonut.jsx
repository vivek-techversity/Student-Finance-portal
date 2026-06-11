import { useMemo } from 'react';
import { fmt$ } from '../../utils/formatters';

const METHOD_COLORS = {
  'Bank Transfer': '#6366f1',
  UPI:             '#10b981',
  PayPal:          '#f59e0b',
  EMI:             '#8b5cf6',
  Other:           '#94a3b8',
};

const METHOD_ICONS = {
  'Bank Transfer': '🏦',
  UPI:             '📱',
  PayPal:          '🅿️',
  EMI:             '💳',
  Other:           '💵',
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

  // ── SVG donut math ────────────────────────────────────────────
  const SIZE   = 120;
  const R      = 44;
  const CX     = SIZE / 2;
  const CY     = SIZE / 2;
  const STROKE = 16;
  const CIRC   = 2 * Math.PI * R;

  const segments = useMemo(() => {
    if (grandTotal === 0) return [];
    let offset = 0;
    return data.map((d) => {
      const pct  = d.total / grandTotal;
      const dash = pct * CIRC;
      const gap  = CIRC - dash;
      const seg  = { ...d, dash, gap, offset };
      offset    += dash;
      return seg;
    });
  }, [data, grandTotal]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#8b5cf6" strokeWidth="2">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
            <path d="M22 12A10 10 0 0 0 12 2v10z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Payment Methods</p>
          <p className="text-[11px] text-slate-400">Distribution by volume</p>
        </div>
      </div>

      <div className="px-5 py-4">
        {payments.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-2xl mb-1.5">💳</p>
            <p className="text-sm">No payments yet</p>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            {/* Donut SVG */}
            <div className="flex-shrink-0 relative">
              <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                {/* Track */}
                <circle
                  cx={CX} cy={CY} r={R}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth={STROKE}
                />
                {segments.map((seg) => (
                  <circle
                    key={seg.method}
                    cx={CX} cy={CY} r={R}
                    fill="none"
                    stroke={METHOD_COLORS[seg.method] || '#94a3b8'}
                    strokeWidth={STROKE}
                    strokeDasharray={`${seg.dash} ${seg.gap}`}
                    strokeDashoffset={-seg.offset + CIRC / 4}
                    strokeLinecap="butt"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                ))}
              </svg>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Total</p>
                <p className="text-sm font-bold text-slate-700">{fmt$(grandTotal)}</p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2.5 min-w-0">
              {data.map((d) => {
                const pct = grandTotal > 0 ? ((d.total / grandTotal) * 100).toFixed(0) : 0;
                const color = METHOD_COLORS[d.method] || '#94a3b8';
                return (
                  <div key={d.method} className="flex items-center gap-2">
                    <span className="text-sm flex-shrink-0">{METHOD_ICONS[d.method] || '💵'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-700 truncate">{d.method}</p>
                        <p className="text-xs font-bold flex-shrink-0" style={{ color }}>
                          {pct}%
                        </p>
                      </div>
                      {/* Mini bar */}
                      <div className="h-1 bg-slate-100 rounded-full mt-0.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 flex-shrink-0 w-12 text-right">
                      {d.count}x
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}