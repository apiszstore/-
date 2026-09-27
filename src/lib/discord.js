/**
 * Client Discord REST API (v10) untuk channel testimoni dan showcase.
 *
 * Token HANYA dibaca dari argumen yang dikirim server. Fungsi ini tidak pernah
 * menyentuh `process.env` supaya tidak ada jalur kode yang bisa secara tidak
 * sengaja mengirim token ke browser. `api/testimonials.js` dan `api/showcase.js`
 * yang membacanya dari environment Vercel.
 */

import { clean as cleanText, dedupe, parseMessage, sortTestimonials } from './parse-testimonial.js';
import { dedupe as dedupeProducts, parseProductMessage, sortProducts } from './parse-showcase.js';

const API = 'https://discord.com/api/v10';
const PAGE_SIZE = 100;

/** Error dari Discord, membawa status HTTP supaya bisa diteruskan. */
export class DiscordError extends Error {
  constructor(message, status, retryAfter = 0) {
    super(message);
    this.name = 'DiscordError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function callApi(path, token, { attempt = 0 } = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bot ${token}`,
      'User-Agent': 'ApisZStore-Testimonials (1.0)',
    },
  });

  if (response.status === 429) {
    const body = await response.json().catch(() => ({}));
    const retryAfter = body.retry_after ?? Number(response.headers.get('retry-after')) ?? 1;

    // Function Vercel punya timeout, jadi retry cukup satu kali dan sesingkat mungkin.
    if (attempt === 0 && retryAfter <= 3) {
      await sleep(retryAfter * 1000);
      return callApi(path, token, { attempt: attempt + 1 });
    }
    throw new DiscordError('Discord rate limit', 429, retryAfter);
  }

  if (response.status === 401) throw new DiscordError('Token Discord tidak valid', 401);
  if (response.status === 403) throw new DiscordError('Bot tidak punya akses ke channel ini', 403);
  if (response.status === 404) throw new DiscordError('Channel tidak ditemukan / bot bukan di server', 404);

  if (!response.ok) throw new DiscordError(`Discord API error ${response.status}`, response.status);

  return response.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ubah Discord mention "<@123>" menjadi username asli.
 *
 * Embed bot menulis `Customer: <@1368863471659122740>`, jadi tanpa request ini
 * kartu hanya bisa menampilkan ID angka yang tidak berguna. Discord tidak punya
 * endpoint batch, jadi tiap ID diambil satu per satu. Kegagalan individual
 * tidak fatal: ID yang gagal resolving dilewati saja.
 *
 * @returns {Promise<Map<string, {username: string, globalName: string|null}>>}
 */
export async function resolveUsers(ids, token) {
  const unique = [...new Set((ids ?? []).filter(Boolean))];
  const out = new Map();
  if (unique.length === 0) return out;

  const results = await Promise.all(
    unique.map(async (id) => {
      try {
        const user = await callApi(`/users/${id}`, token);
        return [id, { username: user?.username ?? null, globalName: user?.global_name ?? null }];
      } catch {
        return [id, null];
      }
    }),
  );

  for (const [id, user] of results) {
    if (user?.username) out.set(id, user);
  }
  return out;
}

/**
 * Isi `name`/`username` dari mention yang tadi dikembalikan parser.
 * Kalau user tidak ditemukan (bot tidak bisa melihat user itu, atau user
 * sudah ganti username), `name` diisi label ringkas supaya kartu tetap rapi.
 */
export function applyIdentities(testimonials, users) {
  return testimonials.map((item) => {
    if (!item.userId || item.name) return item;
    const user = users.get(item.userId);
    if (!user) {
      return { ...item, name: 'Pelanggan Discord' };
    }
    return {
      ...item,
      name: cleanText(user.globalName) || cleanText(user.username),
      username: cleanText(user.username) ? `@${cleanText(user.username)}` : null,
    };
  });
}

/**
 * Buang field internal sebelum dikirim ke browser.
 * `userId` hanya dibutuhkan untuk resolve mention, tidak ada gunanya di sisi
 * klien, jadi jangan ikut keluar.
 */
function toPublic(list) {
  return list.map(({ userId, ...rest }) => rest);
}

/**
 * Ambil riwayat pesan channel lalu parse jadi daftar testimoni.
 *
 * Discord tidak bisa memfilter berdasarkan embed, jadi riwayat harus dipindai
 * dari pesan terbaru ke lama memakai `before`. `maxPages` membatasi berapa kali
 * halaman diambil supaya function tidak kena timeout.
 *
 * @returns {Promise<{testimonials: object[], scanned: number, pages: number, truncated: boolean}>}
 */
export async function fetchTestimonials({ token, channelId, limit = 12, maxPages = 3, embedTitle = '' }) {
  const wanted = Number(limit) > 0 ? Number(limit) : 12;
  const pagesAllowed = Math.min(Math.max(Number(maxPages) || 3, 1), 10);

  const found = [];
  let before;
  let scanned = 0;
  let pages = 0;
  let truncated = false;

  while (pages < pagesAllowed) {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (before) query.set('before', before);

    const messages = await callApi(`/channels/${channelId}/messages?${query}`, token);
    if (!Array.isArray(messages) || messages.length === 0) break;

    pages += 1;
    scanned += messages.length;

    for (const message of messages) {
      const embed = message?.embeds?.[0];
      if (!embed) continue;

      // Kalau judul embed diisi, hanya terima yang cocok supaya pesan lain terfilter.
      if (embedTitle && !String(embed.title ?? '').toLowerCase().includes(embedTitle.toLowerCase())) continue;

      const item = parseMessage(message);
      if (item) found.push(item);
    }

    if (found.length >= wanted) break;

    // Sudah sampai pesan paling lama.
    if (messages.length < PAGE_SIZE) break;
    before = messages[messages.length - 1]?.id;
    if (!before) break;
  }

  truncated = pages >= pagesAllowed && found.length < wanted;

  const testimonials = sortTestimonials(dedupe(found)).slice(0, wanted);

  // Mention "<@id>" diubah jadi username asli supaya kartu tidak menampilkan
  // angka mentah. Kalau gagal resolving, kartu tetap dapat label cadangan.
  const users = await resolveUsers(testimonials.map((item) => item.userId), token);

  return {
    testimonials: toPublic(applyIdentities(testimonials, users)),
    scanned,
    pages,
    truncated,
  };
}

/**
 * Ambil histori channel showcase lalu parse jadi daftar produk.
 *
 * `channels` berisi `[{ id, category? }]`. Nama channel dibaca dari Discord
 * supaya kategori bisa ditebak dari nama channel (`product-samp` -> SA-MP,
 * `digital-service` -> Discord) tanpa perlu menulisnya manual di kode. Kalau
 * `category` diisi di `channels`, pin itu menang atas tebakan otomatis.
 *
 * Satu channel yang tidak bisa dibaca (403, 404, dll) TIDAK menggagalkan
 * channel lain - errornya dikembalikan terpisah di `channels[].error` supaya
 * satu channel salah konfigurasi tidak membuat seluruh showcase kosong.
 *
 * Discord tidak bisa menyaring pesan, jadi channel dipindai dari pesan
 * terbaru ke lama memakai `before`. Ini yang membuat produk LAMA ikut
 * terbaca - tidak perlu event, tidak perlu bot yang harus online.
 *
 * @returns {Promise<{items: object[], channels: object[], scanned: number, truncated: boolean}>}
 */
export async function fetchShowcaseProducts({
  token,
  channels,
  limit = 24,
  maxPages = 2,
  guildId = '',
}) {
  const wanted = Number(limit) > 0 ? Number(limit) : 24;
  const pagesAllowed = Math.min(Math.max(Number(maxPages) || 2, 1), 10);
  const list = (Array.isArray(channels) ? channels : []).filter((channel) => channel?.id);

  if (list.length === 0) {
    return { items: [], channels: [], scanned: 0, truncated: false };
  }

  // Tiap channel punya bucket rate limit sendiri di Discord, jadi jalur
  // per-channel boleh paralel tanpa saling menabrak.
  const results = await Promise.all(
    list.map((channel) => scanShowcaseChannel({ token, channel, wanted, pagesAllowed, guildId })),
  );

  const merged = dedupeProducts(
    sortProducts(results.flatMap((result) => result.items)),
  ).slice(0, wanted);

  return {
    items: merged,
    channels: results.map(({ items, ...rest }) => ({ ...rest, count: items.length })),
    scanned: results.reduce((total, result) => total + result.scanned, 0),
    truncated: results.some((result) => result.truncated),
  };
}

/** Pindai satu channel showcase dari pesan terbaru ke lama. */
async function scanShowcaseChannel({ token, channel, wanted, pagesAllowed, guildId }) {
  const context = { channelId: channel.id, pinnedCategory: channel.category ?? null, guildId };

  let name = null;
  try {
    const meta = await callApi(`/channels/${channel.id}`, token);
    name = meta?.name ? String(meta.name) : null;
  } catch {
    // Nama channel cuma buat menebak kategori. Gagal ambil (mis. bot tidak
    // punya izin View Channel tapi endpoint pesan tetap jalan) tidak fatal.
    name = null;
  }
  context.channelName = name;

  const found = [];
  let before;
  let scanned = 0;
  let pages = 0;
  let lastPageFull = false;
  let error = null;

  try {
    while (pages < pagesAllowed) {
      const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (before) query.set('before', before);

      const messages = await callApi(`/channels/${channel.id}/messages?${query}`, token);
      if (!Array.isArray(messages) || messages.length === 0) break;

      pages += 1;
      scanned += messages.length;

      for (const message of messages) {
        const item = parseProductMessage(message, context);
        if (item) found.push(item);
      }

      if (found.length >= wanted) break;

      // Halaman terisi penuh = masih ada pesan lebih lama di belakangnya.
      // Kalau tidak, histori channel ini sudah habis dan aman dihentikan.
      lastPageFull = messages.length >= PAGE_SIZE;
      if (!lastPageFull) break;

      before = messages[messages.length - 1]?.id;
      if (!before) break;
    }
  } catch (caught) {
    error = caught instanceof DiscordError ? caught.message : 'Gagal membaca channel';
  }

  return {
    id: channel.id,
    name,
    scanned,
    pages,
    // `truncated` hanya benar kalau historianya masih ada di belakang tapi
    // kita berhenti karena kehabisan jatah halaman, bukan karena habis.
    truncated: lastPageFull && pages >= pagesAllowed,
    error,
    items: sortProducts(found),
  };
}
