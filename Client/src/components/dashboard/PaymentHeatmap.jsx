import { useMemo, useState } from 'react';
import { fmt$ } from '../../utils/formatters';

const T = {
  border: '#E7E4E0',
  label:  '#A8A29E',
  sub:    '#78716C',
  text:   '#1C1917',
  iconBg: '#F5F3F0',
  empty:  '#EDEAE6',
};

const ACCENT_RGB = '99, 102, 241'; // matches accent #6366F1

const WEEKS = 14;
const CELL  = 12;
const GAP   = 3;
const DOW_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function toKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fmtTooltipDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Props:
 *   payments — all payments array ({ date, amountUSD, ... })
 */
export default function PaymentHeatmap({ payments = [] }) {
  const [hover, setHover] = useState(null); // { x, y, day }

  const { days, monthLabels, maxVal, activeDays, totalAmount } = useMemo(() => {
    const totals = {};
    payments.forEach((p) => {
      const key = (p.date || '').slice(0, 10);
      if (!key) return;
      totals[key] = (totals[key] || 0) + (p.amountUSD || 0);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // align end to the Saturday of the current week
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const start = new Date(end);
    start.setDate(start.getDate() - (WEEKS * 7 - 1));

    const days = [];
    let maxVal = 0;
    let activeDays = 0;
    let totalAmount = 0;

    for (let i = 0; i < WEEKS * 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = toKey(d);
      const val = totals[key] || 0;
      if (val > maxVal) maxVal = val;
      if (val > 0) activeDays++;
      totalAmount += val;
      days.push({ date: d, key, val, isFuture: d > today });
    }

    // month label per week-column: show once, at the first week-column whose
    // Sunday falls in a new month (avoids duplicate adjacent labels)
    const monthLabels = [];
    let prevMonth = null;
    for (let w = 0; w < WEEKS; w++) {
      const sunday = days[w * 7];
      const m = sunday.date.getMonth();
      if (m !== prevMonth) {
        monthLabels.push(sunday.date.toLocaleString('en-US', { month: 'short' }));
        prevMonth = m;
      } else {
        monthLabels.push(null);
      }
    }

    return { days, monthLabels, maxVal, activeDays, totalAmount };
  }, [payments]);

  function colorFor(val, isFuture) {
    if (isFuture) return 'transparent';
    if (val <= 0) return T.empty;
    const ratio = maxVal > 0 ? val / maxVal : 0;
    let opacity;
    if (ratio > 0.75) opacity = 1;
    else if (ratio > 0.5) opacity = 0.7;
    else if (ratio > 0.2) opacity = 0.45;
    else opacity = 0.25;
    return `rgba(${ACCENT_RGB}, ${opacity})`;
  }

  const gridW = WEEKS * (CELL + GAP) - GAP;
  const gridH = 7 * (CELL + GAP) - GAP;
  const LABEL_W = 26;
  const LABEL_H = 16;

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.iconBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: T.text }}>Payment Activity</p>
            <p className="text-[11px]" style={{ color: T.label }}>Last {WEEKS} weeks</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold tabular-nums" style={{ color: T.text }}>{activeDays} active days</p>
          <p className="text-[11px] tabular-nums" style={{ color: T.label }}>{fmt$(totalAmount)} received</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="px-5 py-4 overflow-x-auto">
        <div className="relative" style={{ width: gridW + LABEL_W, minWidth: gridW + LABEL_W }}>
          <svg
            width={gridW + LABEL_W}
            height={gridH + LABEL_H}
            viewBox={`0 0 ${gridW + LABEL_W} ${gridH + LABEL_H}`}
          >
            {/* Month labels */}
            {monthLabels.map((label, w) => label && (
              <text
                key={`m-${w}`}
                x={LABEL_W + w * (CELL + GAP)}
                y={10}
                fontSize="10"
                fontWeight="600"
                fill={T.label}
              >
                {label}
              </text>
            ))}

            {/* Day-of-week labels */}
            {DOW_LABELS.map((label, dow) => label && (
              <text
                key={`d-${dow}`}
                x={0}
                y={LABEL_H + dow * (CELL + GAP) + CELL - 2}
                fontSize="9"
                fontWeight="500"
                fill={T.label}
              >
                {label}
              </text>
            ))}

            {/* Cells */}
            {days.map((d, i) => {
              const w = Math.floor(i / 7);
              const dow = i % 7;
              const x = LABEL_W + w * (CELL + GAP);
              const y = LABEL_H + dow * (CELL + GAP);
              return (
                <rect
                  key={d.key}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx="2.5"
                  fill={colorFor(d.val, d.isFuture)}
                  stroke={d.val > 0 ? 'transparent' : T.border}
                  strokeWidth="1"
                  style={{ cursor: d.isFuture ? 'default' : 'pointer' }}
                  onMouseEnter={() => !d.isFuture && setHover({ x: x + CELL / 2, y, day: d })}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </svg>

          {/* Tooltip */}
          {hover && (
            <div
              className="absolute px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap z-10 pointer-events-none"
              style={{
                left: hover.x,
                top: hover.y - 8,
                transform: 'translate(-50%, -100%)',
                background: T.text,
                color: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <span className="font-bold">{hover.day.val > 0 ? fmt$(hover.day.val) : 'No payments'}</span>
              <span style={{ color: '#A8A29E' }}> · {fmtTooltipDate(hover.day.date)}</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-3">
          <span className="text-[10px]" style={{ color: T.label }}>Less</span>
          {[0, 0.25, 0.45, 0.7, 1].map((op, i) => (
            <div
              key={i}
              className="rounded"
              style={{
                width: CELL - 2,
                height: CELL - 2,
                background: op === 0 ? T.empty : `rgba(${ACCENT_RGB}, ${op})`,
                border: op === 0 ? `1px solid ${T.border}` : 'none',
              }}
            />
          ))}
          <span className="text-[10px]" style={{ color: T.label }}>More</span>
        </div>
      </div>
    </div>
  );
}