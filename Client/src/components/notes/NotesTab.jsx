import { useState } from 'react';
import { fmtDate } from '../../utils/formatters';
import ConfirmDialog from '../ui/ConfirmDialog';

/**
 * Props:
 *   notes      — array of note objects
 *   loading    — boolean
 *   onCreate   — fn(text)
 *   onDelete   — fn(id)
 */
export default function NotesTab({ notes, loading, onCreate, onDelete }) {
  const [text,          setText]          = useState('');
  const [saving,        setSaving]        = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      setSaving(true);
      await onCreate(trimmed);
      setText('');
    } finally {
      setSaving(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const sorted = [...notes].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  return (
    <div>
      {/* Add note input */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Add a note… (Enter to save)"
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800
            bg-slate-50 placeholder:text-slate-400 outline-none transition-all
            focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim() || saving}
          className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-500 rounded-lg
            hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-1.5 flex-shrink-0"
        >
          {saving ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3"
                strokeDasharray="32" strokeDashoffset="12"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          )}
          Add
        </button>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm font-medium">No notes yet</p>
          <p className="text-xs mt-1">Type above to add the first one</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((n) => (
            <div
              key={n._id}
              className="group flex items-start gap-3 bg-slate-50 border border-slate-200
                rounded-xl px-4 py-3.5 hover:border-slate-300 transition-colors"
            >
              {/* Author avatar */}
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center
                text-[11px] font-bold text-indigo-600 flex-shrink-0 mt-0.5">
                A
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-relaxed">{n.text}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                  <span>{n.author || 'Admin'}</span>
                  <span>·</span>
                  <span>{fmtDate(n.date || n.createdAt?.split('T')[0])}</span>
                </div>
              </div>

              {/* Delete — show on hover */}
              <button
                onClick={() => setDeleteTarget(n)}
                title="Delete note"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg
                  text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Note?"
        message="This note will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={() => { onDelete(deleteTarget._id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}