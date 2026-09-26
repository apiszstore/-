import { useToast } from '../context/ToastContext.jsx';
import Icon from './Icon.jsx';

const TONE = {
  info: 'border-line bg-surface text-ink',
  success: 'border-available/40 bg-surface text-ink',
  warning: 'border-soon/45 bg-surface text-ink',
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex w-full max-w-sm animate-pop items-start gap-3 rounded-md border px-4 py-3 shadow-lift ${TONE[toast.tone] ?? TONE.info}`}
        >
          <Icon
            name={toast.icon}
            size={18}
            className={`mt-0.5 shrink-0 ${
              toast.tone === 'success' ? 'text-available' : toast.tone === 'warning' ? 'text-soon' : 'text-brand'
            }`}
          />
          <p className="flex-1 text-[13.5px] leading-relaxed">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Tutup notifikasi"
            className="-m-1 shrink-0 rounded p-1 text-faint transition-colors hover:text-ink"
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
