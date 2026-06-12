// ── Currency formatters ────────────────────────────────────────

/** $1,234.56 */
export const fmt$ = (v) =>
  '$' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** ₹1,23,456 */
export const fmtINR = (v) =>
  '₹' + Math.round(v || 0).toLocaleString('en-IN');

/** $1.2k / $234.00 */
export const fmtShort = (v) => {
  const n = Number(v || 0);
  return n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : fmt$(n);
};

/** YYYY-MM-DD */
export const today = () => new Date().toISOString().split('T')[0];

/** 2026-01-15 → Jan 15, 2026 */
export const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

/** June 2026 */
export const fmtMonth = (d) => {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });
};

// ── Payment method icons ───────────────────────────────────────
export const METHOD_ICON = {
  UPI: '📱',
  'Bank Transfer': '🏦',
  PayPal: '🅿️',
  EMI: '💳',
  Other: '💵',
};

// ── Region colors (Tailwind-safe hex for inline SVG/charts) ───
export const REGION_COLORS = {
  UK: '#6366f1',
  USA: '#10b981',
  Canada: '#f59e0b',
  Australia: '#8b5cf6',
  Europe: '#ef4444',
  Other: '#94a3b8',
};

// ── Core business logic: per-student computed metrics ─────────
/**
 * @param {Object} student  — student object from DB / state
 * @param {Array}  payments — ALL payments array (will filter by studentId)
 * @returns {Object} computed metrics
 */
export function calcStudent(student, payments) {
  const sid = student._id || student.id; // MongoDB uses _id
  const sp = payments.filter((p) => (p.studentId?._id || p.studentId) === sid);

  const totalDeductions = sp.reduce(
    (a, p) => a + (p.bankCharge || 0) + (p.gatewayFee || 0) + (p.otherDeduction || 0),
    0
  );
  // totalReceived = gross (student ne kitna bheja) — table/detail me yahi dikhega
  const totalReceived = sp.reduce((a, p) => a + p.amountUSD, 0);
  // netReceivedUSD = charges katne ke baad — sirf profit calc ke liye use hoga
  const netReceivedUSD = totalReceived - totalDeductions;

  const netReceivedINR = sp.reduce((a, p) => {
    const net = p.amountUSD - (p.bankCharge || 0) - (p.gatewayFee || 0) - (p.otherDeduction || 0);
    return a + net * p.exchangeRate;
  }, 0);

  const outstanding = Math.max(0, student.totalFee - totalReceived);

  const totalCosts =
    (student.uniFee || 0) +
    (student.consultantComm || 0) +
    (student.thesisCost || 0) +
    (student.shipmentCost || 0);

  const netProfitUSD = netReceivedUSD - totalCosts;
  const netProfitINR = netProfitUSD * (student.exchangeRate || 83);

  const status =
    outstanding <= 0 ? 'Fully Paid' : totalReceived > 0 ? 'Partial' : 'Unpaid';

  const sorted = [...sp].sort((a, b) => new Date(b.date) - new Date(a.date));
  const last = sorted[0] || null;
  const daysSinceLast = last
    ? Math.floor((Date.now() - new Date(last.date)) / 86400000)
    : null;

  const isOverdue =
    status !== 'Fully Paid' && (daysSinceLast === null || daysSinceLast > 30);

  return {
    totalReceived,
    totalDeductions,
    netReceivedUSD,
    netReceivedINR,
    outstanding,
    totalCosts,
    netProfitUSD,
    netProfitINR,
    status,
    daysSinceLast,
    count: sp.length,
    isOverdue,
    lastPaymentDate: last?.date || null,
  };
}

// ── Status badge color helper (Tailwind classes) ──────────────
export const statusClasses = {
  'Fully Paid': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Partial:      'bg-amber-100 text-amber-700 border border-amber-200',
  Unpaid:       'bg-red-100 text-red-600 border border-red-200',
};

export const regionClasses = (region) => {
  const map = {
    UK:        'bg-indigo-100 text-indigo-700',
    USA:       'bg-emerald-100 text-emerald-700',
    Canada:    'bg-amber-100 text-amber-700',
    Australia: 'bg-purple-100 text-purple-700',
    Europe:    'bg-rose-100 text-rose-700',
    Other:     'bg-slate-100 text-slate-600',
  };
  return map[region] || map.Other;
};