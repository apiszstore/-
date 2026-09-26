/**
 * Deploy ke Cloudflare Workers (yang sekarang juga melayani Pages).
 *
 * Token API dibaca dari Environment Variable `CLOUDFLARE_API_TOKEN`.
 * Kalau tidak ada, script mencarinya di file `.cloudflare-token`
 * (sudah masuk .gitignore) supaya token tidak pernah ikut ter-commit
 * atau tampil di riwayat chat.
 *
 * PEMAKAIAN:
 *   1. npm run build
 *   2. Simpan token ke .cloudflare-token (isi file HANYA tokennya),
 *      atau set $env:CLOUDFLARE_API_TOKEN
 *   3. npm run deploy           -> https://apiszstore.<akun>.workers.dev
 *      npm run deploy:preview   -> https://apiszstore-preview.<akun>.workers.dev
 *
 * Token dibuat di: Dashboard Cloudflare -> My Profile -> API Tokens ->
 * Create Token -> template "Edit Cloudflare Workers"
 * (wajib ada permission "Cloudflare Pages: Edit").
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const PREVIEW = process.argv.includes('--preview');
const SKIP_BUILD = process.argv.includes('--skip-build');
const TOKEN_FILE = new URL('../.cloudflare-token', import.meta.url);

function run(command, args, extraEnv = {}) {
  return spawnSync(command, args, {
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: process.platform === 'win32',
  });
}

let token = process.env.CLOUDFLARE_API_TOKEN;
let source = 'environment variable';

if (!token && existsSync(TOKEN_FILE)) {
  token = readFileSync(TOKEN_FILE, 'utf8').trim();
  source = '.cloudflare-token';
}

if (!token) {
  console.error('\nToken Cloudflare tidak ditemukan.\n');
  console.error('Buat dulu di: Dashboard Cloudflare -> My Profile -> API Tokens');
  console.error('  -> Create Token -> template "Edit Cloudflare Workers"');
  console.error('  (permission "Cloudflare Pages: Edit")\n');
  console.error('Lalu simpan token ke file .cloudflare-token (isi file HANYA');
  console.error('tokennya), atau set $env:CLOUDFLARE_API_TOKEN.');
  process.exit(1);
}

if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) {
  console.error('\nIsi .cloudflare-token tidak terlihat seperti token Cloudflare.');
  console.error('Isi file HANYA tokennya: tanpa "CLOUDFLARE_API_TOKEN=", tanpa tanda kutip.\n');
  process.exit(1);
}

if (!SKIP_BUILD) {
  console.log('Build...\n');
  const build = run('npm', ['run', 'build']);
  if (build.status !== 0) {
    console.error('\nBuild gagal, deploy dibatalkan.');
    process.exit(build.status ?? 1);
  }
}

if (!existsSync(new URL('../dist/index.html', import.meta.url))) {
  console.error('\ndist/index.html tidak ada. Jalankan `npm run build` dulu.\n');
  process.exit(1);
}

console.log(`Token  : dari ${source}, ${token.length} karakter (disembunyikan)`);
console.log(`Target : ${PREVIEW ? 'preview (apiszstore-preview)' : 'production (apiszstore)'}\n`);

const args = ['--yes', 'wrangler', 'deploy'];
if (PREVIEW) args.push('--env', 'preview');

const result = run('npx', args, { CLOUDFLARE_API_TOKEN: token });

if (result.error) {
  console.error(`\nGAGAL menjalankan wrangler: ${result.error.message}`);
  process.exit(1);
}
if (result.status !== 0) {
  console.error(`\nwrangler keluar dengan kode ${result.status}.`);
  console.error('Kalau errornya 1006 / 403, token-nya kemungkinan salah permission');
  console.error('atau kedaluwarsa. Cek: npm run deploy  (tanpa token, akan tampil');
  console.error('panduan membuat token).');
  process.exit(result.status ?? 1);
}

console.log('\nSelesai. Buka URL yang tertera di output wrangler.');
console.log('Pastikan juga URL di index.html (canonical / og:url / JSON-LD)');
console.log('sudah sesuai, lalu jalankan: npm run check:url');
