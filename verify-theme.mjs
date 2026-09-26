/** Uji interaksi theme toggle: klik sungguhan, cek atribut, storage, dan reload. */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9228;
const TARGET = 'http://localhost:8080/';

const edge = spawn(EDGE, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\opencode\\edge-toggle`, 'about:blank'], { stdio: 'ignore' });

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
let id = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? {}); pending.delete(m.id); } });
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const send = (m, p = {}) => { id += 1; return new Promise((res) => { pending.set(id, res); ws.send(JSON.stringify({ id, method: m, params: p })); }); };
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true })).result?.value;

const state = String.raw`JSON.stringify({
  attr: document.documentElement.dataset.theme,
  stored: localStorage.getItem('apisz-theme'),
  meta: document.querySelector('meta[name="theme-color"]').getAttribute('content'),
  bodyBg: getComputedStyle(document.body).backgroundColor,
  btnState: (document.querySelector('.theme-toggle')||{}).dataset ? document.querySelector('.theme-toggle').dataset.themeState : 'NO-BTN',
  pressed: document.querySelector('.theme-toggle') ? document.querySelector('.theme-toggle').getAttribute('aria-pressed') : 'NO-BTN',
  label: document.querySelector('.theme-toggle') ? document.querySelector('.theme-toggle').getAttribute('aria-label') : 'NO-BTN',
  thumbX: (() => { const t = document.querySelector('.theme-toggle__thumb'); return t ? Math.round(t.getBoundingClientRect().left) : null; })(),
  sunOpacity: (() => { const s = document.querySelector('.theme-toggle__icon--sun'); return s ? getComputedStyle(s).opacity : null; })(),
  moonOpacity: (() => { const s = document.querySelector('.theme-toggle__icon--moon'); return s ? getComputedStyle(s).opacity : null; })(),
})`;

let pass = 0, fail = 0;
const check = (label, cond, detail) => {
  if (cond) { pass += 1; console.log(`  OK   ${label}  ${detail ?? ''}`); }
  else { fail += 1; console.log(`  GAGAL ${label}  ${detail ?? ''}`); }
};

await send('Page.enable');
await send('Page.navigate', { url: TARGET });
await sleep(3200);

console.log('1. Default (tanpa preferensi tersimpan)');
await ev(`localStorage.removeItem('apisz-theme')`);
await send('Page.navigate', { url: TARGET + '?fresh=1' });
await sleep(2600);
let s = JSON.parse(await ev(state));
console.log('   ', await ev(state));
check('tombol ada', s.btnState !== 'NO-BTN', `state=${s.btnState}`);
check('aria-label sesuai', /terang|gelap/.test(s.label), `"${s.label}"`);

console.log('\n2. Klik toggle (dark -> light)');
await ev(`document.querySelector('.theme-toggle').click()`);
await sleep(700);
s = JSON.parse(await ev(state));
check('attr berubah ke light', s.attr === 'light', `attr=${s.attr}`);
check('body berubah ke terang', s.bodyBg === 'rgb(242, 240, 235)', s.bodyBg);
check('tersimpan di localStorage', s.stored === 'light', `stored=${s.stored}`);
check('theme-color meta ikut', s.meta === '#f2f0eb', s.meta);
check('aria-pressed true', s.pressed === 'true', `pressed=${s.pressed}`);
check('ikon bulan tampil', Number(s.moonOpacity) > 0.9 && Number(s.sunOpacity) < 0.1, `sun=${s.sunOpacity} moon=${s.moonOpacity}`);

console.log('\n3. Klik lagi (light -> dark)');
await ev(`document.querySelector('.theme-toggle').click()`);
await sleep(700);
s = JSON.parse(await ev(state));
check('attr kembali dark', s.attr === 'dark', `attr=${s.attr}`);
check('body gelap lagi', s.bodyBg === 'rgb(10, 10, 11)', s.bodyBg);

console.log('\n4. Toggle di light, lalu reload (persistensi + anti-FOUC)');
await ev(`document.querySelector('.theme-toggle').click()`);
await sleep(600);
const before = JSON.parse(await ev(state));
await send('Page.navigate', { url: TARGET + '?fresh=2' });
await sleep(2600);
s = JSON.parse(await ev(state));
check('setelah reload tetap light', s.attr === 'light', `attr=${s.attr} (sebelum reload ${before.attr})`);
check('tidak ada kedipan (langsung light)', s.bodyBg === 'rgb(242, 240, 235)', s.bodyBg);

console.log('\n5. Ikut preferensi sistem saat belum pernah dipilih');
await ev(`localStorage.removeItem('apisz-theme')`);
await send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'prefers-color-scheme', value: 'light' }] });
await sleep(400);
await send('Page.navigate', { url: TARGET + '?fresh=3' });
await sleep(2600);
s = JSON.parse(await ev(state));
check('sistem light -> situs light', s.attr === 'light', `attr=${s.attr} matchMedia=${await ev("window.matchMedia('(prefers-color-scheme: light)').matches")}`);

await send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
await sleep(500);
const mm = await ev("window.matchMedia('(prefers-color-scheme: light)').matches");
await send('Page.navigate', { url: TARGET + '?fresh=4' });
await sleep(2600);
s = JSON.parse(await ev(state));
check('sistem dark -> situs dark', s.attr === 'dark', `attr=${s.attr} matchMediaLight=${mm}`);

console.log('\n5b. Ganti tema OS saat halaman terbuka (tanpa reload)');
await ev(`localStorage.removeItem('apisz-theme')`);
await send('Page.navigate', { url: TARGET + '?fresh=5' });
await sleep(2400);
const before5 = JSON.parse(await ev(state));
await send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'prefers-color-scheme', value: 'light' }] });
await sleep(900);
const after5 = JSON.parse(await ev(state));
check('OS light -> situs ikut light', after5.attr === 'light', `${before5.attr} -> ${after5.attr}`);
await send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
await sleep(900);
const after6 = JSON.parse(await ev(state));
check('OS ganti dark -> situs ikut dark', after6.attr === 'dark', `${after5.attr} -> ${after6.attr}`);

console.log('\n6. Tombol bisa dipakai dari keyboard');
await ev(`document.querySelector('.theme-toggle').focus()`);
const focused = await ev(`document.activeElement.className`);
check('fokus reachable', String(focused).includes('theme-toggle'), `activeElement=${focused}`);

ws.close(); edge.kill();
console.log(`\n${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
