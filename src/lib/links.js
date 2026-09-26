import { isPlaceholder, siteConfig } from '../config/site.js';

export { isPlaceholder };

/**
 * Link Discord untuk order. Menyertakan pesan pembuka supaya
 * customer tinggal lanjutkan chat.
 */
export function buildOrderLink(subject) {
  const base = siteConfig.discord;
  const message = subject
    ? `${siteConfig.order.message}\n\nSaya tertarik: ${subject}`
    : siteConfig.order.message;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/**
 * Buka link eksternal di tab baru.
 * Kalau masih placeholder, jangan dibuka — return false supaya
 * pemanggil bisa menampilkan toast info.
 */
export function openExternal(url) {
  if (isPlaceholder(url)) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
