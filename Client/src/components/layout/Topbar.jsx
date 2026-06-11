import { useLocation } from 'react-router-dom';

const PAGE_META = {
  '/':          { icon: '📊', title: 'Dashboard' },
  '/students':  { icon: '👥', title: 'All Students' },
  '/analytics': { icon: '📈', title: 'Analytics' },
  '/overdue':   { icon: '🔔', title: 'Overdue' },
};

export default function Topbar({ liveRate, rateLoading, onRefreshRate, children }) {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { icon: '🔍', title: 'Student Detail' };

  return (
    <header className="sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between gap-4 flex-wrap"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>

      {/* Page title */}
      <div className="flex items-center gap-2.5">
        <span className="text-lg leading-none">{meta.icon}</span>
        <h1 className="text-base font-bold text-slate-800 tracking-tight">{meta.title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Live rate */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05))',
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">USD/INR</span>
          {rateLoading ? (
            <span className="text-xs text-slate-400">Loading…</span>
          ) : (
            <span className="text-sm font-bold text-emerald-700">
              {liveRate ? `₹${liveRate.toFixed(2)}` : '—'}
            </span>
          )}
          <button onClick={onRefreshRate} disabled={rateLoading}
            className="text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
            title="Refresh rate">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              className={rateLoading ? 'animate-spin' : ''}>
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </header>
  );
}