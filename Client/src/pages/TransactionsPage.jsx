import { useMemo, useState } from 'react';
import { useAppData } from '../components/layout/AppLayout';
import { fmt$, fmtDate, fmtINR, METHOD_ICON } from '../utils/formatters';

const METHOD_COLORS = {
  'Bank Transfer': 'bg-indigo-100 text-indigo-700',
  UPI:             'bg-emerald-100 text-emerald-700',
  PayPal:          'bg-amber-100 text-amber-700',
  EMI:             'bg-purple-100 text-purple-700',
  Other:           'bg-slate-100 text-slate-600',
};

export default function TransactionsPage() {
  const { students = [], payments = [], liveRate, loading, onViewStudent } = useAppData();

  const [search, setSearch]       = useState('');
  const [methodFilter, setMethod] = useState('All');
  const [sortDir, setSortDir]     = useState('desc'); // desc = latest first

  // Enrich payments with student info
  const enriched = useMemo(() => {
    return payments.map((p) => {
      const student = students.find(
        (s) => s._id === (p.studentId?._id || p.studentId)
      );
      const net =
        p.amountUSD -
        (p.bankCharge || 0) -
        (p.gatewayFee || 0) -
        (p.otherDeduction || 0);
      const deductions =
        (p.bankCharge || 0) + (p.gatewayFee || 0) + (p.otherDeduction || 0);
      return { ...p, student, net, deductions };
    });
  }, [payments, students]);

  // Unique methods for filter
  const methods = useMemo(() => {
    const s = new Set(payments.map((p) => p.method || 'Other'));
    return ['All', ...Array.from(s).sort()];
  }, [payments]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...enriched];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.student?.name?.toLowerCase().includes(q) ||
          p.method?.toLowerCase().includes(q) ||
          p.note?.toLowerCase().includes(q)
      );
    }

    if (methodFilter !== 'All') {
      list = list.filter((p) => (p.method || 'Other') === methodFilter);
    }

    list.sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return sortDir === 'desc' ? -diff : diff;
    });

    return list;
  }, [enriched, search, methodFilter, sortDir]);

  // Totals for filtered
  const totals = useMemo(() => ({
    gross: filtered.reduce((a, p) => a + p.amountUSD, 0),
    net:   filtered.reduce((a, p) => a + p.net, 0),
    deductions: filtered.reduce((a, p) => a + p.deductions, 0),
  }), [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800">All Transactions</h1>
          <p className="text-xs text-slate-400 mt-0.5">{filtered.length} of {payments.length} payments</p>
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200
            px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          {sortDir === 'desc' ? '↓ Newest first' : '↑ Oldest first'}
        </button>
      </div>

      {/* ── Summary cards ──────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Gross',      value: fmt$(totals.gross),      sub: liveRate ? fmtINR(totals.gross * liveRate) : '—',      color: 'from-indigo-500 to-violet-500', tc: 'text-indigo-700' },
          { label: 'Total Net',        value: fmt$(totals.net),        sub: liveRate ? fmtINR(totals.net * liveRate) : '—',        color: 'from-emerald-400 to-green-500', tc: 'text-emerald-700' },
          { label: 'Total Deductions', value: fmt$(totals.deductions), sub: `${filtered.length} transactions`,                    color: 'from-red-400 to-rose-500',       tc: 'text-red-600' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`h-0.5 w-full bg-gradient-to-r ${c.color}`} />
            <div className="p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.tc}`}>{c.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search student, method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>

        {/* Method filter pills */}
        <div className="flex items-center gap-1.5">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                methodFilter === m
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Transactions table ─────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-3xl mb-2">💸</p>
            <p className="text-sm font-medium">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-slate-50">
              {['Student', 'Date & Method', 'Gross', 'Deductions', 'Net', 'Note'].map((h) => (
                <p key={h} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</p>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((p) => (
              <div
                key={p._id}
                className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3.5 hover:bg-slate-50
                  transition-colors items-center"
              >
                {/* Student */}
                <div
                  className="flex items-center gap-2.5 cursor-pointer group"
                  onClick={() => p.student && onViewStudent(p.student)}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center
                    text-xs font-bold text-indigo-600 flex-shrink-0">
                    {(p.student?.name?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {p.student?.name || '—'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{p.student?.university || ''}</p>
                  </div>
                </div>

                {/* Date & Method */}
                <div>
                  <p className="text-sm text-slate-600">{fmtDate(p.date)}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${METHOD_COLORS[p.method] || METHOD_COLORS.Other}`}>
                    {METHOD_ICON[p.method] || '💵'} {p.method || 'Other'}
                  </span>
                </div>

                {/* Gross */}
                <div>
                  <p className="text-sm font-bold text-slate-800">{fmt$(p.amountUSD)}</p>
                  {p.exchangeRate && (
                    <p className="text-[11px] text-slate-400">₹{p.exchangeRate}/USD</p>
                  )}
                </div>

                {/* Deductions */}
                <div>
                  {p.deductions > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-red-500">-{fmt$(p.deductions)}</p>
                      <p className="text-[11px] text-slate-400">charges</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-300">—</p>
                  )}
                </div>

                {/* Net */}
                <p className="text-sm font-bold text-emerald-600">{fmt$(p.net)}</p>

                {/* Note */}
                <p className="text-xs text-slate-400 truncate italic">
                  {p.note ? `"${p.note}"` : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}