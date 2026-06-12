import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';

// SVG Icons — Lucide-style clean line icons (replacing emojis)
const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Students: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Transactions: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3 4 7l4 4"/><path d="M4 7h16"/>
      <path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>
    </svg>
  ),
  Analytics: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Overdue: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  FounderReport: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z"/>
      <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>
    </svg>
  ),
  AddStudent: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/>
      <line x1="17" y1="11" x2="23" y2="11"/>
    </svg>
  ),
  AddPayment: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  SetTarget: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  ExportCSV: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Logo: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: '/',             Icon: Icons.Dashboard,    label: 'Dashboard',   end: true },
  { to: '/students',     Icon: Icons.Students,     label: 'Students' },
  { to: '/transactions', Icon: Icons.Transactions, label: 'Transactions' },
  { to: '/analytics',    Icon: Icons.Analytics,    label: 'Analytics' },
  { to: '/overdue',      Icon: Icons.Overdue,      label: 'Overdue',     badge: true },
  { to: '/founder-report', Icon: Icons.FounderReport, label: 'Founder Report' },
];

const ACTION_ITEMS = [
  { Icon: Icons.AddStudent, label: 'Add Student', fnKey: 'onAddStudent' },
  { Icon: Icons.AddPayment, label: 'Add Payment', fnKey: 'onAddPayment' },
  { Icon: Icons.SetTarget,  label: 'Set Target',  fnKey: 'onSetTarget'  },
  { Icon: Icons.ExportCSV,  label: 'Export CSV',  fnKey: 'onExportCSV'  },
];

// Sidebar color tokens — D Warm Neutral theme
const S = {
  bg:           '#F5F3F0',          // warm beige — matches body
  border:       '#E7E4E0',          // subtle warm divider
  logoIcon:     '#1C1917',          // dark warm icon bg
  sectionLabel: '#A8A29E',          // stone-400
  textInactive: '#78716C',          // stone-500
  textActive:   '#1C1917',          // stone-900
  activeBg:     '#EAE8E4',          // slightly darker beige pill
  hoverBg:      '#EDEAE6',          // hover state
  footerBg:     '#EDEAE6',          // footer row bg
  avatarBg:     '#1C1917',          // dark avatar circle
  badge:        '#EF4444',          // red badge
};

export default function Sidebar({ overdueCount, onAddStudent, onAddPayment, onSetTarget, onExportCSV }) {
  const { admin, logout } = useAuth();
  const showToast = useToast();
  const navigate  = useNavigate();

  const handlers = { onAddStudent, onAddPayment, onSetTarget, onExportCSV };

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 w-60 flex flex-col z-40"
      style={{ background: S.bg, borderRight: `1px solid ${S.border}` }}
    >
      {/* ── Logo ─────────────────────────────────────── */}
      <div className="px-5 py-5" style={{ borderBottom: `1px solid ${S.border}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ background: S.logoIcon }}
          >
            <Icons.Logo />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ color: S.textActive }}>Techversity</p>
            <p className="text-[10px] font-medium" style={{ color: S.sectionLabel }}>Finance Portal</p>
          </div>
        </div>
      </div>

      {/* ── Nav ──────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p
          className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-2"
          style={{ color: S.sectionLabel }}
        >
          Main
        </p>

        {NAV_ITEMS.map(({ to, Icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={({ isActive }) => ({
              background: isActive ? S.activeBg : 'transparent',
              color: isActive ? S.textActive : S.textInactive,
              fontWeight: isActive ? 600 : 500,
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.dataset.active) {
                e.currentTarget.style.background = S.hoverBg;
                e.currentTarget.style.color = S.textActive;
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.dataset.active) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = S.textInactive;
              }
            }}
          >
            <span style={{ color: 'inherit', opacity: 0.85 }}><Icon /></span>
            <span className="flex-1">{label}</span>
            {badge && overdueCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none text-white"
                style={{ background: S.badge }}
              >
                {overdueCount}
              </span>
            )}
          </NavLink>
        ))}

        <p
          className="text-[10px] font-semibold uppercase tracking-wider px-2 pt-4 mb-2"
          style={{ color: S.sectionLabel }}
        >
          Actions
        </p>

        {ACTION_ITEMS.map(({ Icon, label, fnKey }) => (
          <button
            key={label}
            onClick={handlers[fnKey]}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left"
            style={{ color: S.textInactive, background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = S.hoverBg; e.currentTarget.style.color = S.textActive; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.textInactive; }}
          >
            <span style={{ opacity: 0.75 }}><Icon /></span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Footer ───────────────────────────────────── */}
      <div className="px-3 py-3" style={{ borderTop: `1px solid ${S.border}` }}>
        <div
          className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
          style={{ background: S.footerBg }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: S.avatarBg }}
          >
            {(admin?.username?.[0] || 'A').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: S.textActive }}>
              {admin?.username || 'Admin'}
            </p>
            <p className="text-[10px]" style={{ color: S.sectionLabel }}>Full Access</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="transition-colors flex-shrink-0"
            style={{ color: S.sectionLabel }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = S.sectionLabel}
          >
            <Icons.Logout />
          </button>
        </div>
      </div>
    </aside>
  );
}