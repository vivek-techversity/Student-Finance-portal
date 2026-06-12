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
  negative: '#DC2626',
};

// Rank badge colors — gold / silver / bronze, then neutral
const RANK_STYLES = [
  { bg: '#FEF3C7', color: '#B45309' }, // gold
  { bg: '#F1F5F9', color: '#64748B' }, // silver
  { bg: '#FFEDD5', color: '#C2410C' }, // bronze
  { bg: '#F5F3F0', color: '#78716C' },
  { bg: '#F5F3F0', color: '#78716C' },
];

/**
 * Props:
 *   students — all students array
 *   calcs    — { [studentId]: computed metrics }
 */
export default function UniversityLeaderboard({ students = [], calcs = {} }) {
  const data = useMemo(() => {
    const m = {};
    students.forEach((s) => {
      const c = calcs[s._id];
      if (!c) return;
      const key = s.university?.trim() || 'Unknown';
      if (!m[key]) m[key] = { university: key, profit: 0, received: 0, count: 0 };
      m[key].profit += c.netProfitUSD;
      m[key].received += c.totalReceived;
      m[key].count++;
    });
    return Object.values(m)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [students, calcs]);

  const max = Math.max(...data.map((d) => Math.abs(d.profit)), 1);

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.iconBg }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: T.text }}>Top Universities</p>
          <p className="text-[11px]" style={{ color: T.label }}>Ranked by net profit (USD)</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {data.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm" style={{ color: T.label }}>No data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((d, i) => {
              const rank = RANK_STYLES[i] || RANK_STYLES[RANK_STYLES.length - 1];
              const isNeg = d.profit < 0;
              const pct = Math.max(4, (Math.abs(d.profit) / max) * 100);
              const initials = d.university
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase();

              return (
                <div key={d.university} className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
                    style={{ background: rank.bg, color: rank.color }}
                  >
                    {i + 1}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: '#EDEAE6', color: T.sub, border: `1px solid ${T.border}` }}
                  >
                    {initials || '?'}
                  </div>

                  {/* Name + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold truncate" style={{ color: T.text }}>
                        {d.university}
                      </p>
                      <p
                        className="text-xs font-bold tabular-nums flex-shrink-0"
                        style={{ color: isNeg ? T.negative : T.text }}
                      >
                        {fmt$(d.profit)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: T.track }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: isNeg ? T.negative : T.accent,
                          }}
                        />
                      </div>
                      <span className="text-[11px] flex-shrink-0" style={{ color: T.label }}>
                        {d.count} student{d.count !== 1 ? 's' : ''}
                      </span>
                    </div>
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