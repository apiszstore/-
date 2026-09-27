import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

/**
 * Modal dasar.
 *
 * Perhatian supaya tidak bugs di mobile:
 * - `max-h` memakai dvh, bukan vh (tetap benar saat address bar browser HP hide)
 * - isi modal yang scroll, bukan body
 * - body dikunci scroll selama modal terbuka
 * - Escape menutup, klik backdrop menutup, fokus dikembalikan
 *
 * `panelClassName` menimpa class panel kalau pemanggil butuh lebar atau
 * tinggi yang berbeda (mis. lightbox gambar yang harus muat tanpa terpotong).
 * Kalau diisi, class bawaan `max-w-lg` TIDAK lagi dipakai supaya tidak
 * bertabrakan.
 */
export default function Modal({ open, onClose, labelledBy, panelClassName = '', children }) {
  const panelRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    restoreRef.current = document.activeElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Fokus ke panel supaya keyboard user tidak terjebak di belakang modal.
    panelRef.current?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 animate-fade bg-black/65 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex max-h-[88dvh] w-full animate-pop flex-col overflow-hidden rounded-t-xl border border-line bg-surface shadow-lift outline-none sm:rounded-lg ${panelClassName || 'max-w-lg sm:max-h-[85dvh]'}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3.5 right-3.5 z-10 grid size-8 place-items-center rounded-md border border-line bg-raised text-muted transition-colors hover:border-brand/45 hover:text-brand"
        >
          <Icon name="close" size={16} />
        </button>

        {children}
      </div>
    </div>
  );
}
