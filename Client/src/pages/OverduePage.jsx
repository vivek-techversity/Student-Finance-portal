import { useAppData } from "../components/layout/AppLayout";
import Badge from "../components/ui/Badge";
import { fmt$, fmtDate } from "../utils/formatters";

const T = {
  border: "#E7E4E0",
  borderLight: "#F0EDE9",
  label: "#A8A29E",
  sub: "#78716C",
  text: "#1C1917",
  iconBg: "#EDEAE6",
  thBg: "#F5F3F0",
};

const HEADERS = [
  "Student",
  "University",
  "Region",
  "Program",
  "Outstanding",
  "Last Payment",
  "Days Overdue",
  "Status",
  "",
];

function urgencyStyle(daysSinceLast) {
  if (daysSinceLast === null)
    return { background: "#FEE2E2", color: "#DC2626" };
  if (daysSinceLast > 60) return { background: "#FEE2E2", color: "#DC2626" };
  if (daysSinceLast > 30) return { background: "#FFEDD5", color: "#EA580C" };
  return { background: "#FEF9C3", color: "#CA8A04" };
}

export default function OverduePage() {
  const {
    overdueStudents = [],
    calcs = {},
    loading,
    onViewStudent,
    onAddPaymentFor,
    onEditStudent,
  } = useAppData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#1C1917", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* ── Status Banner ─────────────────────── */}
      {overdueStudents.length > 0 ? (
        <div
          className="rounded-xl px-5 py-4 mb-5 flex items-center gap-3"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#FEE2E2" }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#B91C1C" }}>
              {overdueStudents.length} student
              {overdueStudents.length !== 1 ? "s" : ""} overdue
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#EF4444" }}>
              No payment received in 30+ days or no payment at all
            </p>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl px-5 py-4 mb-5 flex items-center gap-3"
          style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#D1FAE5" }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#065F46" }}>
              All caught up
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#10B981" }}>
              No overdue students right now
            </p>
          </div>
        </div>
      )}

      {/* ── Table ─────────────────────────────── */}
      {overdueStudents.length > 0 && (
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: `1px solid ${T.border}` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: T.thBg,
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  {HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: T.label }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdueStudents.map((s, i) => {
                  const c = calcs[s._id];
                  if (!c) return null;

                  const daysOverdue = c.daysSinceLast ?? null;
                  const uStyle = urgencyStyle(daysOverdue);
                  const isLast = i === overdueStudents.length - 1;

                  return (
                    <tr
                      key={s._id}
                      className="transition-colors cursor-pointer"
                      style={{
                        borderBottom: isLast
                          ? "none"
                          : `1px solid ${T.borderLight}`,
                        borderLeft: "3px solid #EF4444",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#FFFBFB")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                      onClick={() => onViewStudent(s)}
                    >
                      {/* Student */}
                      <td className="px-4 py-3">
                        <p
                          className="font-semibold leading-tight"
                          style={{ color: T.text }}
                        >
                          {s.name}
                        </p>
                        {s.email && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: T.label }}
                          >
                            {s.email}
                          </p>
                        )}
                        {s.phone && (
                          <p className="text-xs" style={{ color: T.label }}>
                            {s.phone}
                          </p>
                        )}
                      </td>

                      <td
                        className="px-4 py-3 max-w-[130px] truncate"
                        style={{ color: T.sub }}
                      >
                        {s.university}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="region" value={s.region} />
                      </td>

                      <td
                        className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: T.sub }}
                      >
                        {s.program}
                      </td>

                      {/* Outstanding — bold red */}
                      <td
                        className="px-4 py-3 font-bold whitespace-nowrap"
                        style={{
                          color: "#EF4444",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {fmt$(c.outstanding)}
                      </td>

                      {/* Last Payment */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {c.lastPaymentDate ? (
                          <>
                            <p style={{ color: T.sub }}>
                              {fmtDate(c.lastPaymentDate)}
                            </p>
                            <p style={{ color: T.label }}>
                              {fmt$(c.totalReceived)} received
                            </p>
                          </>
                        ) : (
                          <span
                            className="font-semibold"
                            style={{ color: "#EF4444" }}
                          >
                            No payment
                          </span>
                        )}
                      </td>

                      {/* Days Overdue badge */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                          style={uStyle}
                        >
                          {daysOverdue === null
                            ? "Never paid"
                            : `${daysOverdue}d`}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="status" value={c.status} />
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onAddPaymentFor(s)}
                            title="Record payment"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
                            style={{
                              color: "#10B981",
                              background: "#ECFDF5",
                              border: "1px solid #A7F3D0",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#D1FAE5")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#ECFDF5")
                            }
                          >
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Pay
                          </button>
                          <button
                            onClick={() => onEditStudent(s)}
                            title="Edit student"
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: T.label }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = T.iconBg;
                              e.currentTarget.style.color = T.text;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = T.label;
                            }}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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