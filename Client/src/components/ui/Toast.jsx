import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// ── Context ────────────────────────────────────────────────────
const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      {/* Toast stack — bottom right */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Single toast item ──────────────────────────────────────────
function ToastItem({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay for enter animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const styles = {
    success: {
      wrapper: 'bg-white border border-emerald-200 shadow-lg shadow-emerald-50',
      icon:    '✅',
      text:    'text-emerald-700',
    },
    error: {
      wrapper: 'bg-white border border-red-200 shadow-lg shadow-red-50',
      icon:    '❌',
      text:    'text-red-600',
    },
    info: {
      wrapper: 'bg-white border border-indigo-200 shadow-lg shadow-indigo-50',
      icon:    'ℹ️',
      text:    'text-indigo-600',
    },
    warning: {
      wrapper: 'bg-white border border-amber-200 shadow-lg shadow-amber-50',
      icon:    '⚠️',
      text:    'text-amber-600',
    },
  };

  const s = styles[toast.type] || styles.success;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl min-w-[260px] max-w-sm
                  transition-all duration-300 cursor-pointer select-none
                  ${s.wrapper}
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      onClick={onClose}
    >
      <span className="text-base flex-shrink-0">{s.icon}</span>
      <span className={`text-sm font-medium flex-1 ${s.text}`}>
        {toast.message}
      </span>
      <button
        className="text-slate-300 hover:text-slate-500 transition-colors text-xs ml-1"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        ✕
      </button>
    </div>
  );
}

// ── Custom hook ────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}