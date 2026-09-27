/**
 * Sumber tunggal untuk URL situs.
 *
 * URL production ada di 3 tempat di `index.html` (canonical, og:url,
 * JSON-LD). Daripada menyalin URL itu ke setiap tool dan berisiko
 * tidak sinkon, semua tool membaca dari `index.html`.
 *
 * Kalau URL situs berubah, cukup ganti 3 baris di `index.html` yang
 * `npm run check:url` jaga agar selalu sama.
 */
import { readFileSync } from 'node:fs';

const INDEX_URL = new URL('../index.html', import.meta.url);
const SITE_CONFIG_URL = new URL('../src/config/site.js', import.meta.url);

/** URL kanonik apa adanya, termasuk trailing slash. */
export function readCanonicalUrl() {
  const html = readFileSync(INDEX_URL, 'utf8');
  const match = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!match) throw new Error('canonical tidak ditemukan di index.html');
  return match[1];
}

/** Origin tanpa path, mis. "https://apiszstore.vercel.app". */
export function readOrigin() {
  return new URL(readCanonicalUrl()).origin;
}

/** Sama seperti `readOrigin`, tapi juga baca dari src/config/site.js. */
export function readConfiguredOrigin() {
  const text = readFileSync(SITE_CONFIG_URL, 'utf8');
  const match = text.match(/url:\s*'([^']+)'/);
  return match ? match[1].replace(/\/+$/, '') : null;
}
