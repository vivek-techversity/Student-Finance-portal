import Badge from '../ui/Badge';
import { fmt$, fmtDate } from '../../utils/formatters';

// Warm neutral palette — matches sidebar + body #F5F3F0
const T = {
  border:      '#E7E4E0',
  borderLight: '#EDEAE6',
  theadBg:     '#F5F3F0',
  theadText:   '#A8A29E',
  rowHover:    '#F0EDE9',
  text:        '#1C1917',
  textMid:     '#57534E',
  textLight:   '#A8A29E',
  avatarBg:    '#292524',   // warm dark — consistent with sidebar logo
  positive:    '#10B981',
  negative:    '#EF4444',
  editBtn:     '#78716C',
};

const STAGE_COLORS = {
  'Admission':           { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', dot: '#3B82F6' },
  'Activation':          { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', dot: '#22C55E' },
  'Learning':            { bg: '#FEFCE8', border: '#FDE68A', text: '#A16207', dot: '#EAB308' },
  'Research':            { bg: '#FDF4FF', border: '#E9D5FF', text: '#7E22CE', dot: '#A855F7' },
  'Submission':          { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', dot: '#F97316' },
  'Conferment':          { bg: '#F0FDFA', border: '#99F6E4', text: '#0F766E', dot: '#14B8A6' },
  'Alumni':              { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', dot: '#F43F5E' },
  'Ghost':               { bg: '#F5F3F0', border: '#D6D3D1', text: '#78716C', dot: '#A8A29E' },
  'Refund':              { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', dot: '#EF4444' },
  'Admission Cancelled': { bg: '#F5F3F0', border: '#D6D3D1', text: '#57534E', dot: '#78716C' },
};

// Deterministic warm avatar color from name — stays within stone/warm palette
function avatarColor(name) {
  const warm = ['#292524', '#44403C', '#57534E', '#0F766E', '#15803D', '#1D4ED8', '#7E22CE', '#C2410C'];
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % warm.length;
  return warm[idx];
}

export default function StudentTable({ students, calcs, onView, onEdit, onDelete, onAddPayment }) {
  if (students.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 16px',
          background: '#EAE8E4', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: T.textMid, marginBottom: '4px' }}>No students found</p>
        <p style={{ fontSize: '12px', color: T.textLight }}>Try adjusting your search or filters</p>
      </div>
    );
  }

  const HEADERS = ['Student', 'University', 'Region', 'Program', 'Lifecycle', 'Total Fee', 'Received', 'Outstanding', 'Status', 'Last Payment', ''];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: T.theadBg, borderBottom: `1px solid ${T.border}` }}>
            {HEADERS.map((h) => (
              <th key={h} style={{
                padding: '10px 16px', textAlign: 'left',
                fontSize: '10px', fontWeight: 700, color: T.theadText,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const c = calcs[s._id];
            if (!c) return null;
            const sc = STAGE_COLORS[s.journeyStatus] || { bg: '#F5F3F0', border: '#D6D3D1', text: '#78716C', dot: '#A8A29E' };

            return (
              <tr
                key={s._id}
                onClick={() => onView(s)}
                className="group"
                style={{
                  borderBottom: `1px solid ${T.borderLight}`,
                  borderLeft: c.isOverdue ? '3px solid #EF4444' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.rowHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Student */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: avatarColor(s.name),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0,
                    }}>
                      {s.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{s.name}</p>
                      {s.email && <p style={{ fontSize: '11px', color: T.textLight, marginTop: '1px' }}>{s.email}</p>}
                      {s.phone && <p style={{ fontSize: '11px', color: T.textLight }}>{s.phone}</p>}
                    </div>
                  </div>
                </td>

                <td style={{ padding: '12px 16px', color: T.textMid, fontSize: '12px', maxWidth: '140px' }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.university}
                  </span>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <Badge variant="region" value={s.region} />
                </td>

                <td style={{ padding: '12px 16px', color: T.textMid, fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {s.program}
                </td>

                {/* Lifecycle badge */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {s.journeyStatus && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      fontSize: '11px', fontWeight: 600,
                      color: sc.text, background: sc.bg,
                      borderRadius: '20px', padding: '3px 9px',
                      border: `1px solid ${sc.border}`,
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                      {s.journeyStatus}
                    </span>
                  )}
                </td>

                {/* Numbers — tabular, clear hierarchy */}
                <td style={{ padding: '12px 16px', fontWeight: 700, color: T.text, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt$(s.totalFee)}
                </td>

                <td style={{ padding: '12px 16px', fontWeight: 700, color: T.positive, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt$(c.totalReceived)}
                </td>

                <td style={{ padding: '12px 16px', fontWeight: 700, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: c.outstanding > 0 ? T.negative : T.positive }}>
                  {fmt$(c.outstanding)}
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <Badge variant="status" value={c.status} />
                  {c.isOverdue && (
                    <p style={{ fontSize: '10px', fontWeight: 700, color: T.negative, marginTop: '2px' }}>Overdue</p>
                  )}
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {c.lastPaymentDate ? (
                    <>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: T.textMid }}>{fmtDate(c.lastPaymentDate)}</p>
                      <p style={{ fontSize: '11px', color: T.textLight }}>{c.daysSinceLast}d ago</p>
                    </>
                  ) : (
                    <span style={{ fontSize: '12px', color: T.textLight }}>No payment</span>
                  )}
                </td>

                {/* Actions — visible on row hover */}
                <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', opacity: 0, transition: 'opacity 0.15s' }}
                    className="group-hover:opacity-100"
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  >
                    {/* Add payment */}
                    <button onClick={() => onAddPayment(s)} title="Add payment"
                      style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: T.positive, transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                    {/* Edit */}
                    <button onClick={() => onEdit(s)} title="Edit"
                      style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: T.editBtn, transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EAE8E4'; e.currentTarget.style.color = T.text; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.editBtn; }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    {/* Delete */}
                    <button onClick={() => onDelete(s)} title="Delete"
                      style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: T.negative, transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}