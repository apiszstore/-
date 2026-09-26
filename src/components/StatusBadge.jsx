import { getStatus } from '../config/status.js';

/**
 * Badge status dengan titik berwarna.
 * `variant="chip"` = pill untuk kartu katalog.
 * `variant="plain"` = teks + titik untuk list/tabel.
 */
export default function StatusBadge({ status, variant = 'chip', className = '' }) {
  const meta = getStatus(status);

  if (variant === 'plain') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${meta.text} ${className}`}>
        <span className={`size-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
        {meta.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${meta.chip} ${className}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
