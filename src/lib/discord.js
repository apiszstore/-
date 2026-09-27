/**
 * Client Discord REST API (v10) khusus channel testimoni.
 *
 * Token HANYA dibaca dari argumen yang dikirim server. Fungsi ini tidak pernah
 * menyentuh `process.env` supaya tidak ada jalur kode yang bisa secara tidak
 * sengaja mengirim token ke browser. `api/testimonials.js` yang membacanya dari
 * environment Vercel.
 */

import { dedupe, parseMessage, sortTestimonials } from './parse-testimonial.js';

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
      name: user.globalName || user.username,
      username: `@${user.username}`,
    };
  });
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
    testimonials: applyIdentities(testimonials, users),
    scanned,
    pages,
    truncated,
  };
}
