import { fmt$ } from '../../utils/formatters';

const T = {
  border: '#E7E4E0',
  label:  '#A8A29E',
  sub:    '#78716C',
  text:   '#1C1917',
  iconBg: '#F5F3F0',
  accent: '#6366F1',
  positive: '#059669',
  negative: '#DC2626',
  grid:   '#F0EDE9',
};

/** Compact label for chart points — always short, no stray decimals.
 *  $0, $474, $1.6k, $7.9k — consistent style regardless of magnitude. */
function fmtPoint(v) {
  const n = Number(v || 0);
  if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'k';
  return '$' + Math.round(n).toLocaleString('en-US');
}

/**
 * Props:
 *   series — [{ label, total }] last N months, oldest → newest
 */
export default function RevenueTrendChart({ series = [] }) {
  const W = 640;
  const H = 200;
  const PAD_L = 8;
  const PAD_R = 8;
  const PAD_T = 30;
  const PAD_B = 28;

  const values = series.map((s) => s.total);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const points = series.map((s, i) => {
    const x = PAD_L + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    const y = PAD_T + innerH - ((s.total - min) / range) * innerH;
    return { x, y, ...s };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x.toFixed(1)} ${PAD_T + innerH} L ${points[0]?.x.toFixed(1)} ${PAD_T + innerH} Z`;

  const total = values.reduce((a, b) => a + b, 0);
  const current = values[values.length - 1] || 0;
  const previous = values[values.length - 2] || 0;
  const pctChange = previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : (current > 0 ? 100 : 0);
  const isUp = pctChange >= 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.iconBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: T.text }}>Revenue Trend</p>
            <p className="text-[11px]" style={{ color: T.label }}>Revenue (USD) · last {series.length} months</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl font-extrabold tabular-nums" style={{ color: T.text }}>{fmt$(total)}</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isUp ? T.positive : T.negative} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: isUp ? 'none' : 'rotate(180deg)' }}>
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: isUp ? T.positive : T.negative }}>
              {Math.abs(pctChange).toFixed(0)}%
            </span>
            <span className="text-[11px]" style={{ color: T.label }}>vs last month</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 py-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '200px' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.accent} stopOpacity="0.18" />
              <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.5, 1].map((f) => (
            <line key={f} x1={PAD_L} x2={W - PAD_R} y1={PAD_T + innerH * f} y2={PAD_T + innerH * f} stroke={T.grid} strokeWidth="1" />
          ))}

          {/* Area fill */}
          {points.length > 1 && <path d={areaPath} fill="url(#trendFill)" />}

          {/* Line */}
          {points.length > 1 && (
            <path d={linePath} fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          )}

          {/* Points + labels */}
          {points.map((p, i) => {
            const isFirst = i === 0;
            const isLast = i === points.length - 1;
            const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={isLast ? 4 : 3} fill="white" stroke={T.accent} strokeWidth="2" />
                <text x={p.x} y={H - 8} textAnchor={anchor} fontSize="11" fontWeight="600" fill={T.label}>
                  {p.label}
                </text>
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor={anchor}
                  fontSize="10.5"
                  fontWeight="700"
                  fill={T.sub}
                >
                  {fmtPoint(p.total)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}