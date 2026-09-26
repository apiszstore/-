/**
 * Scroll ke section berdasarkan id, dengan toleransi navbar sticky.
 * Offset ditangani oleh `scroll-padding-top` di index.css.
 */
export function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

/** Scroll ke paling atas halaman. */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Bangun URL hash untuk sebuah section, supaya link bisa di-share.
 * Contoh: scrollToHash('#products')
 */
export function sectionHref(id) {
  return `#${id}`;
}
