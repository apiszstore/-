/**
 * Verifikasi situs yang sudah LIVE di internet (bukan dev server).
 *
 * Yang dicek: halaman benar-benar ter-render dari CDN, aset 200, URL
 * canonical benar, dan header keamanan dari vercel.json benar-benar diterapkan.
 *
 * Jalankan: node tools/verify-live.mjs
 */
import { openBrowser } from './cdp.mjs';
import { readOrigin } from './site-url.mjs';

const ORIGIN = process.env.LIVE_URL ?? readOrigin();

let pass = 0;
let fail = 0;
const check = (label, ok, detail = '') => {
  if (ok) {
    pass += 1;
    console.log(`  OK    ${label}${detail ? `  ${detail}` : ''}`);
  } else {
    fail += 1;
    console.log(`  GAGAL ${label}${detail ? `  ${detail}` : ''}`);
  }
};

console.log(`Verifikasi live: ${ORIGIN}\n`);

console.log('=== Respons & header ===');
const res = await fetch(ORIGIN, { redirect: 'follow' });
check('halaman utama 200', res.ok, `HTTP ${res.status}`);
check('HTML yang dikembalikan', (res.headers.get('content-type') ?? '').includes('text/html'), res.headers.get('content-type') ?? '-');
check('X-Content-Type-Options: nosniff', res.headers.get('x-content-type-options') === 'nosniff', res.headers.get('x-content-type-options') ?? 'tidak ada');
check('X-Frame-Options ada', Boolean(res.headers.get('x-frame-options')), res.headers.get('x-frame-options') ?? 'tidak ada');
check('Referrer-Policy ada', Boolean(res.headers.get('referrer-policy')), res.headers.get('referrer-policy') ?? 'tidak ada');

const html = await res.text();

console.log('\n=== Metadata SEO ===');
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
check('canonical = URL live', canonical === `${ORIGIN}/`, `${canonical}`);
check('og:url = URL live', ogUrl === `${ORIGIN}/`, `${ogUrl}`);
check('og:image memakai PNG (bukan SVG)', ogImage?.endsWith('.png'), `${ogImage}`);
check('ada og:image:width', html.includes('og:image:width'));

console.log('\n=== Aset ===');
const assets = [...new Set([...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]))];
for (const p of assets) {
  const r = await fetch(new URL(p, ORIGIN));
  check(`200 ${p}`, r.ok, `HTTP ${r.status}`);
}
for (const p of ['/og-image.png', '/brand/logo.png', '/brand/favicon.png']) {
  const r = await fetch(new URL(p, ORIGIN));
  check(`200 ${p}`, r.ok, `HTTP ${r.status}`);
}
/* File konfigurasi deploy tidak boleh bocor jadi aset publik. 404 di sini
   adalah perilaku yang benar, dan membuktikan rule-nya tidak ikut ter-upload. */
for (const p of ['/_headers', '/vercel.json']) {
  const r = await fetch(new URL(p, ORIGIN));
  check(`${p} tidak terekspos publik (404 = benar)`, r.status === 404, `HTTP ${r.status}`);
}


console.log('\n=== 404 tetap 404 (fallback SPA tidak aktif) ===');
for (const p of ['/payment/dana.png', '/tidak-ada-halaman-ini', '/brand/README.txt']) {
  const r = await fetch(new URL(p, ORIGIN));
  check(`404 untuk ${p}`, r.status === 404, `HTTP ${r.status}`);
}

console.log('\n=== Render di browser (dari CDN) ===');
const b = await openBrowser({ port: 9267, target: ORIGIN, profile: 'live' });
for (const width of [360, 1440]) {
  await b.setViewport({ width, height: 900, mobile: width < 700 });
  await b.goto(ORIGIN);
  for (let i = 0; i < 60; i++) {
    if (await b.evaluate(`!!document.querySelector('header button[aria-label="Kembali ke atas"]')`)) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  const info = JSON.parse(
    await b.evaluate(`JSON.stringify({
      header: !!document.querySelector('header'),
      sections: document.querySelectorAll('section[id]').length,
      brokenNonPayment: [...document.images]
        .filter((i) => !(i.complete && i.naturalWidth > 0) && !i.src.includes('/payment/'))
        .map((i) => i.src),
      logoOk: [...document.images].some((i) => i.src.includes('/brand/logo') && i.naturalWidth > 0),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      demoBadges: [...document.querySelectorAll('*')].filter((e) => e.textContent.trim() === 'Demo').length,
      productEmpty: /dipersiapkan|sedang/i.test(document.body.innerText),
    })`),
  );
  check(`${width}px ter-render dari CDN`, info.header && info.sections >= 9, `${info.sections} section`);
  check(`${width}px logo asli termuat`, info.logoOk);
  check(`${width}px tidak ada gambar rusak`, info.brokenNonPayment.length === 0, info.brokenNonPayment.join(', '));
  check(`${width}px nol horizontal overflow`, info.overflow === 0, `${info.overflow}px`);
  if (width === 1440) {
    console.log(`  INFO  badge Demo: ${info.demoBadges}, empty state produk: ${info.productEmpty}`);
  }
}
await b.close();

console.log(`\n${pass} lulus, ${fail} gagal`);
if (fail) process.exit(1);
