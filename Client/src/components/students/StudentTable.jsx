import Badge from '../ui/Badge';
import { fmt$, fmtDate } from '../../utils/formatters';

export default function StudentTable({ students, calcs, onView, onEdit, onDelete, onAddPayment }) {
  if (students.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>👥</div>
        <p className="text-sm font-semibold text-slate-500">No students found</p>
        <p className="text-xs mt-1 text-slate-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderBottom: '1px solid #e2e8f0' }}>
            {['Student', 'University', 'Region', 'Program', 'Total Fee', 'Received', 'Outstanding', 'Status', 'Last Payment', ''].map((h) => (
              <th key={h}
                className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const c = calcs[s._id];
            if (!c) return null;
            return (
              <tr
                key={s._id}
                onClick={() => onView(s)}
                className="cursor-pointer transition-all duration-150 group"
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  borderLeft: c.isOverdue ? '3px solid #ef4444' : '3px solid transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #fafbff, #f8fafc)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Student */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, hsl(${(s.name.charCodeAt(0) * 15) % 360},70%,55%), hsl(${(s.name.charCodeAt(0) * 15 + 40) % 360},70%,45%))` }}>
                      {s.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">{s.name}</p>
                      {s.email && <p className="text-xs text-slate-400 mt-0.5">{s.email}</p>}
                      {s.phone && <p className="text-xs text-slate-400">{s.phone}</p>}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5 text-slate-600 max-w-[140px] truncate text-xs">{s.university}</td>

                <td className="px-4 py-3.5">
                  <Badge variant="region" value={s.region} />
                </td>

                <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{s.program}</td>

                <td className="px-4 py-3.5 font-semibold text-slate-700 whitespace-nowrap">{fmt$(s.totalFee)}</td>

                <td className="px-4 py-3.5 font-bold whitespace-nowrap" style={{ color: '#10b981' }}>
                  {fmt$(c.totalReceived)}
                </td>

                <td className="px-4 py-3.5 font-bold whitespace-nowrap"
                  style={{ color: c.outstanding > 0 ? '#ef4444' : '#10b981' }}>
                  {fmt$(c.outstanding)}
                </td>

                <td className="px-4 py-3.5">
                  <Badge variant="status" value={c.status} />
                  {c.isOverdue && (
                    <p className="text-[10px] font-bold mt-0.5" style={{ color: '#ef4444' }}>Overdue</p>
                  )}
                </td>

                <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                  {c.lastPaymentDate ? (
                    <>
                      <p className="font-medium text-slate-600">{fmtDate(c.lastPaymentDate)}</p>
                      <p>{c.daysSinceLast}d ago</p>
                    </>
                  ) : (
                    <span className="text-slate-300">No payment</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onAddPayment(s)} title="Add payment"
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: '#10b981' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                    <button onClick={() => onEdit(s)} title="Edit"
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: '#6366f1' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => onDelete(s)} title="Delete"
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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