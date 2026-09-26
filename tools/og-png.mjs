/**
 * Render public/og-image.svg -> public/og-image.png (1200x630).
 *
 * Kenapa perlu: WhatsApp / Facebook / X tidak merender SVG untuk
 * og:image, jadi preview link jadi kosong. PNG 1200x630 itu ukuran
 * standar yang didukung semua platform.
 *
 * Jalankan: node tools/og-png.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { openBrowser } from './cdp.mjs';

const W = 1200;
const H = 630;

const svg = readFileSync(new URL('../public/og-image.svg', import.meta.url), 'utf8');
const html = `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;width:${W}px;height:${H}px;overflow:hidden;background:#313338}
  svg{display:block;width:${W}px;height:${H}px}
</style>
${svg}`;

const b = await openBrowser({ port: 9265, target: 'about:blank', profile: 'og' });
await b.setViewport({ width: W, height: H, mobile: false });

await b.goto(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
await new Promise((r) => setTimeout(r, 1200));

const data = await b.evaluate(`(async () => {
  const svg = document.querySelector('svg');
  if (!svg) return null;
  const xml = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.width = ${W}; img.height = ${H};
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const canvas = document.createElement('canvas');
  canvas.width = ${W}; canvas.height = ${H};
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, ${W}, ${H});
  return canvas.toDataURL('image/png').split(',')[1];
})()`, { awaitPromise: true });

await b.close();

if (!data) {
  console.error('GAGAL: SVG tidak bisa dirender');
  process.exit(1);
}

writeFileSync(new URL('../public/og-image.png', import.meta.url), Buffer.from(data, 'base64'));
console.log(`public/og-image.png dibuat (${W}x${H})`);
