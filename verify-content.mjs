/**
 * Pengecekan akhir: aset termuat, section punya konten, tidak ada
 * placeholder/karangan yang tertinggal, dan semua id nav-benar ada.
 * Jalankan: node verify-content.mjs
 */
import { openBrowser, VIEWPORTS } from './tools/cdp.mjs';

const PORT = 9261;
const TARGET = 'http://localhost:8080/';

let pass = 0;
let fail = 0;
const check = (label, condition, detail = '') => {
  if (condition) {
    pass += 1;
    console.log(`  OK    ${label}${detail ? `  ${detail}` : ''}`);
  } else {
    fail += 1;
    console.log(`  GAGAL ${label}${detail ? `  ${detail}` : ''}`);
  }
};

const browser = await openBrowser({ port: PORT, target: TARGET, profile: 'verify-content' });

/* ---- Aset ---- */
console.log('\n=== Aset ===');
const assets = await browser.evaluate(`JSON.stringify({
  favicon: Boolean(document.querySelector('link[rel~="icon"]')),
  og: Boolean(document.querySelector('meta[property="og:image"]')),
  canonical: Boolean(document.querySelector('link[rel="canonical"]')),
  jsonLd: Boolean(document.querySelector('script[type="application/ld+json"]')),
  title: document.title,
  desc: document.querySelector('meta[name="description"]')?.content ?? '',
})`);
const a = JSON.parse(assets);
check('favicon ada', a.favicon);
check('meta og:image ada', a.og);
check('link canonical ada', a.canonical);
check('JSON-LD ada', a.jsonLd);
check('title terisi', a.title.length > 10, `"${a.title}"`);
check('meta description terisi', a.desc.length > 50);

for (const asset of ['/favicon.svg', '/og-image.svg']) {
  const status = await fetch(TARGET.replace(/\/$/, '') + asset).then((r) => r.status);
  check(`${asset} dapat diakses`, status === 200, `HTTP ${status}`);
}

/* ---- Konten tiap section ---- */
console.log('\n=== Konten section ===');
const sections = await browser.evaluate(`JSON.stringify(
  [...document.querySelectorAll('main section[id], section[id]')].map((s) => ({
    id: s.id,
    chars: (s.innerText || '').replace(/\\s+/g, ' ').trim().length,
    h2: s.querySelector('h2')?.innerText ?? null,
  })),
)`);
for (const s of JSON.parse(sections)) {
  check(`#${s.id} punya konten`, s.chars > 80, `${s.chars} karakter${s.h2 ? ` — "${s.h2}"` : ''}`);
}

/* ---- Id yang dituju navbar/footer benar-benar ada ---- */
console.log('\n=== Target navigasi ----');
const ids = await browser.evaluate(`JSON.stringify({
  present: [...document.querySelectorAll('[id]')].map((el) => el.id),
  navTargets: ['home','services','products','pricing','showcase','testimonials','faq','contact','samp','other','order','payment'],
})`);
const idData = JSON.parse(ids);
for (const target of idData.navTargets) {
  check(`id #${target} ada`, idData.present.includes(target));
}

/* ---- Sisa placeholder / data karangan ---- */
console.log('\n=== Kebersihan data ----');
const dirty = await browser.evaluate(`JSON.stringify({
  visiblePlaceholderTokens: (document.body.innerText.match(/ISI_LINK[A-Z_]*/g) || []),
  fakeNumber: (document.body.innerText.match(/6280000000000/g) || []),
  hasPajak: document.body.innerText.includes('pajak yang berlaku'),
  hasPriceTypo: document.body.innerText.includes('Price dan detailnya'),
  hasAdacheckout: document.body.innerText.includes('adacheckout'),
  copyright: document.body.innerText.match(/© \\d{4} APISZ STORE[^\\n]*/)?.[0] ?? null,
  orderButtons: [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Order Now').length,
  demoBadges: [...document.querySelectorAll('span')].filter((s) => s.textContent.trim() === 'Demo').length,
  fakeStars: [...document.querySelectorAll('.fill-brand')].filter((s) => s.closest('svg[viewBox="0 0 20 20"]')).length,
  ratingMissing: [...document.querySelectorAll('span')].filter((s) => s.textContent.trim() === 'Belum ada rating').length,
})`);
const d = JSON.parse(dirty);
check('tidak ada token ISI_LINK yang terlihat', d.visiblePlaceholderTokens.length === 0, d.visiblePlaceholderTokens.join(', '));
check('tidak ada nomor WhatsApp karangan', d.fakeNumber.length === 0);
check('klaim pajak sudah dihapus', !d.hasPajak);
check('typo "Price dan detailnya" sudah dibenahi', !d.hasPriceTypo);
check('typo "adacheckout" sudah dibenahi', !d.hasAdacheckout);
check('copyright hardcode 2026', d.copyright === '© 2026 APISZ STORE. All rights reserved.', `"${d.copyright}"`);
check('tombol Order Now ada', d.orderButtons > 0, `${d.orderButtons} tombol`);
check('testimonial demo diberi badge', d.demoBadges === 3, `${d.demoBadges} badge`);
check('tidak ada bintang rating palsu', d.fakeStars === 0, `${d.fakeStars} bintang`);
check('rating kosong ditandai "Belum ada rating"', d.ratingMissing === 3, `${d.ratingMissing} penanda`);

/* ---- Nav aktif orange ---- */
console.log('\n=== Active nav (scroll-spy) ===');
/* Matikan smooth-scroll supaya posisi terukur final, bukan tengah animasi. */
await browser.evaluate(`document.documentElement.style.scrollBehavior = 'auto'; true`);

for (const id of ['home', 'pricing', 'contact']) {
  const scrolled = await browser.evaluate(
    `(() => { const n = document.getElementById('${id}'); if (!n) return false; n.scrollIntoView({ block: 'start' }); return true; })()`,
  );
  if (!scrolled) {
    check(`scroll ke #${id}`, false, 'section tidak ada');
    continue;
  }
  await new Promise((r) => setTimeout(r, 1000));

  const current = await browser.evaluate(
    `JSON.stringify([...document.querySelectorAll('[aria-current="true"]')].map((b) => b.textContent.trim()))`,
  );
  const active = JSON.parse(current);
  check(
    `scroll ke #${id} menyorot menu yang benar`,
    active.map((c) => c.toLowerCase()).includes(id),
    `aktif: ${active.join(', ') || 'tidak ada'}`,
  );
}

/* ---- Empty state katalog ---- */
console.log('\n=== Empty state produk ----');
const catalog = await browser.evaluate(`JSON.stringify({
  emptyHeading: [...document.querySelectorAll('#products h3')].map((h) => h.innerText),
  filters: [...document.querySelectorAll('#products button[aria-pressed]')].map((b) => b.textContent.trim()),
  searchExists: Boolean(document.querySelector('#products input')),
})`);
const c = JSON.parse(catalog);
check('katalog kosong menampilkan empty state', c.emptyHeading.some((h) => h.includes('dipersiapkan')), c.emptyHeading.join(' | '));
check('filter kategori tetap tampil', c.filters.length >= 3, `${c.filters.length} filter`);
check('kolom pencarian ada', c.searchExists);

await browser.close();
console.log(`\n${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
