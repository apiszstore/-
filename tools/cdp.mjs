/**
 * Helper kecil untuk menjalankan Edge headless lewat Chrome DevTools Protocol.
 * Dipakai semua script verify-*.mjs supaya tidak ada kode duplikat.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

export const DEFAULT_TARGET = 'http://localhost:8080/';

/** Viewport yang wajib lolos: HP kecil sampai monitor lebar. */
export const VIEWPORTS = [
  { name: '320', width: 320, height: 568, mobile: true },
  { name: '360', width: 360, height: 640, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: true },
  { name: '1024', width: 1024, height: 768, mobile: false },
  { name: '1440', width: 1440, height: 900, mobile: false },
  { name: '1920', width: 1920, height: 1080, mobile: false },
];

/**
 * Buka satu jendela Edge headless dan return { send, evaluate, close }.
 * `port` wajib unik kalau memanggil script secara paralel.
 */
export async function openBrowser({ port, target = DEFAULT_TARGET, profile = 'verify' } = {}) {
  const exe = EDGE_PATHS.find((path) => existsSync(path));
  if (!exe) throw new Error('Microsoft Edge tidak ditemukan di path standar');

  const edge = spawn(
    exe,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${process.env.TEMP}\\opencode\\edge-${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  const wsUrl = await findTarget(port);
  const ws = new WebSocket(wsUrl);

  let id = 0;
  const pending = new Map();
  const listeners = new Set();

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message.result ?? {});
      pending.delete(message.id);
    }
    if (message.method) listeners.forEach((fn) => fn(message));
  });

  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

  function send(method, params = {}) {
    id += 1;
    return new Promise((resolve) => {
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression, { awaitPromise = false } = {}) {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? 'evaluate gagal');
    }
    return result.result?.value;
  }

  async function setViewport({ width, height, mobile }) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: Boolean(mobile),
    });
  }

  async function goto(url) {
    await send('Page.navigate', { url });
    await sleep(2600);
  }

  async function close() {
    try {
      ws.close();
    } catch {
      /* ignore */
    }
    edge.kill();
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await goto(target);

  return { send, evaluate, setViewport, goto, close, on: (fn) => listeners.add(fn) };
}

async function findTarget(port) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((target) => target.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* Edge belum siap */
    }
    await sleep(250);
  }
  throw new Error(`CDP di port ${port} tidak merespons`);
}

/** Kumpulkan error/warning console + exception halaman. */
export function collectConsoleIssues(browser) {
  const issues = [];
  browser.on((message) => {
    if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) {
      const text = message.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ');
      issues.push(`[console.${message.params.type}] ${text}`);
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      issues.push(`[exception] ${details.exception?.description ?? details.text}`);
    }
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
      issues.push(`[log] ${message.params.entry.text} ${message.params.entry.url ?? ''}`);
    }
  });
  return issues;
}

export { sleep };
