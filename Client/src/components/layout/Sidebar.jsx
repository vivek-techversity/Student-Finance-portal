import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';

const NAV_ITEMS = [
  { to: '/',          icon: '📊', label: 'Dashboard',    end: true },
  { to: '/students',  icon: '👥', label: 'All Students' },
  { to: '/analytics', icon: '📈', label: 'Analytics' },
  { to: '/overdue',   icon: '🔔', label: 'Overdue', badge: true },
];

export default function Sidebar({ overdueCount, onAddStudent, onAddPayment, onSetTarget, onExportCSV }) {
  const { admin, logout } = useAuth();
  const showToast = useToast();
  const navigate  = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-60 flex flex-col z-40"
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        borderRight: '1px solid rgba(99,102,241,0.15)',
      }}>

      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Techversity</p>
            <p className="text-[10px] font-medium" style={{ color: 'rgba(165,180,252,0.7)' }}>Finance Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2"
          style={{ color: 'rgba(148,163,184,0.5)' }}>Navigation</p>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${isActive
                ? 'text-white shadow-md'
                : 'hover:text-white'}`
            }
            style={({ isActive }) => isActive
              ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.25))', color: 'white', boxShadow: '0 0 0 1px rgba(99,102,241,0.3)' }
              : { color: 'rgba(148,163,184,0.8)' }}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && overdueCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}>
                {overdueCount}
              </span>
            )}
          </NavLink>
        ))}

        <p className="text-[10px] font-semibold uppercase tracking-widest px-2 pt-4 mb-2"
          style={{ color: 'rgba(148,163,184,0.5)' }}>Quick Actions</p>

        {[
          { icon: '➕', label: 'Add Student',  fn: onAddStudent },
          { icon: '💰', label: 'Add Payment',  fn: onAddPayment },
          { icon: '🎯', label: 'Set Target',   fn: onSetTarget  },
          { icon: '⬇️', label: 'Export CSV',   fn: onExportCSV  },
        ].map(({ icon, label, fn }) => (
          <button
            key={label}
            onClick={fn}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 text-left group"
            style={{ color: 'rgba(148,163,184,0.8)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(148,163,184,0.8)'; }}
          >
            <span className="text-base leading-none">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {(admin?.username?.[0] || 'A').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{admin?.username || 'Admin'}</p>
            <p className="text-[10px]" style={{ color: 'rgba(148,163,184,0.6)' }}>Full Access</p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="transition-colors flex-shrink-0"
            style={{ color: 'rgba(148,163,184,0.5)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.5)'}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}