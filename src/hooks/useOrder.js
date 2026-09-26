import { useCallback } from 'react';
import { siteConfig } from '../config/site.js';
import { buildOrderLink, openExternal } from '../lib/links.js';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Satu pintu untuk semua aksi "Order Now" di website.
 *
 * Kalau link Discord masih placeholder, tidak membuka tab apa pun
 * dan muncul toast info. Kalau sudah diganti, langsung terbuka.
 */
export function useOrder() {
  const { push } = useToast();

  return useCallback(
    (subject) => {
      const opened = openExternal(buildOrderLink(subject));
      if (opened) {
        push('Discord APISZ STORE terbuka di tab baru.', { tone: 'success' });
        return;
      }
      push(
        subject
          ? `Link Discord belum diatur, jadi order untuk "${subject}" belum bisa dikirim.`
          : 'Link Discord belum diatur. Isi dulu di src/config/site.js.',
        { tone: 'warning', duration: 5200 },
      );
    },
    [push],
  );
}

/** Aksi untuk link social yang belum diisi. */
export function useSafeLink() {
  const { push } = useToast();

  return useCallback(
    (url, label) => {
      if (openExternal(url)) return;
      push(`Link ${label} belum tersedia.`, { tone: 'info' });
    },
    [push],
  );
}

export const orderLabel = siteConfig.order.label;
