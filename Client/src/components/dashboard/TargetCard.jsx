import { fmt$, fmtINR } from '../../utils/formatters';

const T = {
  border:  '#E7E4E0',
  label:   '#A8A29E',
  sub:     '#78716C',
  text:    '#1C1917',
  iconBg:  '#EDEAE6',
  trackBg: '#EAE8E4',
};

// Progress bar color — semantic, no gradient
function barColor(pct) {
  if (pct >= 100) return '#10B981'; // emerald
  if (pct >= 60)  return '#1C1917'; // dark — strong progress
  if (pct >= 30)  return '#F59E0B'; // amber — mid
  return '#EF4444';                  // red — low
}

function pctColor(pct) {
  if (pct >= 100) return '#10B981';
  if (pct >= 60)  return '#1C1917';
  if (pct >= 30)  return '#F59E0B';
  return '#EF4444';
}

export default function TargetCard({ thisMonth, target, tPct, liveRate }) {
  const remaining = Math.max(0, target - thisMonth);
  const achieved  = tPct >= 100;

  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{ border: `1px solid ${T.border}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: T.iconBg }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: T.text }}>Monthly Target</p>
            <p className="text-[11px]" style={{ color: T.label }}>
              {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: pctColor(tPct) }}
        >
          {tPct.toFixed(0)}%
        </span>
      </div>

      {/* Amount */}
      <p
        className="text-2xl font-bold mb-0.5"
        style={{ color: T.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
      >
        {fmt$(thisMonth)}
        <span className="text-sm font-normal ml-1.5" style={{ color: T.label }}>
          / {fmt$(target)}
        </span>
      </p>

      {liveRate && (
        <p className="text-xs mb-3" style={{ color: T.label }}>
          ≈ {fmtINR(thisMonth * liveRate)} collected this month
        </p>
      )}

      {/* Progress bar — solid color, no gradient */}
      <div
        className="h-1.5 rounded-full overflow-hidden mb-3"
        style={{ background: T.trackBg }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(tPct, 100)}%`, background: barColor(tPct) }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {achieved ? (
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="text-xs font-semibold" style={{ color: '#10B981' }}>
              Target achieved
            </span>
          </div>
        ) : (
          <span className="text-xs" style={{ color: T.sub }}>
            <span className="font-semibold" style={{ color: T.text }}>
              {fmt$(remaining)}
            </span>{' '}remaining
          </span>
        )}
        <span className="text-xs" style={{ color: T.label }}>Goal: {fmt$(target)}</span>
      </div>
    </div>
  );
}