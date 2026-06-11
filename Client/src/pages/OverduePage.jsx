import { useAppData } from '../components/layout/AppLayout';
import Badge from '../components/ui/Badge';
import { fmt$, fmtDate } from '../utils/formatters';

export default function OverduePage() {
  const {
    overdueStudents = [],
    calcs           = {},
    loading,
    onViewStudent,
    onAddPaymentFor,
    onEditStudent,
  } = useAppData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* ── Header banner ─────────────────────── */}
      {overdueStudents.length > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-5
          flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#ef4444" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-red-700">
              {overdueStudents.length} student{overdueStudents.length !== 1 ? 's' : ''} overdue
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              No payment received in 30+ days or no payment at all
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-5
          flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#10b981" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-700">All caught up!</p>
            <p className="text-xs text-emerald-600 mt-0.5">No overdue students right now</p>
          </div>
        </div>
      )}

      {/* ── Table ─────────────────────────────── */}
      {overdueStudents.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    'Student', 'University', 'Region', 'Program',
                    'Outstanding', 'Last Payment', 'Days Overdue', 'Status', '',
                  ].map((h) => (
                    <th key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500
                        uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueStudents.map((s) => {
                  const c = calcs[s._id];
                  if (!c) return null;

                  const daysOverdue = c.daysSinceLast ?? '∞';
                  const urgency =
                    c.daysSinceLast === null       ? 'bg-red-100 text-red-600'
                    : c.daysSinceLast > 60         ? 'bg-red-100 text-red-600'
                    : c.daysSinceLast > 30         ? 'bg-orange-100 text-orange-600'
                    :                                'bg-amber-100 text-amber-600';

                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-red-50/30 transition-colors border-l-2 border-l-red-300 cursor-pointer"
                      onClick={() => onViewStudent(s)}
                    >
                      {/* Student */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 leading-tight">{s.name}</p>
                        {s.email && <p className="text-xs text-slate-400 mt-0.5">{s.email}</p>}
                        {s.phone && <p className="text-xs text-slate-400">{s.phone}</p>}
                      </td>

                      <td className="px-4 py-3 text-slate-600 max-w-[130px] truncate">
                        {s.university}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="region" value={s.region} />
                      </td>

                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {s.program}
                      </td>

                      <td className="px-4 py-3 font-bold text-red-500 whitespace-nowrap">
                        {fmt$(c.outstanding)}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {c.lastPaymentDate ? (
                          <>
                            <p>{fmtDate(c.lastPaymentDate)}</p>
                            <p className="text-slate-300">{fmt$(c.totalReceived)} received</p>
                          </>
                        ) : (
                          <span className="text-red-400 font-semibold">No payment</span>
                        )}
                      </td>

                      {/* Days overdue badge */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                          text-[11px] font-bold ${urgency}`}>
                          {daysOverdue === '∞' ? 'Never paid' : `${daysOverdue}d`}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="status" value={c.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onAddPaymentFor(s)}
                            title="Record payment"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px]
                              font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100
                              border border-emerald-200 transition-colors whitespace-nowrap"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19"/>
                              <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Pay
                          </button>
                          <button
                            onClick={() => onEditStudent(s)}
                            title="Edit student"
                            className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-50 transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
        </div>
      )}
    </div>
  );
}