import { useMemo } from 'react';
import { useAppData } from '../components/layout/AppLayout';
import StatsGrid from '../components/dashboard/StatsGrid';
import ExchangeRateCard from '../components/dashboard/ExchangeRateCard';
import OverdueCard from '../components/dashboard/OverdueCard';
import RegionBarChart from '../components/dashboard/RegionBarChart';
import MethodDonut from '../components/dashboard/MethodDonut';
import RevenueTrendChart from '../components/dashboard/RevenueTrendChart';
import HeroSummaryCard from '../components/dashboard/HeroSummaryCard';
import PaymentHeatmap from '../components/dashboard/PaymentHeatmap';
import UniversityLeaderboard from '../components/dashboard/UniversityLeaderboard';
import { fmtDate, fmt$ } from '../utils/formatters';

// Payment method icons — SVG, no emoji
const MethodIcons = {
  'Bank Transfer': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
      <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
      <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
    </svg>
  ),
  'UPI': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  'PayPal': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
    </svg>
  ),
  'EMI': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
};

const DefaultPayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const T = {
  border:      '#E7E4E0',
  borderLight: '#F0EDE9',
  label:       '#A8A29E',
  sub:         '#78716C',
  text:        '#1C1917',
  iconBg:      '#EDEAE6',
  positive:    '#10B981',
};

export default function DashboardPage() {
  const {
    students = [],
    payments = [],
    calcs = {},
    target = 15000,
    liveRate,
    overdueStudents = [],
    loading,
    onViewStudent,
    onAddPaymentFor,
  } = useAppData();

  const totals = useMemo(() => {
    const v = Object.values(calcs);
    return {
      count: students.length,
      fee: students.reduce((a, s) => a + s.totalFee, 0),
      received: v.reduce((a, c) => a + c.totalReceived, 0),
      outstanding: v.reduce((a, c) => a + c.outstanding, 0),
      profit: v.reduce((a, c) => a + c.netProfitUSD, 0),
      fullyPaid: v.filter((c) => c.status === 'Fully Paid').length,
    };
  }, [students, calcs]);

  const thisMonth = useMemo(() => {
    const n = new Date();
    return payments
      .filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
      })
      .reduce((a, p) => a + p.amountUSD, 0);
  }, [payments]);

  const monthlySeries = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('en-US', { month: 'short' }), total: 0 });
    }
    payments.forEach((p) => {
      const d = new Date(p.date);
      const m = months.find((mo) => mo.year === d.getFullYear() && mo.month === d.getMonth());
      if (m) {
        m.total += p.amountUSD;
      }
    });
    return months;
  }, [payments]);

  const trends = useMemo(() => {
    const len = monthlySeries.length;
    const cur = monthlySeries[len - 1]?.total || 0;
    const prev = monthlySeries[len - 2]?.total || 0;
    const pct = prev !== 0 ? ((cur - prev) / Math.abs(prev)) * 100 : (cur > 0 ? 100 : null);
    return { received: pct, profit: pct };
  }, [monthlySeries]);

  const regionData = useMemo(() => {
    const m = {};
    students.forEach((s) => {
      const c = calcs[s._id];
      if (!c) return;
      if (!m[s.region]) m[s.region] = { profit: 0, received: 0, count: 0 };
      m[s.region].profit += c.netProfitUSD;
      m[s.region].received += c.totalReceived;
      m[s.region].count++;
    });
    return Object.entries(m)
      .map(([region, v]) => ({ region, ...v }))
      .sort((a, b) => b.profit - a.profit);
  }, [students, calcs]);

  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .map((p) => {
        const student = students.find((s) => s._id === (p.studentId?._id || p.studentId));
        return { ...p, studentName: student?.name || '—' };
      });
  }, [payments, students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: '#1C1917', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: T.label }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const tPct = Math.min(100, (thisMonth / (target || 1)) * 100);

  return (
    <div>
      {/* Hero — This Month summary with sparkline + target */}
      <div className="mb-6">
        <HeroSummaryCard thisMonth={thisMonth} target={target} tPct={tPct} liveRate={liveRate} series={monthlySeries} />
      </div>

      {/* Stats Grid */}
      <StatsGrid totals={totals} liveRate={liveRate} trends={trends} />

      {/* Revenue Trend */}
      <div className="mb-6">
        <RevenueTrendChart series={monthlySeries} />
      </div>

      {/* Exchange Rate + Overdue */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <ExchangeRateCard liveRate={liveRate} payments={payments} />
        <OverdueCard
          overdueStudents={overdueStudents}
          calcs={calcs}
          onView={onViewStudent}
          onAddPayment={onAddPaymentFor}
        />
      </div>

      {/* University Leaderboard + Payment Heatmap */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <UniversityLeaderboard students={students} calcs={calcs} />
        <PaymentHeatmap payments={payments} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <RegionBarChart regionData={regionData} />
        <MethodDonut payments={payments} />
      </div>

      {/* Recent Payments */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: `1px solid ${T.border}` }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: T.text }}>
              Recent Payments
            </h2>
            <p className="text-xs mt-0.5" style={{ color: T.label }}>
              Last {recentPayments.length} transactions
            </p>
          </div>
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
            style={{ color: T.sub, background: '#F5F3F0', border: `1px solid ${T.border}` }}
          >
            {payments.length} total
          </span>
        </div>

        {recentPayments.length === 0 ? (
          <div className="py-14 text-center">
            {/* SVG placeholder — no emoji */}
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#EDEAE6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: T.sub }}>No payments yet</p>
            <p className="text-xs mt-0.5" style={{ color: T.label }}>Payments will appear here</p>
          </div>
        ) : (
          <div className="px-5 pt-4 pb-2">
            {recentPayments.map((p, i) => {
              const net = p.amountUSD - (p.bankCharge || 0) - (p.gatewayFee || 0) - (p.otherDeduction || 0);
              const hasDeductions = (p.bankCharge || 0) + (p.gatewayFee || 0) + (p.otherDeduction || 0) > 0;
              const MethodIcon = MethodIcons[p.method] ? () => MethodIcons[p.method] : DefaultPayIcon;
              const initials = (p.studentName || '?')[0].toUpperCase();
              const isLast = i === recentPayments.length - 1;

              return (
                <div key={p._id} className="flex gap-4 relative">
                  {/* Timeline rail */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold z-10"
                      style={{ background: T.iconBg, color: T.sub, border: `1px solid ${T.border}` }}
                    >
                      {initials}
                    </div>
                    {!isLast && (
                      <div className="flex-1 w-px" style={{ background: T.borderLight, minHeight: '36px' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: T.text }}>
                          {p.studentName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span style={{ color: T.label }}>
                            <MethodIcon />
                          </span>
                          <p className="text-xs" style={{ color: T.label }}>
                            {p.method} · {fmtDate(p.date)}
                          </p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold tabular-nums" style={{ color: T.positive }}>
                          {fmt$(p.amountUSD)}
                        </p>
                        {hasDeductions && (
                          <p className="text-[11px] tabular-nums" style={{ color: T.label }}>
                            net {fmt$(net)}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ background: '#F5F3F0', color: T.sub }}
                    >
                      {timeAgo(p.date)}
                    </span>
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