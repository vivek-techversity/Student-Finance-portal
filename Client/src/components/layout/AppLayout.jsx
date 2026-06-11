import { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useStudents } from '../../hooks/useStudents';
import { usePayments } from '../../hooks/usePayments';
import { useToast } from '../ui/Toast';
import { calcStudent } from '../../utils/formatters';
import StudentModal from '../students/StudentModal';
import PaymentModal from '../payments/PaymentModal';
import ConfirmDialog from '../ui/ConfirmDialog';

// ── Global context shared with child pages via window ──────────────────────────
let _setAppData = null;
export function useAppData() {
  const [data, setData] = useState(() => window.__appData || {});
  useEffect(() => {
    const handler = () => setData({ ...window.__appData });
    window.addEventListener('appdatachange', handler);
    return () => window.removeEventListener('appdatachange', handler);
  }, []);
  return data;
}

function pushAppData(obj) {
  window.__appData = { ...(window.__appData || {}), ...obj };
  window.dispatchEvent(new Event('appdatachange'));
}

export default function AppLayout() {
  const navigate = useNavigate();
  const showToast = useToast();

  const {
    students, loading: studentsLoading, refetch: refetchStudents,
    createStudent, updateStudent, deleteStudent,
  } = useStudents();

  const {
    payments, loading: paymentsLoading, refetch: refetchPayments,
    createPayment, updatePayment, deletePayment, appendPayment,
  } = usePayments();

  const [liveRate, setLiveRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);

  const fetchRate = useCallback(async () => {
    setRateLoading(true);
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/USD');
      const d = await r.json();
      if (d.rates?.INR) { setLiveRate(d.rates.INR); setRateLoading(false); return; }
    } catch { /* fallback */ }
    try {
      const r2 = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR');
      const d2 = await r2.json();
      if (d2.rates?.INR) setLiveRate(d2.rates.INR);
    } finally { setRateLoading(false); }
  }, []);

  const [target, setTarget] = useState(() => Number(localStorage.getItem('tv_target') || 15000));
  const saveTarget = (v) => { setTarget(v); localStorage.setItem('tv_target', v); };

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [preStudent, setPreStudent] = useState(null);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetInput, setTargetInput] = useState(target);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const calcs = useMemo(() => {
    const m = {};
    students.forEach((s) => { m[s._id] = calcStudent(s, payments); });
    return m;
  }, [students, payments]);

  const overdueStudents = useMemo(
    () => students.filter((s) => calcs[s._id]?.isOverdue),
    [students, calcs]
  );

  useEffect(() => {
    pushAppData({
      students, payments, calcs, target, liveRate,
      overdueStudents,
      loading: studentsLoading || paymentsLoading,
      onEditStudent: (s) => { setEditStudent(s); setShowStudentModal(true); },
      onDeleteStudent: (s) => setDeleteConfirm(s),
      onAddPaymentFor: (s) => { setPreStudent(s); setShowPaymentModal(true); },
      onViewStudent: (s) => navigate(`/students/${s._id}`),
      onUpdatePayment: updatePayment,
      onDeletePayment: deletePayment,
      refetchStudents,
      refetchPayments,
    });
  }, [students, payments, calcs, target, liveRate, overdueStudents, studentsLoading, paymentsLoading]);

  const exportCSV = () => {
    const headers = ['Name','Email','Phone','Date','Region','Program','University','Total Fee','Received','Outstanding','Net Profit USD','Status'];
    const rows = students.map((s) => {
      const c = calcs[s._id];
      return [s.name, s.email||'', s.phone||'', s.registrationDate, s.region, s.program,
        s.university, s.totalFee, c.totalReceived.toFixed(2),
        c.outstanding.toFixed(2), c.netProfitUSD.toFixed(2), c.status];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'techversity-students.csv';
    a.click();
    showToast('CSV exported!', 'info');
  };

  const handleAddStudent = () => { setEditStudent(null); setShowStudentModal(true); };
  const handleAddPayment = () => { setPreStudent(null); setShowPaymentModal(true); };

  const handleSaveStudent = async (formData) => {
    try {
      if (editStudent) {
        await updateStudent(editStudent._id, formData);
        showToast('Student updated!', 'success');
      } else {
        const result = await createStudent(formData);
        if (result.initialPayment) appendPayment(result.initialPayment);
        showToast('Student added!', 'success');
      }
      setShowStudentModal(false);
      setEditStudent(null);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save student', 'error');
    }
  };

  const handleSavePayment = async (formData) => {
    try {
      await createPayment(formData);
      showToast('Payment recorded!', 'success');
      setShowPaymentModal(false);
      setPreStudent(null);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to record payment', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteStudent(deleteConfirm._id);
      showToast('Student deleted', 'error');
      setDeleteConfirm(null);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  return (
    /* ── FIXED: solid warm beige — no more 4-color gradient ── */
    <div className="min-h-screen flex" style={{ background: '#FAFAF9', minHeight: '100vh' }}>
      <Sidebar
        overdueCount={overdueStudents.length}
        onAddStudent={handleAddStudent}
        onAddPayment={handleAddPayment}
        onSetTarget={() => { setTargetInput(target); setShowTargetModal(true); }}
        onExportCSV={exportCSV}
      />

      <div className="ml-60 flex-1 flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        <Topbar
          liveRate={liveRate}
          rateLoading={rateLoading}
          onRefreshRate={fetchRate}
          students={students}
          payments={payments}
          calcs={calcs}
        />

        <main className="flex-1 p-6 overflow-y-auto" style={{ height: 'calc(100vh - 57px)' }}>
          <Outlet />
        </main>
      </div>

      {/* Student Modal */}
      {showStudentModal && (
        <StudentModal
          initial={editStudent}
          liveRate={liveRate}
          totalPaid={editStudent ? (calcs[editStudent._id]?.totalReceived ?? 0) : 0}
          onClose={() => { setShowStudentModal(false); setEditStudent(null); }}
          onSave={handleSaveStudent}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          students={students}
          pre={preStudent}
          liveRate={liveRate}
          onClose={() => { setShowPaymentModal(false); setPreStudent(null); }}
          onSave={handleSavePayment}
        />
      )}

      {/* Target Modal — warm neutral theme */}
      {showTargetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(28,25,23,0.45)' }}
          onClick={() => setShowTargetModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6"
            style={{ border: '1px solid #E7E4E0', boxShadow: '0 8px 32px rgba(28,25,23,0.14)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold text-stone-800 mb-1">Monthly Target</h2>
            <p className="text-xs text-stone-400 mb-4">Set your USD collection goal for this month</p>

            <div className="mb-4">
              <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
                Target Amount (USD)
              </label>
              <input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none"
                style={{
                  background: '#F5F3F0',
                  border: '1px solid #D6D3D1',
                  fontVariantNumeric: 'tabular-nums',
                }}
                placeholder="e.g. 15000"
              />
              {liveRate && (
                <p className="text-xs text-stone-400 mt-1.5">
                  ≈ ₹{Math.round(targetInput * liveRate).toLocaleString('en-IN')} at live rate
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowTargetModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: '#78716C', background: '#EAE8E4' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E0DDD9'}
                onMouseLeave={e => e.currentTarget.style.background = '#EAE8E4'}
              >
                Cancel
              </button>
              <button
                onClick={() => { saveTarget(targetInput); setShowTargetModal(false); showToast('Target saved!', 'info'); }}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                style={{ background: '#1C1917' }}
                onMouseEnter={e => e.currentTarget.style.background = '#292524'}
                onMouseLeave={e => e.currentTarget.style.background = '#1C1917'}
              >
                Save Target
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Student?"
        message={`Delete "${deleteConfirm?.name}"? All payments and notes will be permanently removed.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}