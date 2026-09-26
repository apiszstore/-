# APISZ STORE

Landing page untuk **APISZ STORE** — layanan Digital Service (Discord, Custom Bot),
SA-MP, Website, Mapping, dan Streamer.

Tema: **Discord Dark Mode** dengan aksen **orange**, dark-only.
Dibangun dengan **React 19 + Vite 7 + Tailwind CSS v4 + Lucide React**.

---

## Menjalankan website

Butuh **Node.js 20.19+** (atau 22.12+).

```bash
npm install     # pasang dependency
npm run dev     # jalankan mode pengembangan
```

Buka `http://localhost:8080/`.

Server otomatis terbuka di semua jaringan (port 8080), jadi HP atau laptop
lain di Wi-Fi yang sama bisa diakses lewat alamat IP yang ditampilkan terminal,
misalnya `http://192.168.x.x:8080/`.

### Perintah lain

```bash
npm run build            # build produksi ke folder dist/
npm run preview          # preview hasil build
npm run verify           # cek layout + kontras warna (butuh dev server aktif)
npm run verify:contrast  # audit kontras WCAG + target sentuh saja
```

`npm run verify` **butuh `npm run dev` berjalan di terminal lain**, karena
scriptnya membuka `http://localhost:8080/` dengan Microsoft Edge headless.

---

## Struktur folder

```
src/
├─ components/     # semua komponen UI (satu file per komponen)
├─ config/         # konfigurasi global: link, nama brand, status
├─ data/           # semua isi konten: harga, layanan, produk, FAQ, dll
├─ hooks/          # useOrder (tombol order), dll
├─ lib/            # utilitas murni: format harga, scroll, buka link
├─ App.jsx         # merangkai seluruh section
└─ index.css       # design tokens (warna, font, radius, shadow)
public/            # favicon.svg, og-image.svg
tools/             # helper CDP untuk script verifikasi
```

Aturan sederhana: **komponen tidak boleh menyimpan harga atau link langsung**,
semua datang dari `src/data/` dan `src/config/`.

---

## Mengubah isi website

### 1. Link Discord (WAJIB diisi sebelum publish)

Buka `src/config/site.js`, ganti:

```js
discord: 'https://discord.gg/ISI_LINK_DISCORD',
```

Selama masih berisi `ISI_LINK`, semua tombol **Order Now** tidak akan membuka
link apa pun — muncul toast info sebagai ganti. Jadi tidak ada risiko
terkirim ke link yang salah.

### 2. Harga & layanan

| File | Isi |
| --- | --- |
| `src/data/services.js` | Discord Server Setup, Custom Bot, Bundle |
| `src/data/sampServices.js` | Jasa SA-MP, Custom SA-MP, 3 Paket On Server |
| `src/data/otherServices.js` | Website, Mapping, Streamer |

Harga ditulis sebagai angka **tanpa titik dan tanpa Rp**, contoh `10000`.
Isi `null` kalau belum ada harga resmi → otomatis tampil **Custom Pricing**.

Field `status` bisa:

| Nilai | Tampil sebagai |
| --- | --- |
| `available` | Available (hijau) |
| `soon` | Coming Soon (kuning) |
| `custom` | Custom Pricing (biru) |
| `unavailable` | Unavailable (merah) |

> Jangan menandai `available` kalau layanan sedang tidak dibuka.

### 3. Produk / katalog

`src/data/products.js`..Array `products` sengaja **kosong** sampai ada produk
asli. Begitu diisi, katalog otomatis aktif: pencarian, filter kategori, dan
modal detail. Status memakai nilai yang sama seperti di atas.

### 4. Testimonial

`src/data/testimonials.js`. Data contoh memakai `demo: true` dan ditampilkan
dengan badge **Demo**, plus rating kosong (tidak ada bintang palsu).

Untuk menambah review asli: salin satu objek, ubah `demo: false`, isi `name`,
`username`, dan `rating` (angka 1–5) dengan data asli. Setelah ada review
asli, hapus seluruh entri demo. Section otomatis menyesuaikan judulnya
(`hasRealTestimonials`).

### 5. Showcase

`src/data/showcase.js`. Tempel path foto ke `image`.filtrationScreenshot
disimpan di `public/`. Selama `image` kosong, kartu tampil sebagai placeholder
"— screenshot belum tersedia —" dan tidak menciptakan kesan palsu.

### 6. Payment

`src/components/Payment.jsx` **sengaja tidak menampilkan nomor DANA/GoPay
maupun QR code**. Filling detail ada di `src/config/site.js` (`contact`).
Tambahkan nomor hanya setelah benar-benar siap menerima order.

### 7. Warna, font, dan gaya

Semua token ada di blok `@theme` pada `src/index.css`. Mengubah satu nilai
mengubah seluruh website.

> **Penting:** jangan menamai token warna `base`. Token bernama `base` akan
> menabrak utility ukuran font `text-base`, sehingga `text-base` berubah
> menjadi utility warna dan teks jadi tidak terlihat. Warna background utama
> memakai nama `canvas` (`bg-canvas`).

---

## Design system

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `canvas` | `#313338` | background utama halaman |
| `raised` | `#2B2D31` | navbar, footer, section sekunder |
| `surface` | `#1E1F22` | card, modal, panel |
| `well` | `#17181A` | input, area tenggelam |
| `line` | `#3F4147` | border utama |
| `ink` | `#F2F3F5` | teks utama |
| `muted` | `#B5BAC1` | teks sekunder |
| `faint` | `#9A9EA3` | teks tersier |
| `brand` | `#FF8A00` | aksen orange |
| `brand-hover` | `#FF9F2D` | hover |
| `brand-ink` | `#1A1206` | teks di atas orange |

Font: **Sora** (judul), **Plus Jakarta Sans** (body), **JetBrains Mono** (angka/harga).
Radius kecil `10px` — tampilan Discord, bukan pill besar.
Status punya warna sendiri-sendiri; hanya `custom` yang ungu, itu disengaja.

Animasi memakai `animate-rise` / `animate-fade` dan otomatis dimatikan kalau
pengguna mengaktifkan *reduced motion*.

---

## Section halaman

`Home` · `Services` · `SA-MP` · `Other Services` · `Products` · `Pricing` ·
`Showcase` · `Testimonials` · `How To Order` · `Payment` · `FAQ` · `CTA/Contact`

Navigasi bisa juga dibuka langsung lewat hash, misal
`http://localhost:8080/#pricing`.

---

## Checklist sebelum publish

- [ ] `discord` di `src/config/site.js` diganti invite asli
- [ ] `social` (TikTok / WhatsApp) diisi, atau dibiarkan placeholder
- [ ] Nomor pembayaran diisi di `src/components/Payment.jsx`
- [ ] `src/data/products.js` diisi produk asli (hapus array kosong)
- [ ] Testimonial demo diganti review asli
- [ ] Screenshot showcase ditempel ke `public/`
- [ ] Harga dan `status` setiap layanan sudah dikonfirmasi
- [ ] `npm run build` dan `npm run verify` lolos
