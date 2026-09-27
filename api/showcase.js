/**
 * GET /api/showcase
 *
 * Membaca riwayat channel showcase Discord, lalu mengirimkannya ke website
 * dalam bentuk JSON untuk dipakai section Showcase. Tidak ada database.
 *
 * Credential HANYA dibaca dari environment variable Vercel. Token tidak pernah
 * ikut di response, tidak pernah masuk ke query string, dan tidak pernah
 * sampai ke browser.
 *
 * Env:
 *   DISCORD_BOT_TOKEN          token bot (wajib, sama dengan testimoni)
 *   DISCORD_SHOWCASE_CHANNELS  daftar channel sumber (wajib)
 *                              "1234567890" atau "1234567890:SA-MP,9876:UI"
 *   DISCORD_GUILD_ID           opsional, dipakai untuk membuat link pesan
 *
 * Query:
 *   ?limit=24     jumlah produk (maks 100)
 *   ?maxPages=2   berapa halaman histori per channel (maks 10)
 *   ?refresh=1    lewati cache (untuk debugging)
 */

import { DiscordError, fetchShowcaseProducts } from '../src/lib/discord.js';
import { SHOWCASE_FILTERS } from '../src/lib/parse-showcase.js';

const CACHE_SECONDS = 60;
const STALE_SECONDS = 600;

/** Filter showcase yang sudah ada di website. "All" bukan kategori produk. */
const CATEGORIES = SHOWCASE_FILTERS.filter((item) => item !== 'All');
const SNOWFLAKE = /^\d{17,20}$/;

/**
 * Kategori di env dicocokkan tanpa heedkan huruf besar-kecil. `samp`, `SAMP`,
 * dan `sa-mp` semuanya berarti `SA-MP` - filter website sudah ada sebelumnya
 * dan tidak boleh berubah hanya karena ada yang mengetik huruf kecil di Vercel.
 */
const CATEGORY_BY_KEY = new Map(CATEGORIES.map((name) => [name.toLowerCase(), name]));

/** Alasan umum orang salah ketik, dipetakan ke filter yang benar. */
const CATEGORY_ALIASES = new Map([
  ['sa-mp', 'SA-MP'],
  ['samp', 'SA-MP'],
  ['gtasa', 'SA-MP'],
  ['s-a-m-p', 'SA-MP'],
  ['discord', 'Discord'],
  ['dc', 'Discord'],
  ['bot', 'Bot'],
  ['website', 'Website'],
  ['web', 'Website'],
  ['ui', 'UI'],
  ['design', 'UI'],
  ['desain', 'UI'],
]);

function send(res, status, payload, { noStore = false } = {}) {
  if (!noStore) {
    res.setHeader('Cache-Control', `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`);
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(payload);
}

/**
 * Baca `DISCORD_SHOWCASE_CHANNELS`.
 *
 * Format: daftar id channel dipisah koma, tiap item boleh dikasih kategori
 * dengan tanda titik dua - `1553622067746840709:SA-MP`. Kategori yang tidak
 * dikenal TIDAK diam-diam diabaikan: nilainya dikembalikan di `unknown` supaya
 * kelihatan saat ngecek respons, lalu kategorinya dikosongkan agar produk dari
 * channel itu ditebak otomatis dari isi dan nama channel.
 *
 * @returns {{channels: {id: string, category: string|null}[], invalid: string[], unknown: string[]}}
 */
export function parseChannelList(raw) {
  const channels = [];
  const invalid = [];
  const unknown = [];

  for (const part of String(raw ?? '').split(',')) {
    const chunk = part.trim();
    if (!chunk) continue;

    const [idPart, categoryPart] = chunk.split(':');
    const id = (idPart ?? '').trim();
    if (!SNOWFLAKE.test(id)) {
      invalid.push(idPart?.trim() ?? chunk);
      continue;
    }

    channels.push({ id, category: resolveCategory(categoryPart, unknown) });
  }

  return { channels, invalid, unknown };
}

/**
 * Terjemahkan kategori yang ditulis di env ke nama filter yang benar.
 * Mengembalikan `null` kalau tidak dikenali, dan mencatat aslinya di `unknown`
 * supaya tidak hilang tanpa jejak.
 */
function resolveCategory(raw, unknown) {
  const key = String(raw ?? '').trim().toLowerCase();
  if (!key) return null;

  const exact = CATEGORY_BY_KEY.get(key);
  if (exact) return exact;

  const alias = CATEGORY_ALIASES.get(key);
  if (alias) return alias;

  unknown.push(String(raw).trim());
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { error: 'Method not allowed' }, { noStore: true });
  }

  // Vercel/Developer Portal kadang menyalin nilai dengan tanda kutip atau spasi
  // tersembunyi, jadi semua nilai dibersihkan dulu sebelum dipakai.
  const token = (process.env.DISCORD_BOT_TOKEN ?? '').trim();
  const rawChannels = (process.env.DISCORD_SHOWCASE_CHANNELS ?? '').trim();
  const guildId = (process.env.DISCORD_GUILD_ID ?? '').trim();

  if (!token || !rawChannels) {
    // Nama env sengaja disebut, nilainya tidak.
    return send(
      res,
      500,
      {
        error: 'Server belum dikonfigurasi',
        detail:
          'DISCORD_BOT_TOKEN dan/atau DISCORD_SHOWCASE_CHANNELS belum di-set di environment Vercel.',
      },
      { noStore: true },
    );
  }

  const { channels, invalid, unknown } = parseChannelList(rawChannels);

  if (channels.length === 0) {
    return send(
      res,
      500,
      {
        error: 'DISCORD_SHOWCASE_CHANNELS tidak berisi Channel ID yang valid',
        detail:
          'Harus 17-20 digit angka snowflake Discord, tanpa tanda kutip dan tanpa nama channel. Salin ulang lewat Developer Mode: klik kanan channel > Copy Channel ID.',
        invalid,
      },
      { noStore: true },
    );
  }

  const params = req.query ?? {};
  const limit = clamp(Number(params.limit) || 24, 1, 100);
  const maxPages = clamp(Number(params.maxPages) || 2, 1, 10);
  const refresh = params.refresh === '1' || params.refresh === 'true';

  if (refresh) res.setHeader('Cache-Control', 'no-store');

  try {
    const result = await fetchShowcaseProducts({
      token,
      channels,
      limit,
      maxPages,
      guildId: SNOWFLAKE.test(guildId) ? guildId : '',
    });

    return send(res, 200, {
      items: result.items,
      count: result.items.length,
      source: 'discord',
      categories: CATEGORIES,
      channels: result.channels,
      invalid,
      // Kategori yang diketik tidak dikenali. Tidak menggagalkan apa pun, tapi
      // muncul di sini supaya kelihatan waktu ngecek respons, bukan diam-diam.
      unknown,
      scanned: result.scanned,
      truncated: result.truncated,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof DiscordError) {
      return send(
        res,
        error.status === 429 ? 429 : 502,
        {
          error: 'Gagal mengambil produk dari Discord',
          detail: error.message,
          retryAfter: error.retryAfter || undefined,
        },
        { noStore: true },
      );
    }

    return send(
      res,
      500,
      { error: 'Gagal mengambil produk', detail: 'Cek konfigurasi environment Vercel.' },
      { noStore: true },
    );
  }
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}
