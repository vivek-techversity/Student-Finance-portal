import { fmt$ } from '../../utils/formatters';

const T = {
  border:  '#E7E4E0',
  label:   '#A8A29E',
  sub:     '#78716C',
  text:    '#1C1917',
  iconBg:  '#FEF2F2',
  negative:'#DC2626',
  positive:'#059669',
};

/**
 * Props:
 *   overdueStudents — array of student objects
 *   calcs           — { [id]: computed metrics }
 *   onView          — fn(student)
 *   onAddPayment    — fn(student)
 */
export default function OverdueCard({ overdueStudents, calcs, onView, onAddPayment }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.iconBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.negative} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: T.text }}>Overdue Students</p>
            <p className="text-[11px]" style={{ color: T.label }}>No payment in 30+ days</p>
          </div>
        </div>
        {overdueStudents.length > 0 && (
          <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: T.negative }}>
            {overdueStudents.length}
          </span>
        )}
      </div>

      {/* Body */}
      {overdueStudents.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: '#ECFDF5' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.positive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: T.sub }}>All caught up!</p>
          <p className="text-xs mt-0.5" style={{ color: T.label }}>No overdue students</p>
        </div>
      ) : (
        <div className="max-h-[200px] overflow-y-auto">
          {overdueStudents.map((s, i) => {
            const c = calcs[s._id];
            return (
              <div
                key={s._id}
                className="flex items-center gap-3 px-5 py-3 transition-colors"
                style={{ borderBottom: i < overdueStudents.length - 1 ? `1px solid #F0EDE9` : 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAF9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: T.iconBg, color: T.negative }}
                >
                  {s.name[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(s)}>
                  <p className="text-sm font-semibold truncate" style={{ color: T.text }}>{s.name}</p>
                  <p className="text-[11px] font-medium" style={{ color: T.negative }}>
                    {c?.daysSinceLast != null ? `${c.daysSinceLast}d since last payment` : 'No payment yet'}
                    {c?.outstanding > 0 && ` · ${fmt$(c.outstanding)} due`}
                  </p>
                </div>

                {/* Add payment button */}
                <button
                  onClick={() => onAddPayment(s)}
                  title="Record payment"
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: '#ECFDF5', border: `1px solid #D1FAE5`, color: T.positive, cursor: 'pointer' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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