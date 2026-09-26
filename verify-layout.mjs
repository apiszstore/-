/**
 * Verifikasi layout APISZ STORE: overflow horizontal, teks terpotong, dan
 * jumlah kolom grid — di dark dan light mode, beberapa lebar layar, semua route.
 *
 * Jalankan: npm run verify
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9226;
const TARGET = process.env.TARGET || 'http://localhost:8080/';
const ROUTES = ['/#/', '/#/products/', '/#/pricing/', '/#/showcase/', '/#/testimonials/', '/#/faq/', '/#/contact/'];

const VIEWPORTS = [
  { name: '360', width: 360, height: 800, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: true },
  { name: '1024', width: 1024, height: 768, mobile: false },
  { name: '1440', width: 1440, height: 900, mobile: false },
  { name: '1920', width: 1920, height: 1080, mobile: false },
];

const edge = spawn(
  EDGE,
  ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
   `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}\\opencode\\edge-verify`, 'about:blank'],
  { stdio: 'ignore' },
);

async function findTarget() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find((t) => t.type === 'page');
      if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch { /* belum siap */ }
    await sleep(300);
  }
  throw new Error('CDP tidak merespons');
}

const ws = new WebSocket(await findTarget());
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? {}); pending.delete(m.id); }
});
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

function send(method, params = {}) {
  id += 1;
  return new Promise((res) => { pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
}
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value;

const PROBE = String.raw`(() => {
  const doc = document.documentElement;
  const overflowPx = Math.max(0, doc.scrollWidth - doc.clientWidth);

  // Elemen yang keluar viewport tanpa ancestor yang meng-clip-nya.
  const isClipped = (el) => {
    let p = el.parentElement;
    while (p && p !== document.body) {
      const o = getComputedStyle(p);
      if (o.overflow !== 'visible' || o.overflowX !== 'visible') return true;
      p = p.parentElement;
    }
    return false;
  };
  const bleeders = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > doc.clientWidth + 2 || r.left < -2) && !isClipped(el)) {
      bleeders.push(String(el.className || el.tagName).slice(0, 40));
    }
  });

  // Teks yang dipotong di dalam kotaknya sendiri.
  const clippedText = [];
  document.querySelectorAll('h1, h2, h3, p, span, button, a, strong, small, code').forEach((el) => {
    if (el.clientWidth <= 0) return;
    if (el.scrollWidth <= el.clientWidth + 2) return;
    const o = getComputedStyle(el);
    if (o.overflow !== 'visible' || o.textOverflow === 'ellipsis') return;
    clippedText.push(String(el.className || el.tagName).slice(0, 40));
  });

  const cols = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).gridTemplateColumns.split(' ').length : 0;
  };
  const shown = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    return getComputedStyle(el).display !== 'none';
  };

  return JSON.stringify({
    w: doc.clientWidth,
    overflowPx,
    bleeders: [...new Set(bleeders)].slice(0, 4),
    clippedText: [...new Set(clippedText)].slice(0, 4),
    colsProduct: cols('.grid--products'),
    colsService: cols('.services .grid--3'),
    colsHero: cols('.hero__inner'),
    burger: shown('.navbar__burger'),
    links: shown('.navbar__links'),
    theme: document.documentElement.dataset.theme,
    sections: document.querySelectorAll('main section').length,
  });
})()`;

await send('Page.enable');
let failed = 0;
let checks = 0;
const gridSeen = new Set();

console.log(`TARGET ${TARGET}\n`);
const head = ['viewport', 'theme', 'ovf', 'bleed', 'clip', 'hero', 'svc', 'prod', 'nav'];
console.log(head.map((h, i) => h.padEnd([10, 7, 5, 6, 6, 5, 5, 5, 12][i])).join(''));

for (const [ri, route] of ROUTES.entries()) {
  console.log(`\n--- ${route} ---`);
  await send('Page.navigate', { url: TARGET + (TARGET.includes('?') ? '&' : '?') + 'r=' + ri + route });
  await sleep(2600);

  for (const vp of VIEWPORTS) {
    await send('Emulation.setDeviceMetricsOverride', { ...vp, deviceScaleFactor: 1 });
    for (const theme of ['dark', 'light']) {
      await evaluate(`localStorage.setItem('apisz-theme','${theme}');document.documentElement.dataset.theme='${theme}';`);
      await sleep(420);
      const m = JSON.parse(await evaluate(PROBE));
      const problems = [];
      if (m.overflowPx > 0) problems.push(`overflow ${m.overflowPx}px`);
      if (m.bleeders.length) problems.push(`meluber: ${m.bleeders.join(', ')}`);
      if (m.clippedText.length) problems.push(`teks: ${m.clippedText.join(', ')}`);
      if (m.burger === m.links) problems.push('navbar tidak konsisten');
      checks += 1;
      if (problems.length) failed += 1;
      if (m.colsProduct) gridSeen.add(`${m.w}:${m.colsProduct}`);
      console.log(
        [
          vp.name.padEnd(10),
          m.theme.padEnd(7),
          String(m.overflowPx).padEnd(5),
          String(m.bleeders.length).padEnd(6),
          String(m.clippedText.length).padEnd(6),
          String(m.colsHero).padEnd(5),
          String(m.colsService).padEnd(5),
          String(m.colsProduct || '-').padEnd(5),
          (m.burger ? 'burger' : 'links') + (problems.length ? '  <-- ' + problems.join(' | ') : ''),
        ].join(''),
      );
    }
  }
}

ws.close();
edge.kill();
console.log(`\nkolom produk per lebar: ${[...gridSeen].sort((a, b) => +a.split(':')[0] - +b.split(':')[0]).map((s) => s.replace(':', 'px -> ')).join(', ')}`);
console.log(failed ? `\n${failed} dari ${checks} kombinasi gagal` : `\nSemua ${checks} kombinasi lolos.`);
process.exit(failed ? 1 : 0);
