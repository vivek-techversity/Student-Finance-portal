import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../components/layout/AppLayout';
import { usePayments } from '../hooks/usePayments';
import { useNotes } from '../hooks/useNotes';
import PaymentTimeline from '../components/payments/PaymentTimeline';
import NotesTab from '../components/notes/NotesTab';
import {
  fmt$, fmtINR, fmtDate, calcStudent,
  statusClasses, regionClasses,
} from '../utils/formatters';
import Spinner from '../components/ui/Spinner';

// ── Cost Breakdown Tab ────────────────────────────────────────
function CostBreakdownTab({ student, calc }) {
  const costs = [
    { label: 'University Fee',    icon: '🏛️', value: student.uniFee,         color: '#6366f1' },
    { label: 'Consultant Comm.',  icon: '🤝', value: student.consultantComm,  color: '#f59e0b' },
    { label: 'Thesis Cost',       icon: '📄', value: student.thesisCost,      color: '#8b5cf6' },
    { label: 'Shipment Cost',     icon: '📦', value: student.shipmentCost,    color: '#10b981' },
  ].filter((c) => c.value > 0);

  const totalCosts = calc.totalCosts;

  if (costs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
        <p style={{ fontSize: '32px', marginBottom: '8px' }}>📋</p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>No costs recorded</p>
        <p style={{ fontSize: '12px', marginTop: '4px' }}>Edit student to add university fee, consultant commission, etc.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Cost cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {costs.map(({ label, icon, value, color }) => (
          <div key={label} style={{
            background: '#f8fafc', borderRadius: '14px', padding: '16px',
            border: `1px solid rgba(226,232,240,0.8)`,
            borderLeft: `4px solid ${color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            </div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color }}>{fmt$(value)}</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>{fmtINR(value * (student.exchangeRate || 83))}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))',
        borderRadius: '14px', padding: '16px 20px',
        border: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Costs</p>
          <p style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: 800, color: '#6366f1' }}>{fmt$(totalCosts)}</p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{fmtINR(totalCosts * (student.exchangeRate || 83))}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Profit (after costs)</p>
          <p style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: 800,
            color: calc.netProfitUSD >= 0 ? '#10b981' : '#ef4444' }}>{fmt$(calc.netProfitUSD)}</p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{fmtINR(calc.netProfitINR)}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students = [], onEditStudent, onAddPaymentFor } = useAppData();

  const { fetchStudentPayments, deletePayment } = usePayments();
  const { notes, loading: notesLoading, fetchNotes, createNote, deleteNote } = useNotes();

  const [payments, setPayments]        = useState([]);
  const [paymentsLoading, setPLoading] = useState(true);
  const [activeTab, setActiveTab]      = useState('payments');

  const student = students.find((s) => s._id === id);

  useEffect(() => {
    if (!id) return;
    setPLoading(true);
    fetchStudentPayments(id)
      .then((data) => setPayments(data || []))
      .catch(() => setPayments([]))
      .finally(() => setPLoading(false));
  }, [id, fetchStudentPayments]);

  useEffect(() => {
    if (!id) return;
    fetchNotes(id);
  }, [id, fetchNotes]);

  if (!students.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
        <p style={{ fontSize: '32px' }}>🔍</p>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>Student not found</p>
        <button onClick={() => navigate('/students')}
          style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '10px', border: 'none',
            background: '#6366f1', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
          ← Back to Students
        </button>
      </div>
    );
  }

  const c = calcStudent(student, payments);

  const handleDeletePayment = async (payId) => {
    await deletePayment(payId);
    setPayments((prev) => prev.filter((p) => p._id !== payId));
  };

  const TABS = [
    { key: 'payments',  label: `💳 Payments`,       count: payments.length },
    { key: 'notes',     label: `📝 Notes`,           count: notes.length    },
    { key: 'costs',     label: `📦 Cost Breakdown`,  count: null            },
  ];

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Back */}
      <button onClick={() => navigate('/students')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px',
          marginBottom: '20px', background: 'none', border: 'none',
          color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        All Students
      </button>

      {/* ── Student header card ── */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px', marginBottom: '20px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 800, color: 'white' }}>
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{student.name}</h1>
              <p style={{ margin: '2px 0 6px', fontSize: '13px', color: '#64748b' }}>{student.university}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${regionClasses(student.region)}`}>
                  {student.region}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClasses[c.status]}`}>
                  {c.status}
                </span>
                {student.program && (
                  <span style={{ fontSize: '11px', color: '#64748b', padding: '2px 0' }}>{student.program}</span>
                )}
              </div>
            </div>
          </div>

          <button onClick={() => onEditStudent && onEditStudent(student)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              border: '1px solid rgba(99,102,241,0.25)',
              background: 'rgba(99,102,241,0.05)', color: '#6366f1',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
        </div>

        {/* Contact row */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
          {student.email && <span style={{ fontSize: '12px', color: '#94a3b8' }}>✉️ {student.email}</span>}
          {student.phone && <span style={{ fontSize: '12px', color: '#94a3b8' }}>📞 {student.phone}</span>}
          {student.registrationDate && <span style={{ fontSize: '12px', color: '#94a3b8' }}>📅 Registered {fmtDate(student.registrationDate)}</span>}
        </div>

        {/* Financials grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '16px' }}>
          {[
            { label: 'Total Fee',    value: fmt$(student.totalFee),  sub: fmtINR(student.totalFee * (student.exchangeRate||83)), color: '#0f172a' },
            { label: 'Received',     value: fmt$(c.totalReceived),   sub: fmtINR(c.netReceivedINR),                             color: '#10b981' },
            { label: 'Outstanding',  value: fmt$(c.outstanding),     sub: c.outstanding > 0 ? 'Pending' : 'Cleared',           color: c.outstanding > 0 ? '#ef4444' : '#10b981' },
            { label: 'Net Profit',   value: fmt$(c.netProfitUSD),    sub: fmtINR(c.netProfitINR),                               color: c.netProfitUSD >= 0 ? '#6366f1' : '#ef4444' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 14px',
              border: '1px solid rgba(226,232,240,0.8)' }}>
              <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color }}>{value}</p>
              <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#94a3b8' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '12px',
        background: 'white', borderRadius: '14px', padding: '4px',
        border: '1px solid rgba(226,232,240,0.8)', width: 'fit-content' }}>
        {TABS.map(({ key, label, count }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{
              padding: '7px 16px', borderRadius: '10px', border: 'none',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeTab === key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
              color: activeTab === key ? 'white' : '#64748b',
              boxShadow: activeTab === key ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
              transition: 'all 0.15s',
            }}>
            {label}{count !== null ? ` (${count})` : ''}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px' }}>

        {activeTab === 'payments' && (
          paymentsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Spinner />
            </div>
          ) : (
            <PaymentTimeline
              payments={payments}
              student={student}
              onAddPayment={() => onAddPaymentFor && onAddPaymentFor(student)}
              onDelete={handleDeletePayment}
            />
          )
        )}

        {activeTab === 'notes' && (
          <NotesTab
            notes={notes}
            loading={notesLoading}
            onCreate={(text) => createNote({ studentId: id, text })}
            onDelete={deleteNote}
          />
        )}

        {activeTab === 'costs' && (
          <CostBreakdownTab student={student} calc={c} />
        )}
      </div>
    </div>
  );
}