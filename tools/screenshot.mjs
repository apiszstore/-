/**
 * Ambil screenshot halaman untuk pengecekan visual manual.
 * Jalankan: node tools/screenshot.mjs
 * Output: $env:TEMP\opencode\shot-*.png
 */
import { writeFileSync } from 'node:fs';
import { openBrowser } from './cdp.mjs';

const OUT = process.env.TEMP + '\\opencode';
const SHOTS = [
  { name: 'desktop-full', width: 1440, height: 900, full: true },
  { name: 'mobile-full', width: 390, height: 844, full: true },
  { name: 'mobile-hero', width: 390, height: 844, full: false },
];

const b = await openBrowser({ port: 9251, target: 'http://localhost:8080/', profile: 'shot' });

for (const shot of SHOTS) {
  await b.setViewport({ width: shot.width, height: shot.height, mobile: shot.width < 700 });
  await b.goto('http://localhost:8080/');
  await new Promise((r) => setTimeout(r, 1200));

  if (shot.full) {
    // Paksa semua animasi reveal selesai supaya tidak ada elemen kosong.
    await b.evaluate(`document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }); true`);
    await new Promise((r) => setTimeout(r, 600));
  }

  const params = { format: 'png', captureBeyondViewport: shot.full };
  const result = await b.send('Page.captureScreenshot', params);
  const file = `${OUT}\\shot-${shot.name}.png`;
  writeFileSync(file, Buffer.from(result.data, 'base64'));
  console.log(`saved ${file}`);
}

await b.close();
