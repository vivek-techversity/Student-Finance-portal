import { useMemo } from 'react';
import { useAppData } from '../components/layout/AppLayout';
import StatsGrid from '../components/dashboard/StatsGrid';
import TargetCard from '../components/dashboard/TargetCard';
import OverdueCard from '../components/dashboard/OverdueCard';
import RegionBarChart from '../components/dashboard/RegionBarChart';
import MethodDonut from '../components/dashboard/MethodDonut';
import { fmtDate, fmt$ } from '../utils/formatters';

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

  // ── Totals ────────────────────────────────────────────────────
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

  // ── This month's collected ─────────────────────────────────────
  const thisMonth = useMemo(() => {
    const n = new Date();
    return payments
      .filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
      })
      .reduce((a, p) => a + p.amountUSD, 0);
  }, [payments]);

  // ── Region data ───────────────────────────────────────────────
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

  // ── Recent payments (last 5) ──────────────────────────────────
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .map((p) => {
        const student = students.find(
          (s) => s._id === (p.studentId?._id || p.studentId)
        );
        return { ...p, studentName: student?.name || '—' };
      });
  }, [payments, students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const tPct = Math.min(100, (thisMonth / (target || 1)) * 100);

  return (
    <div>
      {/* ── Stats Grid ─────────────────────────── */}
      <StatsGrid totals={totals} liveRate={liveRate} />

      {/* ── Target + Overdue ──────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <TargetCard
          thisMonth={thisMonth}
          target={target}
          tPct={tPct}
          liveRate={liveRate}
        />
        <OverdueCard
          overdueStudents={overdueStudents}
          calcs={calcs}
          onView={onViewStudent}
          onAddPayment={onAddPaymentFor}
        />
      </div>

      {/* ── Charts row ────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <RegionBarChart regionData={regionData} />
        <MethodDonut payments={payments} />
      </div>

      {/* ── Recent Payments ───────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Recent Payments</h2>
            <p className="text-xs text-slate-400 mt-0.5">Last {recentPayments.length} transactions</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
            {payments.length} total
          </span>
        </div>

        {recentPayments.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-3xl mb-2">💸</p>
            <p className="text-sm font-medium">No payments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentPayments.map((p) => {
              const net = p.amountUSD - (p.bankCharge || 0) - (p.gatewayFee || 0) - (p.otherDeduction || 0);
              const hasDeductions = (p.bankCharge || 0) + (p.gatewayFee || 0) + (p.otherDeduction || 0) > 0;
              return (
                <div
                  key={p._id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  {/* Method icon */}
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-base">
                    {
                      { 'Bank Transfer': '🏦', UPI: '📱', PayPal: '🅿️', EMI: '💳', Other: '💵' }[p.method] || '💵'
                    }
                  </div>

                  {/* Student + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.studentName}</p>
                    <p className="text-xs text-slate-400">
                      {fmtDate(p.date)} · {p.method}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-600">{fmt$(p.amountUSD)}</p>
                    {hasDeductions && (
                      <p className="text-[11px] text-slate-400">net {fmt$(net)}</p>
                    )}
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