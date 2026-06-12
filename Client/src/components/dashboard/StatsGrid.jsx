import { fmtShort, fmtINR } from '../../utils/formatters';

// Warm neutral palette — matches sidebar/body theme
const T = {
  cardBorder:  '#E7E4E0',
  labelColor:  '#A8A29E',   // stone-400
  valueColor:  '#1C1917',   // stone-900
  subColor:    '#78716C',   // stone-500
  iconBg:      '#EDEAE6',   // warm beige tint
  iconColor:   '#57534E',   // stone-600
};

// Semantic accent dots (tiny, not overwhelming)
const ACCENTS = {
  students:    '#6366F1',  // indigo — identity
  fee:         '#78716C',  // stone — neutral
  received:    '#10B981',  // emerald — positive
  outstanding: '#EF4444',  // red — alert
  profit:      '#8B5CF6',  // violet — premium
};

const StudentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const FeeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const ReceivedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const OutstandingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ProfitIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

export default function StatsGrid({ totals, liveRate }) {
  const profitINR = liveRate ? fmtINR(totals.profit * liveRate) : null;

  const cards = [
    {
      key: 'students',
      label: 'Total Students',
      value: totals.count,
      sub: `${totals.fullyPaid} fully paid`,
      Icon: StudentIcon,
      accent: ACCENTS.students,
    },
    {
      key: 'fee',
      label: 'Total Fee',
      value: fmtShort(totals.fee),
      sub: liveRate ? fmtINR(totals.fee * liveRate) : '—',
      Icon: FeeIcon,
      accent: ACCENTS.fee,
    },
    {
      key: 'received',
      label: 'Total Received',
      value: fmtShort(totals.received),
      sub: liveRate ? fmtINR(totals.received * liveRate) : '—',
      Icon: ReceivedIcon,
      accent: ACCENTS.received,
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      value: fmtShort(totals.outstanding),
      sub: totals.outstanding > 0 ? 'Pending collection' : 'All clear',
      Icon: OutstandingIcon,
      accent: ACCENTS.outstanding,
    },
    {
      key: 'profit',
      label: 'Net Profit',
      value: fmtShort(totals.profit),
      sub: profitINR || '—',
      Icon: ProfitIcon,
      accent: ACCENTS.profit,
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.key}
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: `1px solid ${T.cardBorder}` }}
        >
          {/* Thin semantic top line — data-meaningful, not decorative */}
          <div style={{ height: '3px', background: c.accent }} />

          <div className="p-4 pt-3.5">
            {/* Icon row */}
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: T.iconBg, color: T.iconColor }}
              >
                <c.Icon />
              </div>
              {/* Accent dot — subtle visual anchor */}
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: c.accent, opacity: 0.5 }}
              />
            </div>

            {/* Label */}
            <p
              className="text-[11px] font-medium mb-1.5 truncate"
              style={{ color: T.labelColor, letterSpacing: '0.01em' }}
            >
              {c.label}
            </p>

            {/* Value — tabular, bold, large */}
            <p
              className="text-[22px] font-bold leading-none mb-1"
              style={{
                color: T.valueColor,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.03em',
              }}
            >
              {c.value}
            </p>

            {/* Sub — INR or status */}
            <p
              className="text-[11px] truncate"
              style={{ color: T.subColor, fontVariantNumeric: 'tabular-nums' }}
            >
              {c.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}