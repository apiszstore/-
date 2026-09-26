/** Diagnosis menu mobile: apakah opsi menu tenggelam / tertimpa di layar pendek? */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9229;

const edge = spawn(EDGE, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\opencode\\edge-menu`, 'about:blank'], { stdio: 'ignore' });

async function findTarget() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find((t) => t.type === 'page');
      if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch { /* belum siap */ }
    await sleep(300);
  }
  throw new Error('CDP gagal');
}

const ws = new WebSocket(await findTarget());
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? {}); pending.delete(m.id); }
});
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const send = (method, params = {}) => { id += 1; return new Promise((res) => { pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); }); };
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value;

const PROBE = `(() => {
  const q = (s) => document.querySelector(s);
  const panel = q('.navbar__mobile');
  const header = q('.navbar');
  const links = [...document.querySelectorAll('.navbar__mobile-link')];
  const order = q('.navbar__mobile-order');
  const note = q('.navbar__mobile-note');
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const box = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { top: Math.round(b.top), bottom: Math.round(b.bottom), w: Math.round(b.width) };
  };
  const blockers = links.map((el) => {
    const b = el.getBoundingClientRect();
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    const inView = cy >= 0 && cy <= innerHeight;
    const hit = inView ? document.elementFromPoint(cx, cy) : null;
    return {
      label: el.textContent.trim().slice(0, 12),
      cy: Math.round(cy),
      inView,
      ok: inView ? Boolean(hit && (hit === el || el.contains(hit))) : false,
      hitEl: hit ? String(hit.className || hit.tagName).slice(0, 46) : 'di luar layar',
    };
  });
  return JSON.stringify({
    vw: innerWidth,
    vh: innerHeight,
    header: { ...box(header), z: cs(header).zIndex, pos: cs(header).position, navH: getComputedStyle(document.documentElement).getPropertyValue('--nav-h') },
    panel: { ...box(panel), z: cs(panel).zIndex, vis: cs(panel).visibility, op: cs(panel).opacity, overflowY: cs(panel).overflowY, scrollH: panel.scrollHeight, clientH: panel.clientHeight, canScroll: panel.scrollHeight > panel.clientHeight },
    links: links.map((el) => ({ t: el.textContent.trim().slice(0, 12), ...box(el) })),
    order: box(order),
    note: box(note),
    bodyOverflow: document.body.style.overflow,
    blockers,
  });
})()`;

await send('Page.enable');

for (const vp of [{ w: 320, h: 568 }, { w: 360, h: 640 }, { w: 390, h: 667 }, { w: 390, h: 844 }, { w: 412, h: 915 }, { w: 844, h: 390 }]) {
  await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: `http://localhost:8080/?m=${vp.w}x${vp.h}` });
  await sleep(2800);
  await ev(`document.querySelector('.navbar__burger').click()`);
  await sleep(1000);

  const m = JSON.parse(await ev(PROBE));
  const bad = m.blockers.filter((b) => !b.ok);
  const last = m.links[m.links.length - 1];

  console.log(`viewport ${m.vw}x${m.vh}`);
  console.log(`  header    h=${m.header.bottom}  --nav-h=${m.header.navH.trim()}  pos=${m.header.pos} z=${m.header.z}  |  panel top=${m.panel.top} z=${m.panel.z} ${m.panel.vis}`);
  console.log(`  konten    ${m.panel.scrollH}px di area ${m.panel.clientH}px -> ${m.panel.canScroll ? 'HARUS DI-SCROLL' : 'muat'}   bodyOverflow="${m.bodyOverflow}"`);
  console.log(`  link terakhir "${last.t}"  y ${last.top}..${last.bottom}${last.bottom > m.vh ? '   <<< DI BAWAH LAYAR' : ''}`);
  console.log(`  tombol order               y ${m.order.top}..${m.order.bottom}${m.order.top >= m.vh ? '   <<< DI BAWAH LAYAR' : ''}`);
  console.log(`  catatan Discord            y ${m.note.top}..${m.note.bottom}${m.note.top >= m.vh ? '   <<< DI BAWAH LAYAR' : ''}`);
  console.log(`  link bisa diklik           ${m.blockers.length - bad.length}/${m.blockers.length}`);
  if (bad.length) console.log(`  TERTIMPA: ` + bad.map((b) => `${b.label}@y${b.cy} <- ${b.hitEl}`).join('; '));

  // Uji scroll:_scroll panel ke bawah, semua isi harus bisa dijangkau.
  const scrolled = JSON.parse(await ev(`(() => {
    const p = document.querySelector('.navbar__mobile');
    p.scrollTop = p.scrollHeight;
    const note = document.querySelector('.navbar__mobile-note');
    const order = document.querySelector('.navbar__mobile-order');
    const nb = note ? note.getBoundingClientRect() : null;
    return JSON.stringify({
      scrollTop: Math.round(p.scrollTop),
      orderVisible: order ? order.getBoundingClientRect().bottom <= innerHeight + 1 : 'note disembunyikan',
      noteHidden: note ? getComputedStyle(note).display === 'none' : true,
      noteBottom: nb ? Math.round(nb.bottom) : null,
      fitsNow: nb ? nb.bottom <= innerHeight + 1 : true,
    });
  })()`));
  console.log(`  scrollKeBawah             scrollTop=${scrolled.scrollTop}  orderTampak=${scrolled.orderVisible}  catatan disembunyikan=${scrolled.noteHidden}  catatanY=${scrolled.noteBottom}  semua terjangkau=${scrolled.fitsNow}`);
  console.log('');
}

ws.close();
edge.kill();

/* ---------- Uji interaksi: aria-label dinamis + Escape menutup menu ---------- */
const edge2 = spawn(EDGE, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\opencode\\edge-menu2`, 'about:blank'], { stdio: 'ignore' });
async function findTarget2() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find((t) => t.type === 'page');
      if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch { /* belum siap */ }
    await sleep(300);
  }
  throw new Error('CDP gagal');
}
const ws2 = new WebSocket(await findTarget2());
let id2 = 0;
const pending2 = new Map();
ws2.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id2 && pending2.has(m.id2)) { pending2.get(m.id2)(m.result ?? {}); pending2.delete(m.id2); }
  if (m.id && pending2.has(m.id)) { pending2.get(m.id)(m.result ?? {}); pending2.delete(m.id); }
});
await new Promise((r) => ws2.addEventListener('open', r, { once: true }));
const send2 = (method, params = {}) => { id2 += 1; return new Promise((res) => { pending2.set(id2, res); ws2.send(JSON.stringify({ id: id2, method, params })); }); };
const ev2 = async (expression) => (await send2('Runtime.evaluate', { expression, returnByValue: true })).result?.value;

let pass = 0, fail = 0;
const check = (label, cond, detail = '') => {
  if (cond) { pass += 1; console.log(`  OK    ${label}  ${detail}`); }
  else { fail += 1; console.log(`  GAGAL ${label}  ${detail}`); }
};
const read = async () => JSON.parse(await ev2(`JSON.stringify({
  open: document.querySelector('.navbar__mobile').classList.contains('is-open'),
  label: document.querySelector('.navbar__burger').getAttribute('aria-label'),
  expanded: document.querySelector('.navbar__burger').getAttribute('aria-expanded'),
  controls: document.querySelector('.navbar__burger').getAttribute('aria-controls'),
  panelId: document.querySelector('.navbar__mobile').id,
  bodyOverflow: document.body.style.overflow,
  vis: getComputedStyle(document.querySelector('.navbar__mobile')).visibility,
})`));

await send2('Page.enable');
await send2('Emulation.setDeviceMetricsOverride', { width: 390, height: 667, deviceScaleFactor: 1, mobile: true });
await send2('Page.navigate', { url: 'http://localhost:8080/?interaksi=1' });
await sleep(2800);

console.log('\n=== Interaksi menu mobile (390x667) ===');
let s = await read();
check('tertutup saat load', s.open === false, `label="${s.label}" expanded=${s.expanded}`);
check('aria-controls menunjuk panel', s.controls === s.panelId, `controls=${s.controls} panelId=${s.panelId}`);
check('label saat tertutup', s.label === 'Buka menu', `"${s.label}"`);

await ev2(`document.querySelector('.navbar__burger').click()`);
await sleep(800);
s = await read();
check('terbuka setelah klik', s.open === true, `vis=${s.vis} bodyOverflow="${s.bodyOverflow}"`);
check('aria-expanded true', s.expanded === 'true', `expanded=${s.expanded}`);
check('label berubah jadi Tutup', s.label === 'Tutup menu', `"${s.label}"`);
check('body terkunci dari scroll', s.bodyOverflow === 'hidden', `"${s.bodyOverflow}"`);

await send2('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await sleep(800);
s = await read();
check('Escape menutup menu', s.open === false, `open=${s.open}`);
check('body scroll lagi', s.bodyOverflow === '', `"${s.bodyOverflow}"`);

// Klik link yang menunjuk route SEDANG AKTIF (Home saat route='/').
// Efek [route] tidak ke-trigger karena route tidak berubah.
await ev2(`document.querySelector('.navbar__burger').click()`);
await sleep(700);
await ev2(`[...document.querySelectorAll('.navbar__mobile-link')].find((a) => a.textContent.trim() === 'Home').click()`);
await sleep(1000);
s = await read();
check('klik link aktif (Home) menutup menu', s.open === false, `open=${s.open} route=${await ev2('location.hash') || '/'}`);

// Klik link non-aktif harus pindah route DAN menutup menu.
await ev2(`document.querySelector('.navbar__burger').click()`);
await sleep(700);
await ev2(`[...document.querySelectorAll('.navbar__mobile-link')].find((a) => a.textContent.trim() === 'Products').click()`);
await sleep(1400);
s = await read();
check('klik link lain pindah route', (await ev2('location.hash')) === '#/products', `hash=${await ev2('location.hash')}`);
check('klik link lain menutup menu', s.open === false, `open=${s.open}`);
check('halaman Products ter-render', (await ev2(`(document.querySelector('h1')||{}).textContent`)) === 'PRODUCTS', `h1=${await ev2(`(document.querySelector('h1')||{}).textContent`)}`);

// Klik logo harus menutup menu.
await ev2(`document.querySelector('.navbar__burger').click()`);
await sleep(700);
await ev2(`document.querySelector('.navbar__brand').click()`);
await sleep(1200);
s = await read();
check('klik logo menutup menu', s.open === false, `open=${s.open} route=${await ev2('location.hash') || '/'}`);

ws2.close();
edge2.kill();
console.log(`\n${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);

