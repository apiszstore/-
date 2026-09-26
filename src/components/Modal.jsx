import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icons';

/**
 * Modal reusable: backdrop blur, animasi masuk, tutup dengan ESC atau klik backdrop.
 * Mengunci scroll body selama modal terbuka.
 */
export default function Modal({ open, onClose, title, subtitle, children, size = 'md', labelledBy }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (panelRef.current) panelRef.current.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy || 'modal-title'}>
      <button type="button" className="modal__backdrop" onClick={onClose} aria-label="Tutup" tabIndex={-1} />
      <div className={`modal__panel modal__panel--${size}`} ref={panelRef} tabIndex={-1}>
        <header className="modal__head">
          <div>
            {title ? <h3 className="modal__title">{title}</h3> : null}
            {subtitle ? <p className="modal__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Tutup modal">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
