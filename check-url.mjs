/**
 * Pastikan canonical, og:url, dan JSON-LD url menunjuk host yang sama.
 *
 * Alasannya: URL situs ada di 3 tempat di index.html. Kalau hanya salah
 * satu diganti, search engine dan WhatsApp/FB akan memakai URL berbeda
 * dari yang Pengunjung lihat — gejalanya share preview dan SEO tank.
 *
 * Jalankan: node check-url.mjs   (atau npm run check:url)
 */
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

const pick = (re, label) => {
  const m = html.match(re);
  if (!m) {
    console.error(`GAGAL  ${label} tidak ditemukan di index.html`);
    process.exitCode = 1;
    return null;
  }
  return m[1];
};

const canonical = pick(/<link rel="canonical" href="([^"]+)"/, 'link rel=canonical');
const ogUrl = pick(/<meta property="og:url" content="([^"]+)"/, 'meta og:url');
const jsonLdRaw = pick(/"url":\s*"([^"]+)"/, 'JSON-LD url');

let jsonLdUrl = null;
try {
  const block = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  jsonLdUrl = JSON.parse(block).url;
} catch (err) {
  console.error(`GAGAL  JSON-LD tidak bisa di-parse: ${err.message}`);
  process.exitCode = 1;
}

const host = (u) => {
  try {
    return new URL(u).host;
  } catch {
    return null;
  }
};

const hosts = { canonical: host(canonical), ogUrl: host(ogUrl), jsonLd: host(jsonLdUrl) };
const unique = new Set(Object.values(hosts));

if (unique.size === 1 && !unique.has(null)) {
  console.log(`OK    canonical / og:url / JSON-LD sinkron -> ${[...unique][0]}`);
} else {
  console.error('GAGAL  URL tidak sinkron:');
  for (const [k, v] of Object.entries(hosts)) console.error(`        ${k.padEnd(10)} ${v}`);
  process.exitCode = 1;
}
