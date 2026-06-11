import { fmt$, fmtINR } from '../../utils/formatters';

/**
 * Props:
 *   thisMonth — number (USD collected this month)
 *   target    — number (monthly target USD)
 *   tPct      — number 0-100
 *   liveRate  — number | null
 */
export default function TargetCard({ thisMonth, target, tPct, liveRate }) {
  const remaining = Math.max(0, target - thisMonth);

  const barColor =
    tPct >= 100
      ? 'from-emerald-400 to-green-500'
      : tPct >= 60
      ? 'from-indigo-400 to-violet-500'
      : tPct >= 30
      ? 'from-amber-400 to-orange-500'
      : 'from-red-400 to-rose-500';

  const labelColor =
    tPct >= 100
      ? 'text-emerald-600'
      : tPct >= 60
      ? 'text-indigo-600'
      : tPct >= 30
      ? 'text-amber-600'
      : 'text-red-500';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#6366f1" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Monthly Target</p>
            <p className="text-[11px] text-slate-400">
              {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <span className={`text-sm font-bold ${labelColor}`}>
          {tPct.toFixed(0)}%
        </span>
      </div>

      {/* Big number */}
      <p className="text-2xl font-bold text-slate-800 mb-0.5">
        {fmt$(thisMonth)}
        <span className="text-sm font-normal text-slate-400 ml-1">/ {fmt$(target)}</span>
      </p>
      {liveRate && (
        <p className="text-xs text-slate-400 mb-3">
          ≈ {fmtINR(thisMonth * liveRate)} collected this month
        </p>
      )}

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${tPct}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        {tPct >= 100 ? (
          <span className="font-semibold text-emerald-600">🎉 Target achieved!</span>
        ) : (
          <span className="text-slate-500">
            <span className="font-semibold text-slate-700">{fmt$(remaining)}</span> remaining
          </span>
        )}
        <span className="text-slate-400">Target: {fmt$(target)}</span>
      </div>
    </div>
  );
}