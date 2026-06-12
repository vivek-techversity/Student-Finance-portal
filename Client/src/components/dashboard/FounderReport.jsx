import { useMemo } from 'react';
import { fmtINR } from '../../utils/formatters';

// Warm neutral palette — matches sidebar/body theme
const T = {
  cardBorder: '#E7E4E0',
  labelColor: '#A8A29E',   // stone-400
  valueColor: '#1C1917',   // stone-900
  subColor:   '#78716C',   // stone-500
  headBg:     '#FAFAF9',   // table head bg
  headBorder: '#E7E4E0',
};

const TONES = {
  blue:  { fg: '#1C1917', accent: '#6366F1', bg: '#F5F3F0' },
  green: { fg: '#059669', accent: '#10B981', bg: '#ECFDF5' },
  red:   { fg: '#DC2626', accent: '#EF4444', bg: '#FEF2F2' },
};


export default function FounderReport({ students = [], payments = [], calcs = {} }) {

  const summary = useMemo(() => {
    let totalRevenue = 0;
    let netReceivedUSD = 0;
    let netReceivedINR = 0;
    let netProfitUSD = 0;
    let netProfitINR = 0;
    let outstanding = 0;

    let bankCharges = 0;
    let gatewayFees = 0;
    let otherDeductions = 0;

    let uniFee = 0;
    let consultantComm = 0;
    let thesisCost = 0;
    let shipmentCost = 0;

    students.forEach((s) => {
      const c = calcs[s._id];
      if (!c) return;
      // totalRevenue students loop me nahi — payments loop me calculate hoga
      netReceivedUSD += c.netReceivedUSD;
      netReceivedINR += c.netReceivedINR;
      netProfitUSD += c.netProfitUSD;
      netProfitINR += c.netProfitINR;
      outstanding += c.outstanding;

      uniFee += s.uniFee || 0;
      consultantComm += s.consultantComm || 0;
      thesisCost += s.thesisCost || 0;
      shipmentCost += s.shipmentCost || 0;
    });

    payments.forEach((p) => {
      totalRevenue += p.amountUSD || 0;  // actual payments ka sum = real revenue
      bankCharges += p.bankCharge || 0;
      gatewayFees += p.gatewayFee || 0;
      otherDeductions += p.otherDeduction || 0;
    });

    const totalDeductions = bankCharges + gatewayFees + otherDeductions;
    const profitMargin = netReceivedUSD > 0 ? (netProfitUSD / netReceivedUSD) * 100 : 0;
    const totalCosts = uniFee + consultantComm + thesisCost + shipmentCost;

    return {
      totalRevenue,
      totalDeductions,
      netReceivedUSD,
      netReceivedINR,
      netProfitUSD,
      netProfitINR,
      outstanding,
      profitMargin,
      totalStudents: students.length,
      deductions: { bankCharges, gatewayFees, otherDeductions, totalDeductions, totalRevenue },
      costs: { uniFee, consultantComm, thesisCost, shipmentCost, totalCosts },
    };
  }, [students, calcs, payments]);

  // ── Group helper (Region / University) ─────────────────────────
  const groupBy = (key, extraKey) => {
    const m = {};
    students.forEach((s) => {
      const c = calcs[s._id];
      if (!c) return;
      const k = s[key] || 'Other';
      if (!m[k]) {
        m[k] = {
          name: k,
          revenue: 0,
          inrReceived: 0,
          students: 0,
          outstanding: 0,
          netProfit: 0,
          extra: 0, // uniFee paid (only used for university table)
        };
      }
      m[k].revenue += c.totalReceived || 0;  // actual received, not expected fee
      m[k].inrReceived += c.netReceivedINR;
      m[k].students += 1;
      m[k].outstanding += c.outstanding;
      m[k].netProfit += c.netProfitUSD;
      if (extraKey) m[k].extra += s[extraKey] || 0;
    });
    return Object.values(m).sort((a, b) => b.revenue - a.revenue);
  };

  const regionRows = useMemo(() => groupBy('region'), [students, calcs]);
  const universityRows = useMemo(() => groupBy('university', 'uniFee'), [students, calcs]);

  const regionTotals = useMemo(
    () =>
      regionRows.reduce(
        (acc, r) => ({
          revenue: acc.revenue + r.revenue,
          inrReceived: acc.inrReceived + r.inrReceived,
          students: acc.students + r.students,
          outstanding: acc.outstanding + r.outstanding,
          netProfit: acc.netProfit + r.netProfit,
        }),
        { revenue: 0, inrReceived: 0, students: 0, outstanding: 0, netProfit: 0 }
      ),
    [regionRows]
  );

  const universityTotals = useMemo(
    () =>
      universityRows.reduce(
        (acc, r) => ({
          revenue: acc.revenue + r.revenue,
          inrReceived: acc.inrReceived + r.inrReceived,
          students: acc.students + r.students,
          extra: acc.extra + r.extra,
          netProfit: acc.netProfit + r.netProfit,
        }),
        { revenue: 0, inrReceived: 0, students: 0, extra: 0, netProfit: 0 }
      ),
    [universityRows]
  );

  return (
    <div className="space-y-6">
      {/* ── Header card ──────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${T.cardBorder}` }}
      >
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
          <div className="flex items-center gap-2.5">
            <span style={{ color: T.subColor }}>
              <GraduationIcon />
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight" style={{ color: T.valueColor }}>
                Founder Report
              </h2>
              <p className="text-xs mt-0.5" style={{ color: T.labelColor }}>
                Auto-updates from student &amp; payment data
              </p>
            </div>
          </div>
        </div>

        {/* USD Financials */}
        <SectionLabel icon={<DollarIcon />} title="USD Financials" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5">
          <KpiCard label="Total Revenue (USD)" value={fmt$0(summary.totalRevenue)} tone="blue" />
          <KpiCard label="Total Deductions" value={fmt$0(summary.totalDeductions)} tone="red" />
          <KpiCard label="Net Received (USD)" value={fmt$0(summary.netReceivedUSD)} tone="green" />
          <KpiCard label="Net Profit (USD)" value={fmt$0(summary.netProfitUSD)} tone="green" />
          <KpiCard label="Outstanding (USD)" value={fmt$0(summary.outstanding)} tone="red" />
          <KpiCard label="Profit Margin %" value={`${summary.profitMargin.toFixed(1)}%`} tone="green" />
        </div>

        {/* INR Financials */}
        <SectionLabel icon={<RupeeIcon />} title="INR Financials" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5">
          <KpiCard label="Net Received (INR ₹)" value={fmtINR(summary.netReceivedINR)} tone="blue" big />
          <KpiCard label="Net Profit (INR ₹)" value={fmtINR(summary.netProfitINR)} tone="green" big />
          <KpiCard label="Total Students" value={summary.totalStudents} tone="blue" big />
        </div>
      </div>

      {/* ── Deduction Breakdown ──────────────────────────────── */}
      <ReportTable
        icon={<LayersIcon />}
        title="Deduction Breakdown"
        subtitle="Bank charges + gateway fees + other"
        columns={['Deduction Type', 'Total Amount (USD)', '% of Revenue']}
      >
        {[
          ['Bank Charges', summary.deductions.bankCharges],
          ['PayPal / Gateway', summary.deductions.gatewayFees],
          ['Other Deductions', summary.deductions.otherDeductions],
        ].map(([label, amt]) => (
          <tr key={label} style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
            <td className="px-4 py-2.5 text-sm font-medium" style={{ color: T.valueColor }}>{label}</td>
            <td className="px-4 py-2.5 text-sm text-right font-semibold" style={{ color: T.valueColor }}>{fmt$2(amt)}</td>
            <td className="px-4 py-2.5 text-sm text-right" style={{ color: T.subColor }}>
              {pct(amt, summary.deductions.totalRevenue)}
            </td>
          </tr>
        ))}
        <TotalsTr>
          <td className="px-4 py-2.5 text-sm font-bold" style={{ color: T.valueColor }}>Total Deductions</td>
          <td className="px-4 py-2.5 text-sm text-right font-bold" style={{ color: T.valueColor }}>{fmt$2(summary.deductions.totalDeductions)}</td>
          <td className="px-4 py-2.5 text-sm text-right font-bold" style={{ color: T.valueColor }}>
            {pct(summary.deductions.totalDeductions, summary.deductions.totalRevenue)}
          </td>
        </TotalsTr>
      </ReportTable>

      {/* ── Cost Breakdown ───────────────────────────────────── */}
      <ReportTable icon={<ClipboardIcon />} title="Cost Breakdown" columns={['Item', 'Amount (USD)']}>
        {[
          ['University Fees', summary.costs.uniFee],
          ['Consultant Commissions', summary.costs.consultantComm],
          ['Thesis Costs', summary.costs.thesisCost],
          ['Shipment Costs', summary.costs.shipmentCost],
        ].map(([label, amt]) => (
          <tr key={label} style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
            <td className="px-4 py-2.5 text-sm font-medium" style={{ color: T.valueColor }}>{label}</td>
            <td className="px-4 py-2.5 text-sm text-right font-semibold" style={{ color: TONES.red.fg }}>{fmt$0(amt)}</td>
          </tr>
        ))}
        <TotalsTr>
          <td className="px-4 py-2.5 text-sm font-bold" style={{ color: T.valueColor }}>Total All Costs</td>
          <td className="px-4 py-2.5 text-sm text-right font-bold" style={{ color: T.valueColor }}>{fmt$0(summary.costs.totalCosts)}</td>
        </TotalsTr>
      </ReportTable>

      {/* ── Revenue by Region ────────────────────────────────── */}
      <ReportTable
        icon={<GlobeIcon />}
        title="Revenue by Region"
        subtitle="Net received USD + INR"
        columns={['Region', 'Revenue (USD)', 'INR Received ₹', 'Students', 'Outstanding', 'Net Profit']}
      >
        {regionRows.map((r) => (
          <RegionRow key={r.name} row={r} />
        ))}
        <TotalRow
          label="Total"
          revenue={regionTotals.revenue}
          inr={regionTotals.inrReceived}
          students={regionTotals.students}
          outstanding={regionTotals.outstanding}
          netProfit={regionTotals.netProfit}
        />
      </ReportTable>

      {/* ── Revenue by University ────────────────────────────── */}
      <ReportTable
        icon={<BankIcon />}
        title="Revenue by University"
        columns={['University', 'Revenue (USD)', 'INR Received ₹', 'Students', 'Uni Fee Paid', 'Net Profit']}
      >
        {universityRows.map((r) => (
          <UniversityRow key={r.name} row={r} />
        ))}
        <TotalRow
          label="Total"
          revenue={universityTotals.revenue}
          inr={universityTotals.inrReceived}
          students={universityTotals.students}
          extra={universityTotals.extra}
          netProfit={universityTotals.netProfit}
          isUniversity
        />
      </ReportTable>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function SectionLabel({ icon, title }) {
  return (
    <div
      className="px-5 py-2.5 flex items-center gap-2"
      style={{ background: T.headBg, borderBottom: `1px solid ${T.cardBorder}`, borderTop: `1px solid ${T.cardBorder}` }}
    >
      <span style={{ color: T.subColor }}>{icon}</span>
      <span className="text-xs font-bold tracking-wide uppercase" style={{ color: T.subColor }}>{title}</span>
    </div>
  );
}

function KpiCard({ label, value, tone, big }) {
  const c = TONES[tone];
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: c.bg, border: `1px solid ${T.cardBorder}`, borderLeft: `3px solid ${c.accent}` }}
    >
      <p className="text-[10px] font-semibold tracking-wide uppercase mb-1" style={{ color: T.subColor }}>{label}</p>
      <p className={`font-extrabold tabular-nums ${big ? 'text-2xl' : 'text-xl'}`} style={{ color: c.fg }}>{value}</p>
    </div>
  );
}

function ReportTable({ title, subtitle, icon, columns, children }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.cardBorder}` }}>
      <div className="px-5 py-3 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
        <span style={{ color: T.subColor }}>{icon}</span>
        <div>
          <h3 className="text-sm font-bold tracking-tight" style={{ color: T.valueColor }}>{title}</h3>
          {subtitle && <p className="text-[11px]" style={{ color: T.labelColor }}>{subtitle}</p>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: T.headBg, borderBottom: `1px solid ${T.headBorder}` }}>
              {columns.map((c, i) => (
                <th
                  key={c}
                  className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${
                    i === 0 ? 'text-left' : 'text-right'
                  }`}
                  style={{ color: T.labelColor }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function TotalsTr({ children }) {
  return (
    <tr style={{ background: T.headBg, borderTop: `1px solid ${T.cardBorder}` }}>
      {children}
    </tr>
  );
}

function RegionRow({ row }) {
  const hasData = row.students > 0;
  return (
    <tr style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
      <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: T.valueColor }}>{row.name}</td>
      <Cell value={row.revenue} type="$" empty={!hasData} />
      <Cell value={row.inrReceived} type="₹" empty={!hasData} />
      <td className="px-4 py-2.5 text-sm text-right tabular-nums" style={{ color: T.subColor }}>{row.students}</td>
      <Cell value={row.outstanding} type="$" empty={row.outstanding === 0} negative />
      <Cell value={row.netProfit} type="$" empty={!hasData} positive />
    </tr>
  );
}

function UniversityRow({ row }) {
  const hasData = row.students > 0;
  return (
    <tr style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
      <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: T.valueColor }}>{row.name}</td>
      <Cell value={row.revenue} type="$" empty={!hasData} />
      <Cell value={row.inrReceived} type="₹" empty={!hasData} />
      <td className="px-4 py-2.5 text-sm text-right tabular-nums" style={{ color: T.subColor }}>{row.students}</td>
      <Cell value={row.extra} type="$" empty={!hasData} amber />
      <Cell value={row.netProfit} type="$" empty={!hasData} positive />
    </tr>
  );
}

function TotalRow({ label, revenue, inr, students, outstanding, extra, netProfit, isUniversity }) {
  return (
    <tr style={{ background: T.headBg, borderTop: `1px solid ${T.cardBorder}` }}>
      <td className="px-4 py-2.5 text-sm font-bold" style={{ color: T.valueColor }}>{label}</td>
      <td className="px-4 py-2.5 text-sm text-right font-bold tabular-nums" style={{ color: T.valueColor }}>{fmt$0(revenue)}</td>
      <td className="px-4 py-2.5 text-sm text-right font-bold tabular-nums" style={{ color: T.valueColor }}>{fmtINR(inr)}</td>
      <td className="px-4 py-2.5 text-sm text-right font-bold tabular-nums" style={{ color: T.valueColor }}>{students}</td>
      <td className="px-4 py-2.5 text-sm text-right font-bold tabular-nums" style={{ color: T.valueColor }}>
        {isUniversity ? fmt$0(extra) : fmt$0(outstanding)}
      </td>
      <td className="px-4 py-2.5 text-sm text-right font-bold tabular-nums" style={{ color: T.valueColor }}>{fmt$0(netProfit)}</td>
    </tr>
  );
}

function Cell({ value, type, empty, negative, positive, amber }) {
  if (empty || !value) {
    return <td className="px-4 py-2.5 text-sm text-right" style={{ color: T.labelColor }}>-</td>;
  }
  const formatted = type === '₹' ? fmtINR(value) : fmt$0(value);
  let color = T.valueColor;
  if (negative) color = TONES.red.fg;
  if (positive) color = TONES.green.fg;
  if (amber) color = '#D97706';
  return <td className="px-4 py-2.5 text-sm text-right font-semibold tabular-nums" style={{ color }}>{formatted}</td>;
}

// ─────────────────────────────────────────────────────────────────
// Icons (lucide-style, stroke-based — matches new theme)
// ─────────────────────────────────────────────────────────────────
function GraduationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function RupeeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="18" y2="3" />
      <line x1="6" y1="8" x2="18" y2="8" />
      <path d="M6 13h6a4 4 0 0 0 0-8" />
      <path d="M6 13l9 8" />
    </svg>
  );
}
function LayersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function BankIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 21 8 3 8" />
    </svg>
  );
}


function fmt$0(v) {
  return '$' + Math.round(v || 0).toLocaleString('en-US');
}
function fmt$2(v) {
  return '$' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct(part, total) {
  if (!total) return '0.0%';
  return ((part / total) * 100).toFixed(1) + '%';
}