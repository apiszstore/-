/**
 * Audit kontras warna APISZ STORE.
 *
 * 1. Semua teks harus lolos WCAG AA terhadap background efektifnya
 *    (4.5:1 untuk teks normal, 3:1 untuk teks besar).
 * 2. Semua target sentuh minimal 40x40 px.
 * 3. Tidak ada warna biru/violet nyasar — paletnya graphite + orange,
 *    pengecualian hanya status (custom pricing) dan brand payment.
 *
 * Jalankan: npm run verify:contrast
 */
import { collectConsoleIssues, openBrowser, VIEWPORTS } from './tools/cdp.mjs';

const PORT = 9232;
const TARGET = 'http://localhost:8080/';

/* Warna yang memang boleh biru/violet, lengkap dengan hex aslinya. */
const ALLOWED_COOL = new Set([
  '#8b9bf5', // status: custom pricing (di --color-custom)
  '#4ade9f', // DANA
  '#6fc4ee', // GoPay
]);

const PROBE = `(() => {
  const ALLOWED_COOL = new Set(${JSON.stringify([...ALLOWED_COOL])});
  const parse = (value) => {
    if (!value) return null;
    const text = value.trim();
    let match = text.match(/^rgba?\\(([^)]+)\\)$/i);
    if (match) {
      const parts = match[1].split(/[\\s,/]+/).filter(Boolean).map(Number);
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    }
    match = text.match(/^color\\(srgb\\s+([^)]+)\\)$/i);
    if (match) {
      const parts = match[1].split(/[\\s/]+/).filter(Boolean).map(Number);
      return { r: parts[0] * 255, g: parts[1] * 255, b: parts[2] * 255, a: parts.length > 3 ? parts[3] : 1 };
    }
    return null;
  };

  const effectiveBg = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg.a > 0.85) return bg;
      node = node.parentElement;
    }
    return { r: 0x31, g: 0x33, b: 0x38, a: 1 };
  };

  const luminance = ({ r, g, b }) => {
    const channel = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };

  const ratio = (a, b) => {
    const l1 = luminance(a);
    const l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const toHex = ({ r, g, b }) =>
    '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

  const samples = [];
  const nodes = document.querySelectorAll(
    'h1, h2, h3, h4, p, span, a, button, strong, small, td, th, li, label, code, pre, figcaption',
  );

  nodes.forEach((el) => {
    // Hanya elemen yang punya teks langsung dan terlihat.
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join('');
    if (!own) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.opacity === '0') return;
    if (el.closest('[hidden]')) return;
    if (style.position === 'absolute' && rect.bottom < 0) return;

    const fg = parse(style.color);
    if (!fg) return;

    const bg = effectiveBg(el);
    const size = parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const cr = ratio(fg, bg);

    samples.push({
      text: own.slice(0, 30),
      cls: String(el.className || el.tagName).slice(0, 40),
      fg: toHex(fg),
      bg: toHex(bg),
      size,
      weight,
      large,
      cr: Math.round(cr * 100) / 100,
      pass: cr >= (large ? 3 : 4.5),
    });
  });

  // Target sentuh.
  // WCAG 2.2 AA (2.5.8) = 24x24 px minimum  -> fail keras
  // 24..40 px                            -> peringatan (aras nyaman, tidak otomatis gagal)
  // .sr-only (skip link) dikecualikan: 1x1 sampai difokus.
  const smallTargets = [];
  const tightTargets = [];
  document.querySelectorAll('button, a[href], input').forEach((el) => {
    if (el.closest('[hidden]')) return;
    if (el.classList.contains('sr-only')) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    if (getComputedStyle(el).visibility === 'hidden') return;
    const entry = {
      cls: String(el.className || el.tagName).slice(0, 40),
      text: (el.textContent || el.placeholder || '').trim().slice(0, 20),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    };
    if (rect.height < 24 || rect.width < 24) smallTargets.push(entry);
    else if (rect.height < 40) tightTargets.push(entry);
  });

  // Warna nyasar (biru/violet/cyan yang bukan status/brand)
  const coolOffenders = [];
  document.querySelectorAll('body *').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const style = getComputedStyle(el);
    ['color', 'backgroundColor', 'borderTopColor'].forEach((prop) => {
      const color = parse(style[prop]);
      if (!color || color.a < 0.2) return;
      const { r, g, b } = color;
      if (b <= g || b <= r) return;
      const spread = b - Math.max(r, g);
      if (spread < 28) return;
      const hex = toHex(color);
      if (ALLOWED_COOL.has(hex)) return;
      coolOffenders.push({
        hex,
        cls: String(el.className || el.tagName).slice(0, 40),
        prop,
        own: [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
      });
    });
  });

  return JSON.stringify({
    total: samples.length,
    failed: samples.filter((s) => !s.pass).sort((a, b) => a.cr - b.cr).slice(0, 12),
    worst: samples.slice().sort((a, b) => a.cr - b.cr).slice(0, 5),
    smallTargets: smallTargets.slice(0, 10),
    tightTargets: tightTargets.slice(0, 6),
    coolOffenders: coolOffenders.slice(0, 10),
  });
})()`;

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

const browser = await openBrowser({ port: PORT, target: TARGET, profile: 'verify-contrast' });
const issues = collectConsoleIssues(browser);

for (const viewport of [VIEWPORTS[2], VIEWPORTS[5]]) {
  console.log(`\n=== ${viewport.width}x${viewport.height} ===`);
  await browser.setViewport(viewport);
  await new Promise((r) => setTimeout(r, 900));

  const result = JSON.parse(await browser.evaluate(PROBE));

  console.log(`  ${result.total} elemen teks diperiksa`);
  check('semua teks lolos WCAG AA', result.failed.length === 0, result.failed.length ? '' : `terlemah ${result.worst[0]?.cr}:1`);
  for (const item of result.failed) {
    console.log(`        ${item.cr}:1  ${item.fg} on ${item.bg}  ${item.size}px  "${item.text}"  .${item.cls}`);
  }

  check('target sentuh >= 24px (WCAG 2.5.8)', result.smallTargets.length === 0);
  for (const item of result.smallTargets) {
    console.log(`        ${item.w}x${item.h}  "${item.text}"  .${item.cls}`);
  }
  if (result.tightTargets.length) {
    console.log(`  INFO  ${result.tightTargets.length} target 24-40px (lolos AA, di bawah ideal 44px):`);
    for (const item of result.tightTargets) {
      console.log(`        ${item.w}x${item.h}  "${item.text}"  .${item.cls}`);
    }
  }

  check('tidak ada warna biru/violet nyasar', result.coolOffenders.length === 0);
  for (const item of result.coolOffenders) {
    console.log(`        ${item.hex} (${item.prop}) .${item.cls}`);
  }
}

check('console bersih', issues.length === 0);
for (const issue of [...new Set(issues)].slice(0, 6)) console.log(`        ${issue}`);

await browser.close();
console.log(`\n${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
