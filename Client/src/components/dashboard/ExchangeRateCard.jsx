import { useMemo } from 'react';
import { fmtINR } from '../../utils/formatters';

const T = {
  border:  '#E7E4E0',
  label:   '#A8A29E',
  sub:     '#78716C',
  text:    '#1C1917',
  iconBg:  '#EDEAE6',
  accent:  '#6366F1',
  positive:'#059669',
  negative:'#DC2626',
};

/**
 * Props:
 *   liveRate — current USD->INR rate (number, optional)
 *   payments — all payments array (each may have an `exchangeRate` + `date`)
 */
export default function ExchangeRateCard({ liveRate, payments = [] }) {
  const series = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('en-US', { month: 'short' }), sum: 0, count: 0 });
    }
    payments.forEach((p) => {
      if (!p.exchangeRate) return;
      const d = new Date(p.date);
      const m = months.find((mo) => mo.year === d.getFullYear() && mo.month === d.getMonth());
      if (m) {
        m.sum += p.exchangeRate;
        m.count++;
      }
    });
    return months.map((m) => ({ label: m.label, rate: m.count > 0 ? m.sum / m.count : null }));
  }, [payments]);

  const known = series.filter((s) => s.rate != null);
  const lastKnown = known[known.length - 1]?.rate || null;
  const currentRate = liveRate || lastKnown;

  const prevKnown = known[known.length - 2]?.rate || null;
  const pctChange = currentRate && prevKnown
    ? ((currentRate - prevKnown) / prevKnown) * 100
    : null;
  const isUp = pctChange !== null && pctChange >= 0;

  const min = known.length ? Math.min(...known.map((s) => s.rate)) : null;
  const max = known.length ? Math.max(...known.map((s) => s.rate)) : null;

  // ── Sparkline geometry ──────────────────────────────
  const W = 240, H = 56, PAD_X = 8, PAD_Y = 4;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;
  const rangeMin = min != null ? min : 0;
  const rangeMax = max != null ? max : 1;
  const range = (rangeMax - rangeMin) || 1;

  const points = series
    .map((s, i) => ({ i, label: s.label, rate: s.rate }))
    .filter((p) => p.rate != null)
    .map((p) => {
      const x = PAD_X + (series.length === 1 ? innerW / 2 : (p.i / (series.length - 1)) * innerW);
      const y = PAD_Y + innerH - ((p.rate - rangeMin) / range) * innerH;
      return { x, y };
    });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${H - PAD_Y} L ${points[0].x.toFixed(1)} ${H - PAD_Y} Z`
    : '';

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.iconBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: T.text }}>USD / INR</p>
            <p className="text-[11px]" style={{ color: T.label }}>Exchange rate · 6-month avg</p>
          </div>
        </div>
        {liveRate && (
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ color: T.positive, background: '#ECFDF5', border: '1px solid #D1FAE5' }}
          >
            LIVE
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        {currentRate ? (
          <>
            <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
              <div className="flex items-baseline gap-2.5">
                <p className="text-2xl font-extrabold tabular-nums" style={{ color: T.text, letterSpacing: '-0.02em' }}>
                  ₹{currentRate.toFixed(2)}
                </p>
                <span className="text-xs" style={{ color: T.label }}>per $1</span>
              </div>
              {pctChange !== null && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold tabular-nums"
                  style={{ color: isUp ? T.positive : T.negative }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isUp ? T.positive : T.negative}
                    strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isUp ? 'none' : 'rotate(180deg)' }}>
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                  {Math.abs(pctChange).toFixed(1)}% vs last month
                </span>
              )}
            </div>

            {/* Sparkline */}
            {points.length > 1 ? (
              <>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '56px' }} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="fxFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.accent} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#fxFill)" />
                  <path d={linePath} fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {points.map((p, i) => (
                    i === points.length - 1 && (
                      <circle key={i} cx={p.x} cy={p.y} r="4" fill={T.accent} stroke="white" strokeWidth="2" />
                    )
                  ))}
                </svg>
                <div className="flex justify-between mt-1">
                  {series.map((s, i) => (
                    <span key={i} className="text-[10px] font-medium" style={{ color: T.label }}>{s.label}</span>
                  ))}
                </div>

                {/* Min / Max */}
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid #F0EDE9` }}>
                  <span className="text-[11px]" style={{ color: T.label }}>
                    6mo low: <span className="font-semibold tabular-nums" style={{ color: T.text }}>₹{min.toFixed(2)}</span>
                  </span>
                  <span className="text-[11px]" style={{ color: T.label }}>
                    6mo high: <span className="font-semibold tabular-nums" style={{ color: T.text }}>₹{max.toFixed(2)}</span>
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs" style={{ color: T.label }}>
                Trend will build up as more payments are recorded.
              </p>
            )}
          </>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm" style={{ color: T.label }}>Rate data not available</p>
          </div>
        )}
      </div>
    </div>
  );
}