import { fmt$ } from '../../utils/formatters';

/**
 * Props:
 *   overdueStudents — array of student objects
 *   calcs           — { [id]: computed metrics }
 *   onView          — fn(student)
 *   onAddPayment    — fn(student)
 */
export default function OverdueCard({ overdueStudents, calcs, onView, onAddPayment }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#ef4444" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Overdue Students</p>
            <p className="text-[11px] text-slate-400">No payment in 30+ days</p>
          </div>
        </div>
        {overdueStudents.length > 0 && (
          <span className="text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
            {overdueStudents.length}
          </span>
        )}
      </div>

      {/* Body */}
      {overdueStudents.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          <p className="text-2xl mb-1.5">✅</p>
          <p className="text-sm font-medium text-slate-500">All caught up!</p>
          <p className="text-xs mt-0.5">No overdue students</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-[200px] overflow-y-auto">
          {overdueStudents.map((s) => {
            const c = calcs[s._id];
            return (
              <div
                key={s._id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-red-50/50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center
                  text-xs font-bold text-red-500 flex-shrink-0">
                  {s.name[0]}
                </div>

                {/* Info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onView(s)}
                >
                  <p className="text-sm font-semibold text-slate-800 truncate hover:text-indigo-600 transition-colors">
                    {s.name}
                  </p>
                  <p className="text-[11px] text-red-500 font-medium">
                    {c?.daysSinceLast != null
                      ? `${c.daysSinceLast}d since last payment`
                      : 'No payment yet'}
                    {c?.outstanding > 0 && ` · ${fmt$(c.outstanding)} due`}
                  </p>
                </div>

                {/* Add payment button */}
                <button
                  onClick={() => onAddPayment(s)}
                  title="Record payment"
                  className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200
                    flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}