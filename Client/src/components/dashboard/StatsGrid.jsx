import { fmtShort, fmtINR } from '../../utils/formatters';

// Warm neutral palette — matches sidebar/body theme
const T = {
  cardBorder: '#E7E4E0',
  labelColor: '#A8A29E',
  valueColor: '#1C1917',
  subColor:   '#78716C',
  iconBg:     '#F5F3F0',
  iconColor:  '#57534E',
  accent:     '#6366F1',
  positive:   '#059669',
  negative:   '#DC2626',
};

const StudentIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const FeeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const ReceivedIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const OutstandingIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const ProfitIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

function TrendBadge({ pct }) {
  if (pct === null || pct === undefined) return null;
  const isUp = pct >= 0;
  const color = isUp ? T.positive : T.negative;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums" style={{ color }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: isUp ? 'none' : 'rotate(180deg)' }}>
        <polyline points="18 15 12 9 6 15"/>
      </svg>
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

export default function StatsGrid({ totals, liveRate, trends = {} }) {
  const profitINR = liveRate ? fmtINR(totals.profit * liveRate) : null;

  const cards = [
    {
      key: 'students',
      label: 'Total Students',
      value: totals.count,
      sub: `${totals.fullyPaid} fully paid`,
      Icon: StudentIcon,
    },
    {
      key: 'fee',
      label: 'Total Fee',
      value: fmtShort(totals.fee),
      sub: liveRate ? fmtINR(totals.fee * liveRate) : '—',
      Icon: FeeIcon,
    },
    {
      key: 'received',
      label: 'Total Received',
      value: fmtShort(totals.received),
      sub: liveRate ? fmtINR(totals.received * liveRate) : '—',
      Icon: ReceivedIcon,
      valueColor: T.positive,
      trend: trends.received,
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      value: fmtShort(totals.outstanding),
      sub: totals.outstanding > 0 ? 'Pending collection' : 'All clear',
      Icon: OutstandingIcon,
      valueColor: totals.outstanding > 0 ? T.negative : T.valueColor,
    },
    {
      key: 'profit',
      label: 'Net Profit',
      value: fmtShort(totals.profit),
      sub: profitINR || '—',
      Icon: ProfitIcon,
      valueColor: T.accent,
      trend: trends.profit,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((c) => (
        <div
          key={c.key}
          className="bg-white rounded-2xl p-4"
          style={{ border: `1px solid ${T.cardBorder}` }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: T.iconBg, color: T.iconColor }}
          >
            <c.Icon />
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <p
              className="text-[11px] font-medium truncate"
              style={{ color: T.labelColor, letterSpacing: '0.01em' }}
            >
              {c.label}
            </p>
            <TrendBadge pct={c.trend} />
          </div>

          <p
            className="text-[22px] font-extrabold leading-none mb-1 tabular-nums"
            style={{ color: c.valueColor || T.valueColor, letterSpacing: '-0.02em' }}
          >
            {c.value}
          </p>

          <p className="text-[11px] truncate tabular-nums" style={{ color: T.subColor }}>
            {c.sub}
          </p>
        </div>
      ))}
    </div>
  );
}