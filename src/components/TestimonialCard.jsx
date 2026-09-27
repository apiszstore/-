import { useEffect, useRef, useState } from 'react';

/**
 * Card testimoni.
 *
 * ============================================================
 *  FORMAT TIDAK BOLEH BERUBAH
 * ============================================================
 *  Baris: nama ............ VERIFIED BUYER ✓
 *         @username · tanggal
 *         ★★★★★  5.0
 *         "komentar"
 *         Product/Jasa ......... Harga      <- SATU BARIS
 *
 *  Dua aturan yang dijaga ketat di bawah:
 *   1. Product di kiri, Harga di kanan, selalu satu baris. Dijamin dengan
 *      `truncate` + `shrink-0` pada harga.
 *   2. Label "Jasa:" / "Harga:" TIDAK PERNAH ditulis.
 *
 *  Warna memakai token design system (`bg-surface`, `text-ink`, `text-brand`,
 *  dst), bukan hex hardcode. `npm run verify:contrast` menolak warna
 *  biru/violet di luar palet, jadi warna apa pun harus lewat token.
 *
 *  Komponen ini tidak punya hook selain `useTestimonials` di bawah, jadi aman
 *  dipakai di Next.js maupun Vite.
 */

export default function TestimonialCard({ item }) {
  const rating = toRating(item?.rating);
  const dateLabel = formatDateLabel(item);

  return (
    <figure
      data-testimonial={item?.id ?? item?.name ?? 'anonim'}
      className="flex h-full min-w-0 flex-col rounded-md border border-line bg-surface p-5"
    >
      {/* Nama + badge */}
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <p className="min-w-0 text-[14px] leading-tight font-semibold text-ink">
          {item?.name ?? 'Customer'}
        </p>
        {item?.demo ? <DemoBadge /> : <VerifiedBuyer />}
      </div>

      {/* @username · tanggal */}
      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12px] text-faint">
        {item?.username ? <span className="break-all">{item.username}</span> : null}
        {item?.username && dateLabel ? <span aria-hidden="true">&middot;</span> : null}
        {dateLabel ? (
          <time dateTime={item?.date ?? undefined} className="whitespace-nowrap">
            {dateLabel}
          </time>
        ) : null}
      </p>

      {/* Bintang + angka */}
      {rating ? (
        <p className="mt-4 flex shrink-0 items-center gap-1.5">
          <span className="flex gap-0.5 text-[13px] leading-none" aria-hidden="true">
            <span className="text-brand">{'★'.repeat(rating)}</span>
            <span className="text-faint">{'★'.repeat(5 - rating)}</span>
          </span>
          <span className="text-[11.5px] font-semibold text-faint">{rating.toFixed(1)}</span>
        </p>
      ) : null}

      {/* Komentar */}
      {item?.text ? (
        <blockquote className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-muted">
          &ldquo;{item.text}&rdquo;
        </blockquote>
      ) : null}

      {/* Product (kiri) + Harga (kanan) - SATU BARIS.
          Baris ini disembunyikan kalau keduanya kosong, supaya tidak pernah
          ada baris kosong yang hanya berisi placeholder. */}
      {item?.product || item?.price ? (
        <figcaption className="mt-4 flex min-w-0 items-center gap-3 border-t border-line-soft pt-3.5">
          {item?.product ? (
            <span className="min-w-0 flex-1 truncate text-[12px] text-faint" title={item.product}>
              {item.product}
            </span>
          ) : null}
          {item?.price ? (
            <span className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-ink">
              {item.price}
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Elemen "VERIFIED BUYER ✓" yang sudah dipakai di desain website. */
function VerifiedBuyer() {
  return (
    <span className="shrink-0 whitespace-nowrap rounded-full border border-line bg-raised px-2 py-px text-[10px] font-semibold tracking-wide text-muted uppercase">
      Verified Buyer <span aria-hidden="true">✓</span>
    </span>
  );
}

/**
 * Badge "Demo" untuk entri yang bukan review asli.
 *
 * Wajib ada: kalau data Discord belum terhubung, section jatuh ke
 * `data/testimonials.js` yang isinya contoh. Tanpa badge ini, review karangan
 * akan tampil seolah-olah review sungguhan.
 */
function DemoBadge() {
  return (
    <span className="shrink-0 whitespace-nowrap rounded-full border border-soon/35 bg-soon/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-soon uppercase">
      Demo
    </span>
  );
}

/** Grid wrapper: pakai list yang sudah dipakai website, atau kolom bila banyak data. */
export function TestimonialGrid({ testimonials, columns = 'auto' }) {
  const items = testimonials ?? [];
  if (items.length === 0) return null;

  const cols = columns === 'auto' ? 'grid gap-5 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-5';

  return (
    <div className={cols}>
      {items.map((item, index) => (
        <TestimonialCard key={item.id ?? index} item={item} />
      ))}
    </div>
  );
}

/**
 * Ambil testimoni dari /api/testimonials.
 *
 * `pollMs` dipakai supaya testimoni baru muncul tanpa refresh manual. Serverless
 * tidak punya koneksi persisten ke Discord, jadi "otomatis" di sini berarti
 * request ulang berkala ke endpoint yang sudah di-cache CDN.
 */
export function useTestimonials({ limit = 12, pollMs = 0, endpoint = '/api/testimonials' } = {}) {
  const [state, setState] = useState({ testimonials: [], loading: true, error: null, connected: false });
  const timer = useRef(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const response = await fetch(`${endpoint}?limit=${limit}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!alive) return;
        // `connected` membedakan "endpoint sehat tapi belum ada data" dari
        // "endpoint gagal". Tanpa itu, channel yang sudah terhubung tapi
        // kosong akan disalin-basahkan dengan pesan "belum terhubung".
        setState({ testimonials: data.testimonials ?? [], loading: false, error: null, connected: true });
      } catch (error) {
        if (!alive) return;
        setState((prev) => ({ ...prev, loading: false, error, connected: false }));
      }
    }

    load();

    if (pollMs > 0) {
      timer.current = setInterval(load, pollMs);
      return () => {
        alive = false;
        clearInterval(timer.current);
      };
    }

    return () => {
      alive = false;
    };
  }, [limit, pollMs, endpoint]);

  return state;
}

/** Rating harus angka bulat 1-5. Di luar rentang itu bar disembunyikan. */
function toRating(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 1 || number > 5) return null;
  return Math.round(number);
}

/** Tampilkan tanggal dalam bentuk yang sama seperti ditulis di Discord. */
function formatDateLabel(item) {
  if (item?.dateDisplay) return item.dateDisplay;
  if (!item?.date) return null;

  const [year, month, day] = String(item.date).split('-').map(Number);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return months[month - 1] ? `${day} ${months[month - 1]} ${year}` : item.date;
}
