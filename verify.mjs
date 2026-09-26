/**
 * Verifikasi layout & interaksi APISZ STORE.
 *
 * Cek:
 *  1. Tidak ada error/warning React di console
 *  2. Semua section yang diharapkan benar-benar ter-render
 *  3. Tidak ada horizontal overflow di 7 ukuran layar
 *  4. Tidak ada elemen yang keluar viewport
 *  5. Tidak ada teks yang terpotong
 *  6. Tombol selalu masuk layar (tidak keluar area klik)
 *  7. Menu mobile: muat, bisa diklik, menutup dengan benar
 *  8. Modal: tidak keluar layar, bisa ditutup, isinya bisa di-scroll
 *
 * Jalankan: npm run verify
 */
import { collectConsoleIssues, openBrowser, VIEWPORTS } from './tools/cdp.mjs';

const PORT = 9231;
const TARGET = 'http://localhost:8080/';

const EXPECTED_SECTIONS = [
  'home',
  'services',
  'samp',
  'other',
  'products',
  'pricing',
  'showcase',
  'testimonials',
  'order',
  'payment',
  'faq',
];

let pass = 0;
let fail = 0;
const failures = [];

function check(label, condition, detail = '') {
  if (condition) {
    pass += 1;
    console.log(`  OK    ${label}${detail ? `  ${detail}` : ''}`);
  } else {
    fail += 1;
    failures.push(`${label} ${detail}`);
    console.log(`  GAGAL ${label}${detail ? `  ${detail}` : ''}`);
  }
}

const PROBE = `(() => {
  const doc = document.documentElement;
  const vw = doc.clientWidth;

  const isClipped = (el) => {
    let parent = el.parentElement;
    while (parent && parent !== document.body) {
      const style = getComputedStyle(parent);
      if (style.overflow !== 'visible' || style.overflowX !== 'visible') return true;
      parent = parent.parentElement;
    }
    return false;
  };

  const bleeders = [];
  document.querySelectorAll('body *').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    if (rect.right > vw + 2 || rect.left < -2) {
      if (!isClipped(el)) bleeders.push(String(el.className || el.tagName).slice(0, 46));
    }
  });

  const clippedText = [];
  document.querySelectorAll('h1, h2, h3, h4, p, span, a, button, strong, small, td, th, li').forEach((el) => {
    if (el.clientWidth <= 0) return;
    if (el.scrollWidth <= el.clientWidth + 2) return;
    const style = getComputedStyle(el);
    if (style.overflow !== 'visible' || style.textOverflow === 'ellipsis') return;
    clippedText.push(String(el.className || el.tagName).slice(0, 46) + ' :: ' + el.textContent.trim().slice(0, 24));
  });

  // Tombol harus punya area klik dan tidak keluar layar.
  // Elemen di dalam container yang memang bisa di-scroll (filter, gallery)
  // tidak dianggap bug, asalkan container itu memang overflow-auto.
  const badButtons = [];
  document.querySelectorAll('button, a[href]').forEach((el) => {
    if (el.closest('[hidden]')) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    if (getComputedStyle(el).visibility === 'hidden') return;
    if (rect.right > vw + 2 || rect.left < -2) {
      if (isClipped(el)) return;
      badButtons.push(String(el.className || el.tagName).slice(0, 46));
    }
  });

  const sectionIds = [...document.querySelectorAll('main section[id]')].map((s) => s.id);

  return JSON.stringify({
    vw,
    scrollW: doc.scrollWidth,
    overflowPx: Math.max(0, doc.scrollWidth - doc.clientWidth),
    bleeders: [...new Set(bleeders)].slice(0, 5),
    clippedText: [...new Set(clippedText)].slice(0, 5),
    badButtons: [...new Set(badButtons)].slice(0, 5),
    sectionIds,
    burger: Boolean(document.querySelector('button[aria-controls="mobile-menu"]')?.offsetParent),
    docNav: Boolean(document.querySelector('nav[aria-label="Navigasi utama"]')?.offsetParent),
  });
})()`;

const browser = await openBrowser({ port: PORT, target: TARGET, profile: 'verify-main' });
const issues = collectConsoleIssues(browser);

/* ---------- 1. Smoke: section ter-render ---------- */
console.log('\n=== Struktur halaman ===');
let state = JSON.parse(await browser.evaluate(PROBE));
for (const id of EXPECTED_SECTIONS) {
  check(`section #${id} ada`, state.sectionIds.includes(id));
}
check('tidak ada horizontal overflow', state.overflowPx === 0, `overflow=${state.overflowPx}px`);

/* ---------- 2. Layout di semua viewport ---------- */
console.log('\n=== Layout per ukuran layar ===');
for (const viewport of VIEWPORTS) {
  await browser.setViewport(viewport);
  await browser.evaluate('window.scrollTo(0, 0)');
  await new Promise((r) => setTimeout(r, 700));

  const result = JSON.parse(await browser.evaluate(PROBE));
  const problems = [];

  if (result.overflowPx > 0) problems.push(`overflow ${result.overflowPx}px`);
  if (result.bleeders.length) problems.push(`keluar layar: ${result.bleeders.join(', ')}`);
  if (result.clippedText.length) problems.push(`teks: ${result.clippedText.join(' | ')}`);
  if (result.badButtons.length) problems.push(`tombol: ${result.badButtons.join(', ')}`);
  if (viewport.width < 1024 && !result.burger) problems.push('hamburger tidak muncul');
  if (viewport.width < 1024 && result.docNav) problems.push('nav desktop masih tampil');
  if (viewport.width >= 1024 && !result.docNav) problems.push('nav desktop hilang');
  if (viewport.width >= 1024 && result.burger) problems.push('hamburger tampil di desktop');

  check(
    `${viewport.width}x${viewport.height}`,
    problems.length === 0,
    problems.length ? problems.join(' | ') : `nav=${result.docNav ? 'desktop' : 'burger'}`,
  );
}

/* ---------- 3. Menu mobile ---------- */
console.log('\n=== Menu mobile (390x667) ===');
await browser.setViewport({ width: 390, height: 667, mobile: true });
await browser.evaluate('window.scrollTo(0, 0)');
await new Promise((r) => setTimeout(r, 500));

const readMenu = () =>
  browser.evaluate(`JSON.stringify((() => {
    const panel = document.getElementById('mobile-menu');
    const burger = document.querySelector('button[aria-controls="mobile-menu"]');
    const rect = panel.getBoundingClientRect();
    const links = [...panel.querySelectorAll('nav button')];
    return {
      expanded: burger.getAttribute('aria-expanded'),
      label: burger.getAttribute('aria-label'),
      panelH: Math.round(rect.height),
      panelScrollH: panel.scrollHeight,
      panelClientH: panel.clientHeight,
      canScroll: panel.scrollHeight > panel.clientHeight + 1,
      links: links.length,
      lastLinkBottom: links.length ? Math.round(links[links.length - 1].getBoundingClientRect().bottom) : null,
      bodyOverflow: document.body.style.overflow,
    };
  })())`);

let menu = JSON.parse(await readMenu());
check('tertutup saat load', menu.expanded === 'false', `label="${menu.label}"`);

await browser.evaluate(`document.querySelector('button[aria-controls="mobile-menu"]').click()`);
await new Promise((r) => setTimeout(r, 800));
menu = JSON.parse(await readMenu());
check('terbuka setelah klik', menu.expanded === 'true', `label="${menu.label}"`);
check('semua 8 menu di dalam panel', menu.links === 8, `${menu.links} item`);
check(
  'isi panel terjangkau (tidak ada yang tenggelam)',
  !menu.canScroll || menu.lastLinkBottom <= 667,
  menu.canScroll
    ? `perlu scroll ${menu.panelScrollH - menu.panelClientH}px, item terakhir y=${menu.lastLinkBottom}`
    : 'muat tanpa scroll',
);
check('body terkunci saat terbuka', menu.bodyOverflow === 'hidden', `"${menu.bodyOverflow}"`);

await browser.evaluate(`document.querySelector('button[aria-controls="mobile-menu"]').click()`);
await new Promise((r) => setTimeout(r, 800));
menu = JSON.parse(await readMenu());
check('menutup lagi', menu.expanded === 'false', `label="${menu.label}"`);
check('body scroll normal lagi', menu.bodyOverflow === '', `"${menu.bodyOverflow}"`);

/* ---------- 4. Modal produk ---------- */
console.log('\n=== Modal & tombol order (390x667) ===');
await browser.goto(`${TARGET}?modal=1`);
await browser.setViewport({ width: 390, height: 667, mobile: true });
await new Promise((r) => setTimeout(r, 900));

// Katalog kosong → modal produk tidak bisa dibuka, tapi modal service bisa.
const openedService = await browser.evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'View Details');
  if (!btn) return false;
  btn.click();
  return true;
})()`);
await new Promise((r) => setTimeout(r, 900));

if (openedService) {
  const modal = JSON.parse(await browser.evaluate(`JSON.stringify((() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return { found: false };
    const rect = dialog.getBoundingClientRect();
    const scroller = dialog.querySelector('div');
    return {
      found: true,
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
      vw: document.documentElement.clientWidth,
      top: Math.round(rect.top),
      height: Math.round(rect.height),
      hasOrder: Boolean([...dialog.querySelectorAll('button')].find((b) => b.textContent.includes('Order Now'))),
      bodyOverflow: document.body.style.overflow,
      scrollable: scroller ? scroller.scrollHeight > scroller.clientHeight : false,
    };
  })())`));

  check('modal terbuka', modal.found);
  check('modal tidak keluar layar', modal.left >= -1 && modal.right <= modal.vw + 1, `x ${modal.left}..${modal.right} (vw ${modal.vw})`);
  check('modal muat di tinggi layar', modal.height <= 667, `tinggi ${modal.height}px`);
  check('modal punya tombol Order Now', modal.hasOrder);
  check('body terkunci saat modal terbuka', modal.bodyOverflow === 'hidden', `"${modal.bodyOverflow}"`);

  await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await new Promise((r) => setTimeout(r, 700));
  const stillOpen = await browser.evaluate(`Boolean(document.querySelector('[role="dialog"]'))`);
  check('Escape menutup modal', stillOpen === false);
  const restored = await browser.evaluate(`document.body.style.overflow`);
  check('body scroll lagi setelah modal ditutup', restored === '', `"${restored}"`);
} else {
  check('tombol View Details tersedia', false, 'tidak ditemukan');
}

/* ---------- 5. Console bersih ---------- */
console.log('\n=== Console ===');
check('tidak ada error/warning', issues.length === 0, issues.length ? '' : 'bersih');
for (const issue of [...new Set(issues)].slice(0, 12)) console.log(`        ${issue}`);

await browser.close();

console.log(`\n${pass} lulus, ${fail} gagal`);
if (fail) {
  console.log('\nGagal:');
  failures.forEach((item) => console.log(`  - ${item}`));
}
process.exit(fail ? 1 : 0);
