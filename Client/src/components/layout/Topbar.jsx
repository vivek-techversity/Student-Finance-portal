import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

// ── Lucide-style SVG icons — no emoji ─────────────────────────────────────────
const PageIcons = {
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  students: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  transactions: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3 4 7l4 4"/><path d="M4 7h16"/>
      <path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>
    </svg>
  ),
  analytics: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  overdue: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  detail: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
};

const RefreshIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/>
    <path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const PAGE_META = {
  '/':             { icon: 'dashboard',    title: 'Dashboard',       crumb: null },
  '/students':     { icon: 'students',     title: 'Students',        crumb: 'All Students' },
  '/transactions': { icon: 'transactions', title: 'Transactions',    crumb: null },
  '/analytics':    { icon: 'analytics',    title: 'Analytics',       crumb: null },
  '/overdue':      { icon: 'overdue',      title: 'Overdue',         crumb: null },
};

export default function Topbar({ liveRate, rateLoading, onRefreshRate, students = [], payments = [], calcs = {} }) {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { icon: 'detail', title: 'Student Detail', crumb: 'Students' };

  // Quick summary stats for topbar — computed from live data
  const quickStats = useMemo(() => {
    const now = new Date();
    const todayPayments = payments.filter((p) => {
      const d = new Date(p.date);
      return d.toDateString() === now.toDateString();
    });
    const todayAmount = todayPayments.reduce((a, p) => a + p.amountUSD, 0);

    const overdueCount = students.filter((s) => calcs[s._id]?.isOverdue).length;

    return { todayAmount, todayCount: todayPayments.length, overdueCount, totalStudents: students.length };
  }, [payments, students, calcs]);

  const isRoot = location.pathname === '/';

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #E7E4E0',
        boxShadow: '0 1px 3px rgba(28,25,23,0.04)',
        height: '57px',
      }}
    >
      {/* ── Left: breadcrumb + page title ─────────────────────── */}
      <div className="flex items-center gap-2">
        {meta.crumb && (
          <>
            <span className="text-xs text-stone-400 font-medium">{meta.crumb}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </>
        )}
        <div className="flex items-center gap-2">
          <span style={{ color: '#78716C' }}>{PageIcons[meta.icon]}</span>
          <h1 className="text-sm font-bold tracking-tight" style={{ color: '#1C1917' }}>{meta.title}</h1>
        </div>
      </div>

      {/* ── Right: quick stats + live rate ────────────────────── */}
      <div className="flex items-center gap-3">

        {/* Today's collections — only show if there's data */}
        {isRoot && quickStats.todayCount > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: '#F5F3F0', border: '1px solid #E7E4E0' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium" style={{ color: '#78716C' }}>Today</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: '#1C1917' }}>
              ${quickStats.todayAmount.toFixed(0)}
            </span>
            <span className="text-[10px]" style={{ color: '#A8A29E' }}>
              · {quickStats.todayCount} txn
            </span>
          </div>
        )}

        {/* Total students pill */}
        {isRoot && quickStats.totalStudents > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: '#F5F3F0', border: '1px solid #E7E4E0' }}
          >
            <span className="text-[11px] font-medium" style={{ color: '#78716C' }}>Students</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: '#1C1917' }}>
              {quickStats.totalStudents}
            </span>
          </div>
        )}

        {/* Live USD/INR rate */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: '#F5F3F0', border: '1px solid #E7E4E0' }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: liveRate ? '#10b981' : '#D6D3D1', boxShadow: liveRate ? '0 0 5px rgba(16,185,129,0.5)' : 'none' }}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#A8A29E' }}>
            USD/INR
          </span>
          {rateLoading ? (
            <span className="text-[11px]" style={{ color: '#A8A29E' }}>—</span>
          ) : (
            <span className="text-xs font-bold tabular-nums" style={{ color: '#1C1917' }}>
              {liveRate ? `₹${liveRate.toFixed(2)}` : '—'}
            </span>
          )}
          <button
            onClick={onRefreshRate}
            disabled={rateLoading}
            title="Refresh rate"
            className="transition-colors disabled:opacity-40 flex-shrink-0"
            style={{ color: '#A8A29E' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1C1917'}
            onMouseLeave={e => e.currentTarget.style.color = '#A8A29E'}
          >
            <span className={rateLoading ? 'animate-spin inline-block' : 'inline-block'}>
              <RefreshIcon />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
