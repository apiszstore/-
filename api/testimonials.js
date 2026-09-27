/**
 * GET /api/testimonials
 *
 * Membaca histori + testimoni baru langsung dari channel Discord, lalu
 * mengirimkannya ke website dalam bentuk JSON. Tidak ada database.
 *
 * Credential HANYA dibaca dari environment variable Vercel. Token tidak pernah
 * ikut di response, tidak pernah masuk ke query string, dan tidak pernah
 * sampai ke browser. Endpoint ini dipanggil dari server/browser lewat URL
 * biasa, jadi yang tampil ke pengunjung hanyalah data testimoni.
 *
 * Env:
 *   DISCORD_BOT_TOKEN   token bot (wajib)
 *   DISCORD_CHANNEL_ID  id channel testimoni (wajib)
 *   TESTIMONIAL_EMBED_TITLE  opsional, saring embed berdasarkan judul
 *
 * Query:
 *   ?limit=12     jumlah testimoni (maks 100)
 *   ?maxPages=3   berapa halaman histori yang dipindai (maks 10)
 *   ?refresh=1    lewati cache (untuk debugging)
 */

import { DiscordError, fetchTestimonials } from '../src/lib/discord.js';

const CACHE_SECONDS = 60;
const STALE_SECONDS = 600;

function send(res, status, payload, { noStore = false } = {}) {
  if (!noStore) {
    res.setHeader('Cache-Control', `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`);
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(payload);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { error: 'Method not allowed' }, { noStore: true });
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!token || !channelId) {
    // Nama env sengaja disebut, nilainya tidak.
    return send(
      res,
      500,
      {
        error: 'Server belum dikonfigurasi',
        detail: 'DISCORD_BOT_TOKEN dan/atau DISCORD_CHANNEL_ID belum di-set di environment Vercel.',
      },
      { noStore: true },
    );
  }

  const params = req.query ?? {};
  const limit = clamp(Number(params.limit) || 12, 1, 100);
  const maxPages = clamp(Number(params.maxPages) || 3, 1, 10);
  const refresh = params.refresh === '1' || params.refresh === 'true';

  if (refresh) res.setHeader('Cache-Control', 'no-store');

  try {
    const result = await fetchTestimonials({
      token,
      channelId,
      limit,
      maxPages,
      embedTitle: process.env.TESTIMONIAL_EMBED_TITLE ?? '',
    });

    return send(res, 200, {
      testimonials: result.testimonials,
      count: result.testimonials.length,
      source: 'discord',
      channelId,
      scanned: result.scanned,
      pages: result.pages,
      truncated: result.truncated,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof DiscordError) {
      return send(
        res,
        error.status === 429 ? 429 : 502,
        {
          error: 'Gagal mengambil testimoni dari Discord',
          detail: error.message,
          retryAfter: error.retryAfter || undefined,
        },
        { noStore: true },
      );
    }

    return send(res, 500, { error: 'Gagal mengambil testimoni', detail: 'Cek konfigurasi environment Vercel.' }, { noStore: true });
  }
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}
