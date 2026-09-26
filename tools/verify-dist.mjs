/**
 * Uji build produksi (folder dist/) seolah-olah sudah di-host di
 * Cloudflare Pages: static server, bukan vite dev.
 *
 * Tujuannya menangkap masalah yang HANYA muncul di build static —
 * asset salah path, file hilang, 404, atau salah referrer.
 *
 * Jalankan: node tools/verify-dist.mjs
 */
import { openBrowser } from './cdp.mjs';
import { existsSync, readFileSync } from 'node:fs';

const ORIGIN = process.env.DIST_ORIGIN ?? 'http://localhost:8090/';

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

console.log(`Uji build static: ${ORIGIN}\n`);

const html = await (await fetch(ORIGIN)).text();

console.log('=== Aset di dist ===');
const referenced = [
  ...new Set(
    [
      ...html.matchAll(/(?:src|href)="(\/[^"]+)"/g),
      ...html.matchAll(/content="(\/[^"]+\.(?:png|svg|ico|webp))"/g),
    ].map((m) => m[1]),
  ),
];
for (const path of referenced) {
  const res = await fetch(new URL(path, ORIGIN));
  check(`terjawab 200 ${path}`, res.ok, `HTTP ${res.status}`);
}

console.log('\n=== Aset wajib ===');
for (const p of [
  '/og-image.png',
  '/og-image.svg',
  '/favicon.svg',
  '/brand/logo.png',
  '/brand/favicon.png',
  '/_headers',
]) {
  const res = await fetch(new URL(p, ORIGIN));
  check(`ada ${p}`, res.ok, `HTTP ${res.status}`);
}

console.log('\n=== Catatan developer tidak bocor ===');
for (const p of ['/brand/README.txt', '/payment/README.txt', '/docs/', '/src/config/site.js']) {
  const res = await fetch(new URL(p, ORIGIN));
  check(`tidak terekspos ${p}`, !res.ok || res.status === 404, `HTTP ${res.status}`);
}

console.log('\n=== Halaman dirender di static server ===');
const b = await openBrowser({ port: 9266, target: ORIGIN, profile: 'dist' });
const missing = [];
b.on((msg) => {
  if (msg.method === 'Network.loadingFailed') missing.push(msg.params?.errorText);
});
for (const width of [360, 1440]) {
  await b.setViewport({ width, height: 900, mobile: width < 700 });
  await b.goto(ORIGIN);
  for (let i = 0; i < 40; i++) {
    if (await b.evaluate(`!!document.querySelector('header button[aria-label="Kembali ke atas"]')`)) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  const info = JSON.parse(
    await b.evaluate(`JSON.stringify({
      header: !!document.querySelector('header'),
      footer: !!document.querySelector('footer'),
      sections: document.querySelectorAll('section[id]').length,
      imgs: [...document.images].map((i) => ({ src: i.currentSrc || i.src, ok: i.complete && i.naturalWidth > 0 })),
      brokenImgs: [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.src),
      /* Payment logo memang belum diunggah; komponen Payment jatuh ke
         teks nama. Jadi 404 di sini itu perilaku yang dirancang, bukan bug.
         Yang berbahaya adalah gambar rusak yang TIDAK punya fallback. */
      brokenPayment: [...document.images]
        .filter((i) => !(i.complete && i.naturalWidth > 0) && i.src.includes('/payment/'))
        .map((i) => i.src),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    })`),
  );
  check(`${width}px header + footer ter-render`, info.header && info.footer);
  check(`${width}px semua section ada`, info.sections >= 9, `${info.sections} section`);
  const otherBroken = info.brokenImgs.filter((s) => !info.brokenPayment.includes(s));
  check(`${width}px tidak ada gambar rusak tanpa fallback`, otherBroken.length === 0, otherBroken.join(', '));
  if (info.brokenPayment.length) {
    console.log(
      `  INFO  ${width}px logo payment belum diunggah (pakai fallback teks)  ${info.brokenPayment.length} file`,
    );
  }
  check(`${width}px logo termuat`, info.imgs.some((i) => i.src.includes('logo') && i.ok), `${info.imgs.length} img`);
  check(`${width}px nol horizontal overflow`, info.overflow === 0, `${info.overflow}px`);
}
check('tidak ada resource gagal dimuat', missing.length === 0, missing.join(', '));
await b.close();

console.log(`\n${pass} lulus, ${fail} gagal`);
if (fail) process.exit(1);
