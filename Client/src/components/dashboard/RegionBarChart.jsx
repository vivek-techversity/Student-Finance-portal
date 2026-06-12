import { fmt$ } from '../../utils/formatters';

const T = {
  border: '#E7E4E0',
  label:  '#A8A29E',
  sub:    '#78716C',
  text:   '#1C1917',
  iconBg: '#F5F3F0',
  track:  '#F0EDE9',
  accent: '#6366F1',
  negative: '#DC2626',
};


export default function RegionBarChart({ regionData }) {
  const max = Math.max(...regionData.map((r) => r.profit), 1);

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.iconBg }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6"  y1="20" x2="6"  y2="14"/>
            <line x1="2"  y1="20" x2="22" y2="20"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: T.text }}>Profit by Region</p>
          <p className="text-[11px]" style={{ color: T.label }}>Net profit (USD) per region</p>
        </div>
      </div>

      <div className="px-5 py-4">
        {regionData.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm" style={{ color: T.label }}>No data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {regionData.map((r) => {
              const pct = Math.max(4, (r.profit / max) * 100);
              const isNeg = r.profit < 0;
              // single-hue scale: opacity reflects relative weight
              const opacity = isNeg ? 1 : 0.35 + 0.65 * (r.profit / max);

              return (
                <div key={r.region} className="flex items-center gap-3">
                  {/* Label */}
                  <p className="text-xs font-semibold w-16 flex-shrink-0 text-right" style={{ color: T.sub }}>
                    {r.region}
                  </p>

                  {/* Bar track */}
                  <div className="flex-1 rounded-full h-7 overflow-hidden relative" style={{ background: T.track }}>
                    <div
                      className="h-full rounded-full flex items-center px-3 transition-all duration-500"
                      style={{
                        width: `${isNeg ? 8 : pct}%`,
                        backgroundColor: isNeg ? T.negative : T.accent,
                        opacity,
                      }}
                    >
                      <span className="text-[11px] font-bold text-white whitespace-nowrap">
                        {r.count}
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  <p
                    className="text-xs font-bold w-20 flex-shrink-0 text-right tabular-nums"
                    style={{ color: isNeg ? T.negative : T.text }}
                  >
                    {fmt$(r.profit)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}