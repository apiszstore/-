/**
 * Audit kontras + hue untuk APISZ STORE di dark dan light mode.
 * Memakai Chrome DevTools Protocol: benar-benar merender, bukan menebak.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9223;
const TARGET = process.argv[2] || 'http://localhost:8080/';

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\opencode\\edge-audit`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function findTarget() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* belum siap */
    }
    await sleep(300);
  }
  throw new Error('CDP tidak merespons');
}

const ws = new WebSocket(await findTarget());
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result ?? {});
    pending.delete(msg.id);
  }
});
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

function send(method, params = {}) {
  id += 1;
  return new Promise((res) => {
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value;

const AUDIT = String.raw`(() => {
  const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const parse = (s) => {
    const m = s.match(/[\d.]+/g);
    return m ? { rgb: [+m[0], +m[1], +m[2]], a: m[3] === undefined ? 1 : +m[3] } : null;
  };
  const over = (fg, bg) => fg.rgb.map((c, i) => c * fg.a + bg[i] * (1 - fg.a));
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };

  // Ekstrak warna dari backgroundImage: rgb/rgba, hex, dan color-mix.
  const TOKEN = new RegExp(
    [
      'color-mix\\(in srgb,\\s*(.+?)\\s+([\\d.]+)%\\s*,\\s*transparent\\)',
      'color\\(srgb\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)(?:\\s*/\\s*([\\d.]+))?\\s*\\)',
      'rgba?\\(([^)]+)\\)',
      '#[0-9a-fA-F]{3,8}',
    ].join('|'),
    'g',
  );
  const gradientStops = (img) => {
    const out = [];
    let m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(img)) !== null) {
      if (m[1] !== undefined) {
        const inner = gradientStops(m[1].trim());
        if (inner.length) out.push({ rgb: inner[inner.length - 1].rgb, a: inner[inner.length - 1].a * (+m[2] / 100) });
      } else if (m[3] !== undefined) {
        // color(srgb r g b / a) -> komponen 0..1
        out.push({
          rgb: [m[3], m[4], m[5]].map((v) => Math.round(parseFloat(v) * 255)),
          a: m[6] === undefined ? 1 : parseFloat(m[6]),
        });
      } else if (m[7] !== undefined) {
        const c = parse(m[7]);
        if (c) out.push(c);
      } else {
        let h = m[0].slice(1);
        if (h.length === 3) h = [...h].map((ch) => ch + ch).join('');
        out.push({
          rgb: [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)],
          a: 1,
        });
      }
    }
    return out;
  };

  // Warna latar efektif, naik sampai elemen root.
  // Elemen ber-gradient punya backgroundColor transparan, jadi color stop
  // terakhir dari gradient ikut dipakai sebagai fallback.
  const bgOf = (el) => {
    let node = el;
    const stack = [];
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        stack.push(c);
        if (c.a === 1) break;
      } else if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
        const stops = gradientStops(cs.backgroundImage);
        if (stops.length) {
          const last = stops[stops.length - 1];
          if (last.a > 0) {
            stack.push(last);
            if (last.a === 1) break;
          }
        }
      }
      node = node.parentElement;
    }
    let base = [255, 255, 255];
    const b = parse(getComputedStyle(document.body).backgroundColor);
    if (b && b.a === 1) base = b.rgb;
    let acc = base;
    for (let i = stack.length - 1; i >= 0; i -= 1) acc = over(stack[i], acc);
    return acc;
  };

  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH', 'DEFS', 'G', 'RECT', 'CIRCLE', 'LINE', 'USE', 'BR']);
  const lowContrast = [];
  const blueLeak = [];
  let checked = 0;

  document.querySelectorAll('body *').forEach((el) => {
    if (SKIP.has(el.tagName)) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;

    // hue check: biru/ungu yang tidak sengaja
    const fg = parse(cs.color);
    if (fg && fg.a > 0.1) {
      const [R, G, B] = fg.rgb;
      const max = Math.max(R, G, B), min = Math.min(R, G, B);
      const sat = max === 0 ? 0 : (max - min) / max;
      if (B > 90 && B - R > 34 && B - G > 26 && sat > 0.18) {
        blueLeak.push((el.className || el.tagName) + ' = rgb(' + [R, G, B].join(',') + ')');
      }
    }

    // hanya elemen yang punya teks langsung
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
    if (!text || fg.a < 0.5) return;

    const size = parseFloat(cs.fontSize);
    const weight = +cs.fontWeight || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const r2 = ratio(over(fg, bgOf(el)), bgOf(el));
    checked += 1;
    if (r2 < need) {
      const bg = bgOf(el).map(Math.round);
      lowContrast.push({
        sel: (el.className || el.tagName).toString().slice(0, 46),
        text: text.slice(0, 26),
        ratio: +r2.toFixed(2),
        need,
        size,
        color: cs.color,
        bg: 'rgb(' + bg.join(',') + ')',
        gradient: cs.backgroundImage === 'none' ? '' : 'GRAD',
        raw: cs.backgroundImage === 'none' ? '' : cs.backgroundImage.slice(0, 120),
        stops: cs.backgroundImage === 'none' ? 0 : gradientStops(cs.backgroundImage).length,
      });
    }
  });

  return JSON.stringify({
    theme: document.documentElement.dataset.theme,
    checked,
    low: lowContrast.slice(0, 12),
    lowCount: lowContrast.length,
    blue: [...new Set(blueLeak)].slice(0, 6),
    blueCount: blueLeak.length,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  });
})()`;

const VIEWPORTS = [
  { name: 'mobile 390', width: 390, height: 844, mobile: true },
  { name: 'desktop 1440', width: 1440, height: 900, mobile: false },
];

const ROUTES = (process.argv[3] || '/#/').split(';');

await send('Page.enable');
let problems = 0;
console.log(`URL: ${TARGET}\n`);

for (const [ri, route] of ROUTES.entries()) {
  console.log(`===== ${route} =====`);
  // query cache-bust supaya tiap route benar-benar full-load, bukan cuma
  // ganti hash di dokumen yang sama.
  const url = TARGET + (TARGET.includes('?') ? '&' : '?') + 'r=' + ri + route;
  await send('Page.navigate', { url });
  await sleep(3200);

  const seen = await evaluate(
    'JSON.stringify({h1:(document.querySelector("h1")||{}).textContent, route:location.hash, n:document.querySelectorAll("main section, main .container").length})',
  );
  console.log(`       halaman: ${seen}`);

  for (const vp of VIEWPORTS) {
    await send('Emulation.setDeviceMetricsOverride', { ...vp, deviceScaleFactor: 1 });
    for (const theme of ['dark', 'light']) {
      await evaluate(`localStorage.setItem('apisz-theme','${theme}');
        document.documentElement.dataset.theme='${theme}';
        window.dispatchEvent(new Event('hashchange'));`);
      await sleep(900);
      const m = JSON.parse(await evaluate(AUDIT));
      const bad = m.lowCount + m.blueCount;
      if (bad) problems += 1;
      console.log(`${bad ? 'CEK ' : 'OK  '} ${vp.name.padEnd(13)} ${m.theme.padEnd(6)} bg=${m.bodyBg}  teks=${m.checked}`);
      if (m.low.length) {
        m.low.forEach((l) => {
          console.log(
            `       ${String(l.ratio).padStart(5)} < ${l.need}  ${String(l.size).padStart(6)}px  ${l.sel.padEnd(34)} fg=${l.color.padEnd(20)} bg=${l.bg.padEnd(18)} ${l.gradient}`,
          );
          if (l.gradient) console.log(`              stops=${l.stops} raw=${l.raw}`);
        });
      }
      if (m.blue.length) m.blue.forEach((b) => console.log(`       biru bocor: ${b}`));
    }
  }
  console.log('');
}

ws.close();
edge.kill();
console.log(problems ? `${problems} kombinasi perlu diperbaiki` : 'Semua mode lolos: kontras aman, tidak ada kebocoran biru.');
process.exit(problems ? 1 : 0);
