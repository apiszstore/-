import { isPlaceholder } from '../lib/links';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

/**
 * Helper untuk membuka link eksternal.
 * Kalau link masih placeholder, tidak akan dibuka dan muncul notifikasi.
 */
export function useExternalLink() {
  const { config } = useApp();
  const { notify } = useToast();

  return (link, label = 'Tautan ini') => {
    if (isPlaceholder(link)) {
      notify(`${label} belum dikonfigurasi. Isi dulu di src/config.js`, {
        type: 'warn',
        title: 'Segera hadir',
        duration: 4200,
      });
      return false;
    }
    window.open(link, '_blank', 'noopener,noreferrer');
    return true;
  };
}
