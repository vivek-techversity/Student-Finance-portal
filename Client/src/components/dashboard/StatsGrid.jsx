import { fmtShort, fmtINR } from '../../utils/formatters';

/**
 * Props:
 *   totals    — { count, fee, received, outstanding, profit, fullyPaid }
 *   liveRate  — number | null
 */
export default function StatsGrid({ totals, liveRate }) {
  const profitINR = liveRate
    ? fmtINR(totals.profit * liveRate)
    : null;

  const cards = [
    {
      label: 'Total Students',
      value: totals.count,
      sub: `${totals.fullyPaid} fully paid`,
      color: 'blue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      accent: 'from-indigo-500 to-violet-500',
      bg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
    },
    {
      label: 'Total Fee (USD)',
      value: fmtShort(totals.fee),
      sub: liveRate ? fmtINR(totals.fee * liveRate) : '—',
      color: 'slate',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      accent: 'from-slate-400 to-slate-500',
      bg: 'bg-slate-50',
      iconColor: 'text-slate-500',
    },
    {
      label: 'Total Received',
      value: fmtShort(totals.received),
      sub: liveRate ? fmtINR(totals.received * liveRate) : '—',
      color: 'green',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
      accent: 'from-emerald-400 to-green-500',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Outstanding',
      value: fmtShort(totals.outstanding),
      sub: totals.outstanding > 0 ? 'Pending collection' : 'All clear!',
      color: 'red',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      accent: 'from-red-400 to-rose-500',
      bg: 'bg-red-50',
      iconColor: 'text-red-500',
    },
    {
      label: 'Net Profit',
      value: fmtShort(totals.profit),
      sub: profitINR || '—',
      color: 'purple',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      accent: 'from-violet-400 to-purple-500',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-500',
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative"
        >
          {/* Top accent bar */}
          <div className={`h-0.5 w-full bg-gradient-to-r ${c.accent}`} />

          <div className="p-4">
            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-3 ${c.iconColor}`}>
              {c.icon}
            </div>

            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {c.label}
            </p>
            <p className="text-xl font-bold text-slate-800 font-[Space_Grotesk,sans-serif] leading-tight">
              {c.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}