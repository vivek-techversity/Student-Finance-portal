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

// Warm neutral palette — matches sidebar/body theme
const T = {
  cardBorder: '#E7E4E0',
  labelColor: '#A8A29E',
  valueColor: '#1C1917',
  subColor:   '#78716C',
  headBg:     '#FAFAF9',
};

const TONES = {
  neutral: { fg: '#1C1917', accent: '#78716C', bg: '#F5F3F0' },
  green:   { fg: '#059669', accent: '#10B981', bg: '#ECFDF5' },
  red:     { fg: '#DC2626', accent: '#EF4444', bg: '#FEF2F2' },
  indigo:  { fg: '#4F46E5', accent: '#6366F1', bg: '#F5F3FF' },
};

// ── Icons ─────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const CardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const NoteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
  </svg>
);
const BoxIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const UniIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/>
    <line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 21 8 3 8"/>
  </svg>
);
const HandshakeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 17l-2 2a1.41 1.41 0 0 1-2-2l3.59-3.59a2 2 0 0 1 2.82 0L15 15"/>
    <path d="M16 12l3-3"/><path d="M2 12l5-5 4 4 3-3"/>
  </svg>
);
const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const PackageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

// ── Cost Breakdown Tab ────────────────────────────────────────
function CostBreakdownTab({ student, calc }) {
  const costs = [
    { label: 'University Fee',   Icon: UniIcon,       value: student.uniFee },
    { label: 'Consultant Comm.', Icon: HandshakeIcon, value: student.consultantComm },
    { label: 'Thesis Cost',      Icon: FileIcon,      value: student.thesisCost },
    { label: 'Shipment Cost',    Icon: PackageIcon,   value: student.shipmentCost },
  ].filter((c) => c.value > 0);

  const totalCosts = calc.totalCosts;

  if (costs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-2"><SearchIcon /></div>
        <p className="text-sm font-semibold" style={{ color: T.subColor }}>No costs recorded</p>
        <p className="text-xs mt-1" style={{ color: T.labelColor }}>
          Edit student to add university fee, consultant commission, etc.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {costs.map(({ label, Icon, value }) => (
          <div
            key={label}
            className="rounded-xl px-4 py-3"
            style={{ background: T.headBg, border: `1px solid ${T.cardBorder}`, borderLeft: `3px solid ${TONES.indigo.accent}` }}
          >
            <div className="flex items-center gap-2 mb-1.5" style={{ color: T.subColor }}>
              <Icon />
              <p className="text-[10px] font-semibold tracking-wide uppercase">{label}</p>
            </div>
            <p className="text-lg font-extrabold tabular-nums" style={{ color: T.valueColor }}>{fmt$(value)}</p>
            <p className="text-[11px] mt-0.5" style={{ color: T.labelColor }}>
              {fmtINR(value * (student.exchangeRate || 83))}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl px-5 py-4 flex items-center justify-between flex-wrap gap-4"
        style={{ background: TONES.indigo.bg, border: `1px solid ${T.cardBorder}` }}
      >
        <div>
          <p className="text-[10px] font-semibold tracking-wide uppercase mb-1" style={{ color: T.subColor }}>Total Costs</p>
          <p className="text-2xl font-extrabold tabular-nums" style={{ color: TONES.indigo.fg }}>{fmt$(totalCosts)}</p>
          <p className="text-xs mt-0.5" style={{ color: T.labelColor }}>{fmtINR(totalCosts * (student.exchangeRate || 83))}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold tracking-wide uppercase mb-1" style={{ color: T.subColor }}>Net Profit (after costs)</p>
          <p className="text-2xl font-extrabold tabular-nums" style={{ color: calc.netProfitUSD >= 0 ? TONES.green.fg : TONES.red.fg }}>
            {fmt$(calc.netProfitUSD)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: T.labelColor }}>{fmtINR(calc.netProfitINR)}</p>
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
      <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <div className="flex justify-center mb-2"><SearchIcon /></div>
        <p className="text-sm font-semibold" style={{ color: T.subColor }}>Student not found</p>
        <button
          onClick={() => navigate('/students')}
          className="mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: '#1C1917' }}
        >
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
    { key: 'payments', label: 'Payments', Icon: CardIcon, count: payments.length },
    { key: 'notes',    label: 'Notes',    Icon: NoteIcon, count: notes.length },
    { key: 'costs',    label: 'Cost Breakdown', Icon: BoxIcon, count: null },
  ];

  const statCards = [
    { label: 'Total Fee',   value: fmt$(student.totalFee), sub: fmtINR(student.totalFee * (student.exchangeRate || 83)), tone: 'neutral' },
    { label: 'Received',    value: fmt$(c.totalReceived),  sub: fmtINR(c.netReceivedINR), tone: 'green' },
    { label: 'Outstanding', value: fmt$(c.outstanding),    sub: c.outstanding > 0 ? 'Pending' : 'Cleared', tone: c.outstanding > 0 ? 'red' : 'green' },
    { label: 'Net Profit',  value: fmt$(c.netProfitUSD),   sub: fmtINR(c.netProfitINR), tone: c.netProfitUSD >= 0 ? 'indigo' : 'red' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Back */}
      <button
        onClick={() => navigate('/students')}
        className="inline-flex items-center gap-1.5 mb-4 text-sm font-semibold"
        style={{ color: T.subColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <BackIcon /> All Students
      </button>

      {/* ── Student header card ── */}
      <div className="bg-white rounded-2xl p-6 mb-5" style={{ border: `1px solid ${T.cardBorder}` }}>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl font-extrabold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: T.valueColor }}>{student.name}</h1>
              <p className="text-sm mt-0.5 mb-2" style={{ color: T.subColor }}>{student.university}</p>
              <div className="flex gap-1.5 flex-wrap items-center">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${regionClasses(student.region)}`}>
                  {student.region}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClasses[c.status]}`}>
                  {c.status}
                </span>
                {student.program && (
                  <span className="text-xs" style={{ color: T.subColor }}>{student.program}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onEditStudent && onEditStudent(student)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ border: `1px solid ${T.cardBorder}`, background: T.headBg, color: T.valueColor, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <EditIcon /> Edit
          </button>
        </div>

        {/* Contact row */}
        <div className="flex gap-x-5 gap-y-1.5 flex-wrap mt-4 pt-4" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
          {student.email && (
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: T.subColor }}>
              <MailIcon /> {student.email}
            </span>
          )}
          {student.phone && (
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: T.subColor }}>
              <PhoneIcon /> {student.phone}
            </span>
          )}
          {student.registrationDate && (
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: T.subColor }}>
              <CalendarIcon /> Registered {fmtDate(student.registrationDate)}
            </span>
          )}
        </div>

        {/* Financials grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {statCards.map(({ label, value, sub, tone }) => {
            const t = TONES[tone];
            return (
              <div
                key={label}
                className="rounded-xl px-4 py-3"
                style={{ background: t.bg, border: `1px solid ${T.cardBorder}`, borderLeft: `3px solid ${t.accent}` }}
              >
                <p className="text-[10px] font-semibold tracking-wide uppercase mb-1" style={{ color: T.subColor }}>{label}</p>
                <p className="text-lg font-extrabold tabular-nums" style={{ color: t.fg }}>{value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: T.labelColor }}>{sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="inline-flex gap-1 mb-3 p-1 rounded-xl bg-white"
        style={{ border: `1px solid ${T.cardBorder}` }}
      >
        {TABS.map(({ key, label, Icon, count }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors"
              style={{
                border: 'none',
                fontFamily: 'inherit',
                cursor: 'pointer',
                background: active ? '#1C1917' : 'transparent',
                color: active ? '#ffffff' : T.subColor,
              }}
            >
              <Icon />
              {label}{count !== null ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="bg-white rounded-2xl p-5" style={{ border: `1px solid ${T.cardBorder}` }}>

        {activeTab === 'payments' && (
          paymentsLoading ? (
            <div className="flex justify-center py-10">
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