import { useState } from 'react';
import { fmt$, fmtINR, fmtDate } from '../../utils/formatters';
import ConfirmDialog from '../ui/ConfirmDialog';

const T = {
  border:  '#E7E4E0',
  borderLight: '#F0EDE9',
  label:   '#A8A29E',
  sub:     '#78716C',
  text:    '#1C1917',
  headBg:  '#FAFAF9',
  accent:  '#6366F1',
  positive:'#059669',
  negative:'#DC2626',
};

const METHOD_META = {
  'Bank Transfer': { color: '#6366F1', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
      <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
      <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
    </svg>
  )},
  'UPI': { color: '#059669', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  )},
  'PayPal': { color: '#D97706', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
    </svg>
  )},
  'EMI': { color: '#8B5CF6', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )},
  'Other': { color: '#78716C', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )},
};

const BankIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
  </svg>
);
const GatewayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const OtherDedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const PackageIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.label} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const EmptyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

function MiniCard({ label, value, sub, color }) {
  return (
    <div className="rounded-xl px-3 py-2.5 bg-white" style={{ border: `1px solid ${T.border}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.label }}>{label}</p>
      <p className="text-[15px] font-extrabold tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: T.label }}>{sub}</p>}
    </div>
  );
}

function DeductionChip({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5" style={{ border: `1px solid ${T.border}` }}>
      <span style={{ color: T.negative }}><Icon /></span>
      <div>
        <p className="text-[10px]" style={{ color: T.label }}>{label}</p>
        <p className="text-xs font-bold" style={{ color: T.negative }}>−{fmt$(value)}</p>
      </div>
    </div>
  );
}

function CostChip({ label, value }) {
  return (
    <div className="bg-white rounded-lg px-2.5 py-1.5" style={{ border: `1px solid ${T.border}` }}>
      <p className="text-[10px]" style={{ color: T.label }}>{label}</p>
      <p className="text-xs font-bold" style={{ color: T.accent }}>−{fmt$(value)}</p>
    </div>
  );
}

export default function PaymentTimeline({ payments, onDelete, onAddPayment, student }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expanded, setExpanded] = useState({});

  const sorted = [...payments].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return b._id < a._id ? -1 : b._id > a._id ? 1 : 0;
  });
  const oldestId = sorted.length > 0 ? sorted[sorted.length - 1]._id : null;
  const hasCosts = student && ((student.uniFee||0)+(student.consultantComm||0)+(student.thesisCost||0)+(student.shipmentCost||0)) > 0;

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold" style={{ color: T.text }}>
          {payments.length} Payment{payments.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={onAddPayment}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: '#1C1917', cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
        >
          <PlusIcon /> Add Payment
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-2"><EmptyIcon /></div>
          <p className="text-sm font-semibold" style={{ color: T.sub }}>No payments yet</p>
          <p className="text-xs mt-1" style={{ color: T.label }}>Click "Add Payment" to record the first one</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((p) => {
            const meta = METHOD_META[p.method] || METHOD_META['Other'];
            const isOldest = p._id === oldestId;
            const bankCharge = p.bankCharge || 0;
            const gatewayFee = p.gatewayFee || 0;
            const otherDed = p.otherDeduction || 0;
            const totalDed = bankCharge + gatewayFee + otherDed;
            const net = p.amountUSD - totalDed;
            const netINR = net * (p.exchangeRate || 83);
            const isOpen = expanded[p._id];

            return (
              <div
                key={p._id}
                className="rounded-2xl bg-white overflow-hidden transition-all"
                style={{ border: `1px solid ${T.border}`, borderLeft: `3px solid ${meta.color}` }}
              >
                {/* Main row */}
                <div className="px-4 py-3.5 flex items-center gap-3 cursor-pointer" onClick={() => toggle(p._id)}>
                  {/* Method icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: '#F5F3F0', color: meta.color }}
                  >
                    {meta.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-base font-extrabold tabular-nums" style={{ color: T.positive }}>{fmt$(p.amountUSD)}</span>
                      <span className="text-[11px]" style={{ color: T.label }}>paid</span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: T.accent }}>→ {fmt$(net)} received</span>
                      <span className="text-[11px] tabular-nums" style={{ color: T.label }}>({fmtINR(netINR)})</span>
                    </div>
                    <div className="flex gap-2.5 mt-0.5 flex-wrap">
                      <span className="text-[11px]" style={{ color: T.label }}>{fmtDate(p.date)}</span>
                      <span className="text-[11px] font-semibold" style={{ color: meta.color }}>{p.method}</span>
                      <span className="text-[11px] tabular-nums" style={{ color: T.label }}>₹{p.exchangeRate}/USD</span>
                      {p.note && <span className="text-[11px] italic" style={{ color: T.label }}>"{p.note}"</span>}
                    </div>
                  </div>

                  {/* Right pills + actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {totalDed > 0 && (
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full"
                        style={{ background: '#FEF2F2', color: T.negative, border: `1px solid #FECACA` }}
                      >
                        −{fmt$(totalDed)} charges
                      </span>
                    )}
                    {isOldest && hasCosts && (
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1"
                        style={{ background: '#F5F3FF', color: '#8B5CF6', border: `1px solid #E9D5FF` }}
                        title="Cost breakdown was applied on this payment"
                      >
                        <PackageIcon /> costs applied
                      </span>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: '#FEF2F2', border: `1px solid #FECACA`, color: T.negative, cursor: 'pointer' }}
                    >
                      <TrashIcon />
                    </button>

                    <ChevronIcon open={isOpen} />
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="px-4 py-3.5" style={{ borderTop: `1px solid ${T.border}`, background: T.headBg }}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" style={{ marginBottom: totalDed > 0 ? '14px' : 0 }}>
                      <MiniCard label="Amount Paid" value={fmt$(p.amountUSD)} sub="Gross amount" color={T.positive} />
                      <MiniCard label="Total Charges" value={`−${fmt$(totalDed)}`} sub="Deducted" color={T.negative} />
                      <MiniCard label="Net Received" value={fmt$(net)} sub={fmtINR(netINR)} color={T.accent} />
                    </div>

                    {totalDed > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.label }}>Charge Breakdown</p>
                        <div className="flex gap-2 flex-wrap">
                          {bankCharge > 0 && <DeductionChip Icon={BankIcon} label="Bank Charge" value={bankCharge} />}
                          {gatewayFee > 0 && <DeductionChip Icon={GatewayIcon} label="Gateway Fee" value={gatewayFee} />}
                          {otherDed > 0 && <DeductionChip Icon={OtherDedIcon} label="Other" value={otherDed} />}
                        </div>
                      </div>
                    )}

                    {isOldest && hasCosts && student && (
                      <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${T.border}` }}>
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-2 inline-flex items-center gap-1" style={{ color: '#8B5CF6' }}>
                          <PackageIcon /> Cost Breakdown (deducted from profit)
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {student.uniFee > 0 && <CostChip label="University Fee" value={student.uniFee} />}
                          {student.consultantComm > 0 && <CostChip label="Consultant" value={student.consultantComm} />}
                          {student.thesisCost > 0 && <CostChip label="Thesis" value={student.thesisCost} />}
                          {student.shipmentCost > 0 && <CostChip label="Shipment" value={student.shipmentCost} />}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Payment?"
        message={`Remove ${fmt$(deleteTarget?.amountUSD || 0)} payment from ${fmtDate(deleteTarget?.date)}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (deleteTarget) { onDelete(deleteTarget._id); setDeleteTarget(null); } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}