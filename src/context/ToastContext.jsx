import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

/** Ikon kecil sesuai jenis notifikasi. */
const ICONS = {
  success: 'M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm3.2 5.3-4 4a1 1 0 0 1-1.4 0L7.8 11a1 1 0 1 1 1.4-1.4l1.3 1.3 3.3-3.3a1 1 0 0 1 1.4 1.4Z',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm1 11.3h-2v-6h2v6Z',
  warn: 'M12 3.6 1.9 20.4h20.2L12 3.6Zm.9 11.9h-1.8v-1.8h1.8v1.8Zm0-3.2h-1.8V8.9h1.8v3.4Z',
  error: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 11.1-1.4 1.4L12 13.4l-2.1 2.1-1.4-1.4L10.6 12 8.5 9.9l1.4-1.4L12 10.6l2.1-2.1 1.4 1.4L13.4 12l2.1 2.1Z',
};

function Toast({ item, onClose }) {
  return (
    <div className={`toast toast--${item.type}`} role="status">
      <svg className="toast__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d={ICONS[item.type] || ICONS.info} fill="currentColor" />
      </svg>
      <div className="toast__body">
        {item.title ? <p className="toast__title">{item.title}</p> : null}
        {item.message ? <p className="toast__message">{item.message}</p> : null}
      </div>
      <button className="toast__close" type="button" onClick={onClose} aria-label="Tutup notifikasi">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M7 5.6 5.6 7l5.4 5.4L5.6 17.8 7 19.2l5.4-5.4 5.4 5.4 1.4-1.4-5.4-5.4L19.2 7 17.8 5.6 12.4 11 7 5.6Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setItems((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message, options = {}) => {
      const { type = 'info', title = '', duration = 3600 } = options;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setItems((list) => [...list.slice(-2), { id, type, title, message }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-host" aria-live="polite">
        {items.map((item) => (
          <Toast key={item.id} item={item} onClose={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider');
  return ctx;
}
