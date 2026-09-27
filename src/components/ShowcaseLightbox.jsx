import Icon from './Icon.jsx';
import Modal from './Modal.jsx';

/**
 * Lihat satu gambar showcase ukuran penuh.
 *
 * ============================================================
 *  SYARAT UTAMA: GAMBAR TIDAK BOLEH TERPOTONG
 * ============================================================
 *  Card kecil memakai `object-cover` supaya grid tetap rapat. Di sini
 *  tidak boleh: memakai `object-contain` dengan tinggi yang dibatasi viewport
 *  dan latar gelap. Jadi gambar dissentuh user yang lebar maupun yang tinggi
 *  akan terlihat utuh, tanpa bagian yang hilang di tepi.
 *
 *  "Tanpa terpotong" di sini berarti:
 *   - tidak ada `max-h` yang lebih kecil dari tinggi viewport,
 *   - `object-contain`, bukan `object-cover`,
 *   - `width: auto` supaya gambar langsam tidak dipaksa melar.
 *
 *  Modal yang dipakai ulang supaya Escape, klik backdrop, kuncian scroll body,
 *  dan pengembalian fokus tetap konsisten dengan modal produk/service.
 *
 *  Metadata (judul, kategori, status, harga, link ke pesan Discord asli)
 *  ditampilkan di bawah gambar, bukan bergerak di atasnya, supaya tidak
 *  menutupi bagian gambar yang justru sedang dilihat user.
 */
export default function ShowcaseLightbox({ item, onClose }) {
  if (!item) return null;

  return (
    <Modal
      open
      onClose={onClose}
      labelledBy="showcase-detail-title"
      panelClassName="max-w-4xl sm:max-h-[92dvh]"
    >
      {/* Latar gelap supaya tepi gambar yang transparan tetap terbaca. */}
      <div className="grid min-h-0 flex-1 place-items-center overflow-auto bg-black/80 p-3 sm:p-5">
        <img
          src={item.image}
          alt={item.title}
          className="block h-auto max-h-[52dvh] w-auto max-w-full object-contain sm:max-h-[62dvh]"
        />
      </div>

      <div className="shrink-0 border-t border-line bg-raised/60 px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h2 id="showcase-detail-title" className="text-[15px] font-bold text-ink">
              {item.title}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold tracking-[0.14em] text-brand uppercase">
                {item.category}
              </span>
              {item.statusLabel ? (
                <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10.5px] font-semibold text-muted">
                  {item.statusLabel}
                </span>
              ) : null}
              {item.price ? (
                <span className="text-[12.5px] font-bold text-brand">{item.price}</span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {item.messageUrl ? (
              <a
                href={item.messageUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-[12.5px] font-semibold text-muted transition-colors hover:border-brand/45 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <Icon name="external" size={14} />
                Lihat di Discord
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 items-center rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-muted transition-colors hover:border-brand/45 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Tutup
            </button>
          </div>
        </div>

        {item.description ? (
          <p className="mt-2.5 max-h-24 overflow-y-auto text-[13px] leading-relaxed text-muted">
            {item.description}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
