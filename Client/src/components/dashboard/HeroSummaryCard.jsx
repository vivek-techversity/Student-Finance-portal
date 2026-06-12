import { fmt$, fmtINR } from '../../utils/formatters';

const T = {
  border:   '#E7E4E0',
  label:    '#A8A29E',
  sub:      '#78716C',
  text:     '#1C1917',
  accent:   '#6366F1',
  positive: '#059669',
  negative: '#DC2626',
  trackBg:  '#EAE8E4',
};

function barColor(pct) {
  if (pct >= 100) return '#10B981';
  if (pct >= 60)  return '#1C1917';
  if (pct >= 30)  return '#F59E0B';
  return '#EF4444';
}

/**
 * Props:
 *   thisMonth — net received this month (USD)
 *   target    — monthly target (USD)
 *   tPct      — target progress percent
 *   liveRate  — USD->INR rate (optional)
 *   series    — [{ label, total }] last N months, oldest → newest
 */
export default function HeroSummaryCard({ thisMonth, target, tPct, liveRate, series = [] }) {
  const values = series.map((s) => s.total);
  const current = values[values.length - 1] || 0;
  const previous = values[values.length - 2] || 0;
  const pctChange = previous !== 0
    ? ((current - previous) / Math.abs(previous)) * 100
    : (current > 0 ? 100 : 0);
  const isUp = pctChange >= 0;

  const remaining = Math.max(0, target - thisMonth);
  const achieved = tPct >= 100;

  // ── Sparkline geometry ──────────────────────────────
  const W = 240, H = 64, PAD = 4;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const points = series.map((s, i) => {
    const x = PAD + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    const y = PAD + innerH - ((s.total - min) / range) * innerH;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${H - PAD} L ${points[0].x.toFixed(1)} ${H - PAD} Z`
    : '';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${T.border}`, background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F4FF 100%)' }}
    >
      <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
        {/* Left — big number + target */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase mb-2" style={{ color: T.label, letterSpacing: '0.08em' }}>
            This Month · {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </p>

          <div className="flex items-baseline gap-3 flex-wrap">
            <p className="text-4xl font-extrabold tabular-nums leading-none" style={{ color: T.text, letterSpacing: '-0.02em' }}>
              {fmt$(thisMonth)}
            </p>
            {series.length > 1 && (
              <span
                className="inline-flex items-center gap-1 text-sm font-bold tabular-nums"
                style={{ color: isUp ? T.positive : T.negative }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isUp ? T.positive : T.negative}
                  strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: isUp ? 'none' : 'rotate(180deg)' }}>
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
                {Math.abs(pctChange).toFixed(0)}% vs last month
              </span>
            )}
          </div>

          {liveRate && (
            <p className="text-sm mt-1" style={{ color: T.sub }}>
              ≈ {fmtINR(thisMonth * liveRate)} net received
            </p>
          )}

          {/* Target progress — integrated */}
          <div className="mt-5 max-w-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: T.sub }}>
                Monthly target: <span className="font-semibold" style={{ color: T.text }}>{fmt$(target)}</span>
              </span>
              <span className="text-xs font-bold tabular-nums" style={{ color: barColor(tPct) }}>
                {tPct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.trackBg }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(tPct, 100)}%`, background: barColor(tPct) }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: T.label }}>
              {achieved
                ? 'Target achieved for this month'
                : <>
                    <span className="font-semibold" style={{ color: T.text }}>{fmt$(remaining)}</span> remaining to hit goal
                  </>
              }
            </p>
          </div>
        </div>

        {/* Right — 6-month sparkline */}
        <div className="w-full md:w-[260px] flex-shrink-0">
          <p className="text-[11px] font-semibold uppercase mb-2 text-right" style={{ color: T.label, letterSpacing: '0.08em' }}>
            6-month trend
          </p>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '64px' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.accent} stopOpacity="0.25" />
                <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            {points.length > 1 && <path d={areaPath} fill="url(#heroFill)" />}
            {points.length > 1 && (
              <path d={linePath} fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
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
        </div>
      </div>
    </div>
  );
}