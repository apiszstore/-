/**
 * Pengecekan akhir: aset termuat, section punya konten, tidak ada
 * placeholder/karangan yang tertinggal, dan semua id nav-benar ada.
 * Jalankan: node verify-content.mjs
 */
import { readFileSync } from 'node:fs';
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
  stars: document.querySelectorAll('#testimonials svg[viewBox="0 0 20 20"]').length,
  dates: [...document.querySelectorAll('#testimonials time')].map((t) => t.getAttribute('datetime')),
  tags: [...document.querySelectorAll('#testimonials span')].filter((s) => /verified|repeat|custom project|paket/i.test(s.textContent)).length,
  products: [...document.querySelectorAll('#testimonials figcaption span')].map((s) => s.textContent.trim()),
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

/* ---- Social: WhatsApp diganti Instagram ---- */
console.log('\n=== Social links ===');
const socials = await browser.evaluate(`(() => {
  const col = [...document.querySelectorAll('footer h3, footer h2, footer [class*="font"]')]
    .find((el) => el.textContent.trim() === 'Social');
  const box = col?.closest('div');
  return JSON.stringify({
    labels: box ? [...box.querySelectorAll('li button')].map((b) => b.textContent.trim()) : [],
    footerText: document.querySelector('footer')?.innerText ?? '',
  });
})()`);
const so = JSON.parse(socials);
check('kolom Social punya 3 link', so.labels.length === 3, so.labels.join(' | '));
check('Instagram ada di kolom Social', so.labels.some((l) => l.startsWith('Instagram')), so.labels.join(' | '));
check('WhatsApp tidak ada di footer', !/whatsapp|wa\.me/i.test(so.footerText), 'dihapus');

/* Sumber config ikutDicek, bukan hanya hasil render — supaya.social
   whatsapp tidak bisa "diam-diam" kembali lewat refactor. */
const configSrc = readFileSync(new URL('./src/config/site.js', import.meta.url), 'utf8');
check('config tidak punya social whatsapp', !/whatsapp/i.test(configSrc), 'dihapus');
check('config punya social instagram', /instagram:\s*'https:\/\/instagram\.com\//i.test(configSrc), 'ada');

/* ---- Testimonial: nama, tag, komentar, produk, bintang, tanggal ---- */
console.log('\n=== Kelengkapan testimonial ===');
check('bintang 1-5 dirender per kartu', d.stars === 15, `${d.stars} bintang (3 kartu x 5)`);
check('tanggal dirender sebagai <time>', d.dates.length === 3, d.dates.join(', '));
check('format tanggal Indonesia', d.dates.every((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)), d.dates.join(', '));
check('tag customer dirender', d.tags >= 3, `${d.tags} tag`);
check('produk/jasa dirender', d.products.length === 3, d.products.join(' | '));

/* ---- Payment: logo + nama, tanpa nomor ---- */
console.log('\n=== Payment ===');
const payment = await browser.evaluate(`JSON.stringify({
  names: [...document.querySelectorAll('#payment p')].map((p) => p.textContent.trim()).filter((t) => ['DANA','GoPay','QRIS'].includes(t)),
  logos: [...document.querySelectorAll('#payment img')].map((i) => i.getAttribute('src')),
  fallbacks: [...document.querySelectorAll('#payment span')].filter((s) => ['DANA','GoPay','QRIS'].includes(s.textContent.trim())).length,
  hasNumberText: document.querySelector('#payment').innerText.includes('Nomor belum ditampilkan'),
})`);
const pay = JSON.parse(payment);
check('nama DANA/GoPay/QRIS tampil', pay.names.length === 3, pay.names.join(', '));
check('elemen logo tersedia', pay.logos.length === 3, pay.logos.join(', '));
check('tidak ada teks "Nomor belum ditampilkan"', !pay.hasNumberText);

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
console.log('\n=== Empty state produk ===');
const catalog = await browser.evaluate(`JSON.stringify({
  emptyHeading: [...document.querySelectorAll('#products h3')].map((h) => h.innerText),
  filters: [...document.querySelectorAll('#products button[aria-pressed]')].map((b) => b.textContent.trim()),
  searchExists: Boolean(document.querySelector('#products input')),
})`);
const c = JSON.parse(catalog);
check('katalog kosong menampilkan empty state', c.emptyHeading.some((h) => h.includes('dipersiapkan')), c.emptyHeading.join(' | '));
check('filter kategori tetap tampil', c.filters.length >= 3, `${c.filters.length} filter`);
check('kolom pencarian ada', c.searchExists);

/* ---- Harga Paket On Server Basic ---- */
console.log('\n=== Harga Paket On Server ===');
const prices = await browser.evaluate(`JSON.stringify({
  basic: (document.querySelector('#samp')?.innerText.match(/Rp2\\.000/g) || []).length,
  oldBasic: (document.querySelector('#samp')?.innerText.match(/Rp5\\.000/g) || []).length,
  pricing: (document.querySelector('#pricing')?.innerText.match(/Rp2\\.000/g) || []).length,
  pricingOld: (document.querySelector('#pricing')?.innerText.match(/Rp5\\.000/g) || []).length,
})`);
const p = JSON.parse(prices);
check('Basic tampil Rp2.000 di section SA-MP', p.basic > 0, `${p.basic} kemunculan`);
check('harga lama Rp5.000 tidak ada di SA-MP', p.oldBasic === 0, `${p.oldBasic} kemunculan`);
check('Basic tampil Rp2.000 di tabel Pricing', p.pricing > 0, `${p.pricing} kemunculan`);
check('harga lama Rp5.000 tidak ada di Pricing', p.pricingOld === 0, `${p.pricingOld} kemunculan`);

/* ---- Fokus saat scroll ---- */
console.log('\n=== Fokus saat scroll ===');
await browser.evaluate(`document.documentElement.style.scrollBehavior = 'auto'; true`);

/* Scroll naik dulu supaya pengukuran mulai dari posisi paling atas. */
await browser.evaluate(`window.scrollTo(0, 0); true`);
await new Promise((r) => setTimeout(r, 1000));

const progressStart = await browser.evaluate(`JSON.stringify({
  now: Number(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')),
})`);
const pr0 = JSON.parse(progressStart);
check('progress bar ada di navbar', Number.isFinite(pr0.now), `aria-valuenow=${pr0.now}%`);
check('progress bar 0% di paling atas', pr0.now === 0, `${pr0.now}%`);

/* Scroll naik-turun bertahap seperti user sungguhan, supaya tiap
   section sempat masuk viewport (IntersectionObserver terpicu).
   Langkah WAJIB lebih kecil dari tinggi viewport, kalau tidak ada
   konten yang ter-skip dan tidak pernah ter-fokus. */
const step = await browser.evaluate(`Math.max(150, Math.floor(window.innerHeight * 0.6))`);
const total = await browser.evaluate(`document.documentElement.scrollHeight`);
for (let y = 0; y <= total + step; y += step) {
  await browser.evaluate(`window.scrollTo(0, ${y}); true`);
  await new Promise((r) => setTimeout(r, 110));
}
await browser.evaluate(`window.scrollTo(0, document.documentElement.scrollHeight); true`);
await new Promise((r) => setTimeout(r, 1200));

const progressEnd = await browser.evaluate(`JSON.stringify({
  now: Number(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')),
  focused: [...document.querySelectorAll('[data-focused]')].map((s) => s.id),
  revealedIn: document.querySelectorAll('[data-reveal="in"]').length,
  revealedOut: document.querySelectorAll('[data-reveal="out"]').length,
  totalReveal: document.querySelectorAll('[data-reveal]').length,
})`);
const pr1 = JSON.parse(progressEnd);
check('progress bar bergerak ke bawah halaman', pr1.now > pr0.now, `${pr0.now}% -> ${pr1.now}%`);
check('progress bar mencapai 100% di akhir', pr1.now === 100, `${pr1.now}%`);
check('section yang difokuskan terdeteksi', pr1.focused.length >= 1, pr1.focused.join(', '));
check(
  'semua konten ter-fokus setelah scroll penuh',
  pr1.revealedOut === 0,
  `${pr1.revealedIn}/${pr1.totalReveal} tampil`,
);

/* Reveal harus beranimasi masuk, bukan langsung tampil semua. */
await browser.goto(TARGET);
await browser.setViewport({ width: 1440, height: 900, mobile: false });
await new Promise((r) => setTimeout(r, 1200));
const revealTop = await browser.evaluate(`JSON.stringify({
  inView: [...document.querySelectorAll('[data-reveal]')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }).length,
  total: document.querySelectorAll('[data-reveal]').length,
})`);
const rt = JSON.parse(revealTop);
check(
  'hanya konten di layar yang ter-fokus duluan',
  rt.inView < rt.total,
  `${rt.inView} dari ${rt.total} elemen terlihat di viewport`,
);

/* ---- Brand: logo & favicon dengan fallback aman ---- */
console.log('\n=== Brand (logo & favicon) ===');
const brand = await browser.evaluate(`JSON.stringify({
  logoImgs: [...document.querySelectorAll('header img, footer img')].map((i) => ({
    src: i.getAttribute('src'),
    naturalW: i.naturalWidth,
    naturalH: i.naturalHeight,
    renderW: Math.round(i.getBoundingClientRect().width),
    renderH: Math.round(i.getBoundingClientRect().height),
    alt: i.getAttribute('alt'),
  })),
  wordmark: [...document.querySelectorAll('header span, footer span')]
    .filter((s) => s.textContent.trim() === 'APISZ')
    .length,
  storeName: [...document.querySelectorAll('header span, footer span')]
    .filter((s) => s.textContent.trim() === 'STORE')
    .length,
  faviconHref: document.querySelector('link[rel~="icon"]')?.getAttribute('href') ?? null,
})`);
const br = JSON.parse(brand);
/* Branding custom ADA kalau file-nya benar-benar gambar.
   Jangan cuma andalkan status 200: Vite dev server menjawab 200 dengan
   index.html (SPA fallback) untuk path yang tidak ada. */
const withImage = await browser.evaluate(`(async () => {
  try {
    const res = await fetch('/brand/logo.png', { method: 'HEAD' });
    return res.ok && (res.headers.get('content-type') || '').startsWith('image/');
  } catch { return false; }
})()`, { awaitPromise: true });
br.customExists = withImage;
const img = br.logoImgs[0] ?? null;

if (br.customExists) {
  check('logo memuat gambar dari /brand', Boolean(img), img ? img.src : 'tidak ada <img>');
  /* Rasio asli 223x100 = 2.23. Kalau dipaksakan kotak, logo jadi kecil. */
  if (img) {
    const naturalRatio = img.naturalW / img.naturalH;
    const renderRatio = img.renderW / img.renderH;
    check(
      'rasio logo terjaga (tidak dipaksa kotak)',
      Math.abs(naturalRatio - renderRatio) < 0.05,
      `natural ${naturalRatio.toFixed(2)} vs render ${renderRatio.toFixed(2)}`,
    );
    check('tinggi logo sesuai desain', img.renderH > 0 && img.renderH <= 60, `${img.renderH}px`);
    check('logo punya alt untuk screen reader', Boolean(img.alt), `"${img.alt}"`);
  }
  /* showName: false -> teks nama harus TIDAK ada. */
  check('teks nama disembunyikan (showName: false)', br.wordmark === 0 && br.storeName === 0, `${br.wordmark} "APISZ", ${br.storeName} "STORE"`);
  check('favicon memakai file custom', br.faviconHref === '/brand/favicon.png', `"${br.faviconHref}"`);
} else {
  check('logo jatuh ke wordmark teks (file belum ada)', br.logoImgs.length === 0 && br.wordmark > 0, `${br.wordmark} "APISZ"`);
  check('nama store tetap tampil', br.storeName > 0, `${br.storeName} "STORE"`);
  check('favicon tetap bawaan (tidak 404)', br.faviconHref === '/favicon.svg', `"${br.faviconHref}"`);
  const head = await fetch(TARGET.replace(/\/$/, '') + '/favicon.svg', { method: 'HEAD' });
  check('favicon bawaan bisa diakses', head.ok, `HTTP ${head.status}`);
}

await browser.close();
console.log(`\n${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
