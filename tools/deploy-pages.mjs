/**
 * Deploy build produksi ke Cloudflare Pages.
 *
 * Token API Cloudflare dibaca dari Environment Variable
 * `CLOUDFLARE_API_TOKEN`. Kalau tidak ada, script mencarinya di file
 * `.cloudflare-token` (sudah masuk .gitignore) supaya token tidak pernah
 * ikut ter-commit atau tampil di riwayat chat.
 *
 * PEMAKAIAN:
 *   1. npm run build
 *   2. Simpan token ke file .cloudflare-token (tanpa nama variabel),
 *      atau set $env:CLOUDFLARE_API_TOKEN
 *   3. npm run deploy            -> production, https://<project>.pages.dev
 *      npm run deploy:preview    -> branch "preview", URL jadi
 *                                   https://preview.<project>.pages.dev
 *
 * Token dibuat di: Dashboard Cloudflare -> My Profile -> API Tokens ->
 * Create Token -> template "Edit Cloudflare Workers"
 * (wajib ada permission "Cloudflare Pages: Edit").
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const PREVIEW = process.argv.includes('--preview');
const PROJECT = process.env.CF_PROJECT ?? 'apiszstore';
const BRANCH = process.env.CF_BRANCH ?? (PREVIEW ? 'preview' : null);
const TOKEN_FILE = new URL('../.cloudflare-token', import.meta.url);

if (!existsSync(new URL('../dist/index.html', import.meta.url))) {
  console.error('dist/ belum ada. Jalankan `npm run build` dulu.');
  process.exit(1);
}

let token = process.env.CLOUDFLARE_API_TOKEN;
let source = 'environment variable';

if (!token && existsSync(TOKEN_FILE)) {
  token = readFileSync(TOKEN_FILE, 'utf8').trim();
  source = '.cloudflare-token';
}

if (!token) {
  console.error('Token Cloudflare tidak ditemukan.\n');
  console.error('Buat dulu di: Dashboard Cloudflare -> My Profile -> API Tokens');
  console.error('  -> Create Token -> template "Edit Cloudflare Workers"');
  console.error('  (permission "Cloudflare Pages: Edit")\n');
  console.error('Lalu simpan token (tanpa nama variabel) ke file .cloudflare-token,');
  console.error('atau set $env:CLOUDFLARE_API_TOKEN lalu jalankan ulang.');
  process.exit(1);
}

if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) {
  console.error('Isi .cloudflare-token tidak terlihat seperti token Cloudflare.');
  console.error('Isi file HANYA tokennya, tanpa "CLOUDFLARE_API_TOKEN=" dan tanpa tanda kutip.');
  process.exit(1);
}

console.log(`Project : ${PROJECT}`);
console.log(`Branch  : ${BRANCH ?? '(production)'}`);
console.log(`Token   : dari ${source}, ${token.length} karakter (disembunyikan)`);
console.log(
  `Upload  : dist/ -> ${BRANCH ? `https://${BRANCH}.${PROJECT}.pages.dev/` : `https://${PROJECT}.pages.dev/`}\n`,
);

const args = ['--yes', 'wrangler', 'pages', 'deploy', 'dist', '--project-name', PROJECT];
if (BRANCH) args.push('--branch', BRANCH);

const result = spawnSync('npx', args, {
  stdio: 'inherit',
  env: { ...process.env, CLOUDFLARE_API_TOKEN: token },
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(`\nGAGAL menjalankan wrangler: ${result.error.message}`);
  process.exit(1);
}
if (result.status !== 0) {
  console.error(`\nwrangler keluar dengan kode ${result.status}.`);
  console.error('Kalau errornya 1006/403, token-nya kemungkinan salah permission.');
  process.exit(result.status ?? 1);
}

const label = BRANCH ? `https://${BRANCH}.${PROJECT}.pages.dev/` : `https://${PROJECT}.pages.dev/`;
console.log(`\nSelesai. Cek: ${label}`);
console.log('Setelah publish, tunggu sebentar sampai deploy selesai dipropagasi.');
console.log('Jangan lupa ganti URL di index.html + jalankan `npm run check:url`');
