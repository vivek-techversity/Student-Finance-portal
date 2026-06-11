import { REGION_COLORS, fmt$ } from '../../utils/formatters';

/**
 * Props:
 *   regionData — [{ region, profit, received, count }] sorted desc by profit
 */
export default function RegionBarChart({ regionData }) {
  const max = Math.max(...regionData.map((r) => r.profit), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#6366f1" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6"  y1="20" x2="6"  y2="14"/>
            <line x1="2"  y1="20" x2="22" y2="20"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Profit by Region</p>
          <p className="text-[11px] text-slate-400">Net profit (USD) per region</p>
        </div>
      </div>

      <div className="px-5 py-4">
        {regionData.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-2xl mb-1.5">📊</p>
            <p className="text-sm">No data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {regionData.map((r) => {
              const pct = Math.max(4, (r.profit / max) * 100);
              const color = REGION_COLORS[r.region] || '#94a3b8';
              const isNeg = r.profit < 0;

              return (
                <div key={r.region} className="flex items-center gap-3">
                  {/* Label */}
                  <p className="text-xs font-semibold text-slate-500 w-16 flex-shrink-0 text-right">
                    {r.region}
                  </p>

                  {/* Bar track */}
                  <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden relative">
                    <div
                      className="h-full rounded-full flex items-center px-3 transition-all duration-500"
                      style={{
                        width: `${isNeg ? 8 : pct}%`,
                        backgroundColor: color,
                        opacity: isNeg ? 0.4 : 1,
                      }}
                    >
                      <span className="text-[11px] font-bold text-white whitespace-nowrap">
                        {r.count}
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  <p
                    className="text-xs font-bold w-20 flex-shrink-0 text-right"
                    style={{ color: isNeg ? '#ef4444' : color }}
                  >
                    {fmt$(r.profit)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {regionData.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-3">
            {regionData.map((r) => (
              <div key={r.region} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: REGION_COLORS[r.region] || '#94a3b8' }}
                />
                <span className="text-[11px] text-slate-500">
                  {r.region} <span className="text-slate-400">({r.count})</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}