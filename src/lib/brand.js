import { siteConfig } from '../config/site.js';

/**
 * Pasang favicon dari `siteConfig.brand.favicon`.
 *
 * Kenapa runtime, bukan `<link>` di index.html?
 * Supaya ada SATU sumber kebenaran. Kalau favicon diubah di
 * `src/config/site.js`, tag <link> di index.html ikut menyesuaikan
 * tanpa perlu dua tempat edit.
 *
 * File dicek dulu dengan HEAD request. Kalau belum ada (atau path-nya
 * salah), favicon bawaan di index.html tetap dipakai — supaya tab
 * browser tidak jadi ikon rusak selama file-nya belum diunggah. *
 * Sengaja tidak awaited di main.jsx: favicon boleh settles belakangan,
 * halaman tetap tampil normal.
 */
export async function applyFavicon() {
  const href = siteConfig.brand?.favicon;
  if (!href) return;

  try {
    const response = await fetch(href, { method: 'HEAD' });
    if (!response.ok) return;

    /* Penting: Vite dev server menjawab 200 dengan index.html untuk path
       yang tidak ada (SPA fallback). Kalau content-type-nya text/html,
       ini berarti file-nya memang belum ada — bukan gambar. */
    const type = response.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) return;

    const [link] = document.querySelectorAll('link[rel~="icon"]');
    if (!link) return;

    link.setAttribute('href', href);
    /* Buang type lama supaya browser tidak memakai cache MIME svg. */
    link.removeAttribute('type');
  } catch {
    /* File belum ada / offline -> pakai favicon bawaan. */
  }
}
