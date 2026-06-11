import { useState, useMemo } from 'react';
import { useAppData } from '../components/layout/AppLayout';
import StudentTable from '../components/students/StudentTable';

const REGIONS  = ['UK', 'USA', 'Canada', 'Australia', 'Europe', 'Other'];
const STATUSES = ['Fully Paid', 'Partial', 'Unpaid'];

export default function StudentsPage() {
  const {
    students = [],
    calcs = {},
    loading,
    onEditStudent,
    onDeleteStudent,
    onAddPaymentFor,
    onViewStudent,
  } = useAppData();

  const [searchQ,  setSearchQ]  = useState('');
  const [fRegion,  setFRegion]  = useState('');
  const [fStatus,  setFStatus]  = useState('');
  const [fProgram, setFProgram] = useState('');

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const c = calcs[s._id];
      if (!c) return true;
      const q = searchQ.toLowerCase();
      if (q && !s.name.toLowerCase().includes(q) && !s.university.toLowerCase().includes(q) &&
        !(s.email || '').toLowerCase().includes(q) && !(s.phone || '').includes(q)) return false;
      if (fRegion && s.region !== fRegion) return false;
      if (fStatus && c.status !== fStatus) return false;
      if (fProgram && s.program !== fProgram) return false;
      return true;
    });
  }, [students, calcs, searchQ, fRegion, fStatus, fProgram]);

  const programs = useMemo(() => [...new Set(students.map((s) => s.program))].sort(), [students]);

  const clearFilters = () => { setSearchQ(''); setFRegion(''); setFStatus(''); setFProgram(''); };
  const hasFilters = searchQ || fRegion || fStatus || fProgram;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputStyle = {
    border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px',
    fontSize: '13px', color: '#1e293b', background: '#f8fafc',
    outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>

      {/* Toolbar */}
      <div style={{
        background: 'white', borderRadius: '14px', padding: '12px 16px',
        border: '1px solid rgba(99,102,241,0.1)',
        boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flexShrink: 0,
      }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '180px', maxWidth: '280px',
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search name, university…"
            style={{ background: 'transparent', fontSize: '13px', color: '#1e293b', outline: 'none', width: '100%', border: 'none', fontFamily: 'inherit' }}
          />
          {searchQ && (
            <button onClick={() => setSearchQ('')} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>✕</button>
          )}
        </div>

        <select value={fRegion} onChange={(e) => setFRegion(e.target.value)} style={inputStyle}>
          <option value="">All Regions</option>
          {REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>

        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={inputStyle}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>

        <select value={fProgram} onChange={(e) => setFProgram(e.target.value)} style={inputStyle}>
          <option value="">All Programs</option>
          {programs.map((p) => <option key={p}>{p}</option>)}
        </select>

        {hasFilters && (
          <button onClick={clearFilters}
            style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Clear
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>
          {filtered.length} / {students.length} students
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'white', borderRadius: '14px',
        border: '1px solid rgba(99,102,241,0.1)',
        boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
        overflow: 'hidden', flex: 1, overflowY: 'auto',
      }}>
        <StudentTable
          students={filtered} calcs={calcs}
          onView={onViewStudent} onEdit={onEditStudent}
          onDelete={onDeleteStudent} onAddPayment={onAddPaymentFor}
        />
      </div>
    </div>
  );
}