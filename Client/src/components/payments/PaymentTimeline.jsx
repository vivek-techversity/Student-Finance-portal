import { useState } from 'react';
import { fmt$, fmtINR, fmtDate } from '../../utils/formatters';
import ConfirmDialog from '../ui/ConfirmDialog';

const METHOD_META = {
  'Bank Transfer': { icon: '🏦', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
  'UPI':           { icon: '📱', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
  'PayPal':        { icon: '🅿️', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  'EMI':           { icon: '💳', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
  'Other':         { icon: '💵', color: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)' },
};

export default function PaymentTimeline({ payments, onDelete, onAddPayment, student }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expanded, setExpanded] = useState({});

  // Sort by date desc; same-date: use _id (MongoDB ObjectId = chronological)
  const sorted = [...payments].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return b._id < a._id ? -1 : b._id > a._id ? 1 : 0;
  });
  const oldestId = sorted.length > 0 ? sorted[sorted.length - 1]._id : null;
  const hasCosts = student && ((student.uniFee||0)+(student.consultantComm||0)+(student.thesisCost||0)+(student.shipmentCost||0)) > 0;

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#334155', margin: 0 }}>
          {payments.length} Payment{payments.length !== 1 ? 's' : ''}
        </p>
        <button onClick={onAddPayment}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            fontSize: '12px', fontWeight: 700, color: 'white',
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 3px 10px rgba(99,102,241,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.45)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 3px 10px rgba(99,102,241,0.3)'}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Payment
        </button>
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>💸</p>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>No payments yet</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>Click "Add Payment" to record the first one</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sorted.map((p) => {
            const meta       = METHOD_META[p.method] || METHOD_META['Other'];
            const isOldest   = p._id === oldestId;
            const bankCharge = p.bankCharge     || 0;
            const gatewayFee = p.gatewayFee     || 0;
            const otherDed   = p.otherDeduction || 0;
            const totalDed   = bankCharge + gatewayFee + otherDed;
            const net        = p.amountUSD - totalDed;
            const netINR     = net * (p.exchangeRate || 83);
            const isOpen     = expanded[p._id];

            return (
              <div key={p._id} style={{
                borderRadius: '14px',
                border: `1px solid ${isOpen ? 'rgba(99,102,241,0.2)' : 'rgba(226,232,240,0.8)'}`,
                borderLeft: `4px solid ${meta.color}`,
                background: 'white',
                overflow: 'hidden',
                transition: 'all 0.2s',
                boxShadow: isOpen ? '0 4px 16px rgba(99,102,241,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
              }}>

                {/* ── Main row ── */}
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  onClick={() => toggle(p._id)}>

                  {/* Method icon */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                    background: meta.bg, border: `1px solid ${meta.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>
                    {meta.icon}
                  </div>

                  {/* Left info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>
                        {fmt$(p.amountUSD)}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>paid</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366f1' }}>
                        → {fmt$(net)} received
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        ({fmtINR(netINR)})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{fmtDate(p.date)}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: meta.color }}>{p.method}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>₹{p.exchangeRate}/USD</span>
                      {p.note && <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>"{p.note}"</span>}
                    </div>
                  </div>

                  {/* Right: pills + delete + expand */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {totalDed > 0 && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px',
                        background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.15)',
                      }}>
                        −{fmt$(totalDed)} charges
                      </span>
                    )}
                    {isOldest && hasCosts && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px',
                        background: 'rgba(139,92,246,0.08)', color: '#8b5cf6',
                        border: '1px solid rgba(139,92,246,0.2)',
                      }} title="Cost breakdown was applied on this payment">
                        📦 costs applied
                      </span>
                    )}

                    {/* Delete only */}
                    <button onClick={e => { e.stopPropagation(); setDeleteTarget(p); }}
                      style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                    </button>

                    {/* Expand arrow */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* ── Expanded detail ── */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 16px', background: '#fafbff' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: totalDed > 0 ? '14px' : 0 }}>

                      <div style={{ background: 'white', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Amount Paid</p>
                        <p style={{ fontSize: '15px', fontWeight: 800, color: '#10b981', margin: 0 }}>{fmt$(p.amountUSD)}</p>
                        <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0' }}>Gross amount</p>
                      </div>

                      <div style={{ background: 'white', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Total Charges</p>
                        <p style={{ fontSize: '15px', fontWeight: 800, color: '#ef4444', margin: 0 }}>−{fmt$(totalDed)}</p>
                        <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0' }}>Deducted</p>
                      </div>

                      <div style={{ background: 'white', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Net Received</p>
                        <p style={{ fontSize: '15px', fontWeight: 800, color: '#6366f1', margin: 0 }}>{fmt$(net)}</p>
                        <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0' }}>{fmtINR(netINR)}</p>
                      </div>
                    </div>

                    {totalDed > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Charge Breakdown</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {bankCharge > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '6px 10px' }}>
                              <span style={{ fontSize: '12px' }}>🏦</span>
                              <div>
                                <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>Bank Charge</p>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', margin: 0 }}>−{fmt$(bankCharge)}</p>
                              </div>
                            </div>
                          )}
                          {gatewayFee > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '6px 10px' }}>
                              <span style={{ fontSize: '12px' }}>⚡</span>
                              <div>
                                <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>Gateway Fee</p>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', margin: 0 }}>−{fmt$(gatewayFee)}</p>
                              </div>
                            </div>
                          )}
                          {otherDed > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '6px 10px' }}>
                              <span style={{ fontSize: '12px' }}>📌</span>
                              <div>
                                <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>Other</p>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', margin: 0 }}>−{fmt$(otherDed)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {isOldest && hasCosts && student && (
                      <div style={{ marginTop: '12px', borderTop: '1px dashed rgba(139,92,246,0.2)', paddingTop: '12px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                          📦 Cost Breakdown (deducted from profit)
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {student.uniFee > 0 && (
                            <div style={{ background: 'white', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '8px', padding: '6px 10px' }}>
                              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 2px' }}>University Fee</p>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>−{fmt$(student.uniFee)}</p>
                            </div>
                          )}
                          {student.consultantComm > 0 && (
                            <div style={{ background: 'white', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '8px', padding: '6px 10px' }}>
                              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 2px' }}>Consultant</p>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>−{fmt$(student.consultantComm)}</p>
                            </div>
                          )}
                          {student.thesisCost > 0 && (
                            <div style={{ background: 'white', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '8px', padding: '6px 10px' }}>
                              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 2px' }}>Thesis</p>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>−{fmt$(student.thesisCost)}</p>
                            </div>
                          )}
                          {student.shipmentCost > 0 && (
                            <div style={{ background: 'white', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '8px', padding: '6px 10px' }}>
                              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 2px' }}>Shipment</p>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>−{fmt$(student.shipmentCost)}</p>
                            </div>
                          )}
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