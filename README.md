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
public/            # favicon.svg, og-image.png, _headers, brand/, payment/
docs/              # catatan DEVELOPER (tidak ikut ter-deploy ke situs)
tools/             # helper CDP untuk script verifikasi + generator og-image.png
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

`src/data/testimonials.js`. Setiap entri punya:

| Field | Isi | Contoh |
| --- | --- | --- |
| `name` | nama customer | `"Budi Santoso"` |
| `tag` | label di bawah nama | `"Verified Buyer"` |
| `username` | handle (opsional) | `"@budi"` |
| `product` | produk/jasa yang dipakai | `"Discord Server Setup"` |
| `rating` | bintang 1–5 | `5` |
| `date` | tanggal `YYYY-MM-DD` | `"2026-01-15"` |
| `text` | komentar | `"..."` |
| `demo` | `true` = contoh, bukan review asli | `false` |

Tanggal dirender dalam format Indonesia ("15 Januari 2026") memakai
helper `formatDate()` di `src/lib/format.js`.

Untuk menambah review asli: salin satu objek, ubah `demo: false`, isi semua
field dengan data asli. Setelah ada review asli, **hapus seluruh entri demo**.
Section otomatis menyesuaikan judulnya lewat `hasRealTestimonials`.

`rating` dan `date` wajib diisi untuk entri non-demo. Kalau kosong, frontend
sembunyikan barisnya supaya tidak ada bintang atau tanggal yang terasa karangan.

### 5. Showcase

`src/data/showcase.js`. Tempel path foto ke `image` dan simpan fotonya di
`public/`. Selama `image` kosong, kartu tampil sebagai placeholder
"— screenshot belum tersedia —" dan tidak menciptakan kesan palsu.

### 6. Payment

`src/data/payment.js` + folder **`public/payment/`** (sudah dibuat, tinggal diisi).
Panduan lengkap: [`docs/payment-assets.txt`](docs/payment-assets.txt).

Letakkan file dengan nama persis:

```
public/payment/dana.png
public/payment/gopay.png
public/payment/qris.png
```

Saran: kotak 200×200 px (rasio 1:1), PNG/SVG, latar transparan.
Kalau file belum ada, section otomatis menampilkan nama metode sebagai teks
(DANA / GoPay / QRIS) — tidak muncul gambar rusak.

Tidak ada nomor telepon, ID, atau QR code di data ini. Nominal dikirim lewat
proses order di Discord.

### 7. Logo & favicon

Semua branding dikendalikan dari satu tempat di `src/config/site.js`:

```js
brand: {
  logo: '/brand/logo.png',      // logo di store
  logoAlt: 'Logo APISZ STORE',
  showName: false,             // false = logo saja, teks disembunyikan
  logoWidth: 223,              // ukuran asli file (untuk anti layout-shift)
  logoHeight: 100,
  favicon: '/brand/favicon.png',
},
```

Letakkan file-nya di **`public/brand/`** (panduan:
[`docs/brand-assets.txt`](docs/brand-assets.txt)):

| File | Saran ukuran |
| --- | --- |
| `logo.png` | **223×100 px**, latar transparan (PNG) |
| `favicon.png` | 32×32 atau 48×48 px, kotak, tidak transparan |

`showName: false` dipakai karena logomu sudah berupa wordmark lengkap,
jadi teks "APISZ STORE" tidak perlu diulang. Setel `true` kalau suatu saat
mau teksnya muncul lagi.

Kalau nama file atau ukuran logomu berubah, sesuaikan `logoWidth` /
`logoHeight` — dua angka itu dipakai browser untuk menyisakan ruang yang
benar sebelum gambar selesai dimuat, supaya navbar tidak melompat.
Format jpg/webp/svg juga bisa selama path di config ikut diubah.

Logo 223×100 itu rasio lebar (2.23:1), jadi komponen Logo memakai
tinggi gambar dengan `width: auto`, bukan memaksa kotak. Dipaksa kotak,
logomu akan tampil kecil dengan ruang kosong di atas dan bawah.

Ukuran logo (kelas Tailwind di `SIZES` pada `Logo.jsx`):

| Pemakaian | Mobile | Desktop |
| --- | --- | --- |
| Navbar (`sm`) | 36px | 44px |
| Footer (`md`) | 48px | 48px |

Navbar sengaja ikut dinaikkan (72px mobile / 80px desktop) supaya logo
sebesar ini tidak terpotong. Kalau menaikkan `SIZES` lagi, navbar harus
ikut naik — dan tinggi tombol logo harus tetap ≥ 40px agar target
sentuh lolos WCAG 2.5.8.

**Fallback aman.** Kalau file belum ada:
- logo → otomatis pakai wordmark teks "APISZ STORE"
- favicon → otomatis pakai icon bawaan `public/favicon.svg`

Jadi mengunggah file Half jadi tidak merusak tampilan. Favicon dicek
dengan HEAD request **plus** verifikasi `content-type` `image/*`, karena
Vite dev server menjawab HTTP 200 dengan `index.html` untuk path yang
tidak ada — kalau cuma cek status, favicon akan tertukar ke file bogus.

### 8. Warna, font, dan gaya

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
Radius kecil `10px` - tampilan Discord, bukan pill besar.
Status punya warna sendiri-sendiri; hanya `custom` yang ungu, itu disengaja.

Animasi memakai `Reveal` (opacity + translateY + scale tipis). Sengaja
**tidak** memakai blur atau `backdrop-filter` - efek seperti itu bikin
halaman terasa berat. Semua animasi dimatikan otomatis kalau pengguna
mengaktifkan *reduced motion*, dan konten tetap tampil kalau
`IntersectionObserver` tidak tersedia.

### Fokus posisi saat scroll

Dua penanda posisi supaya user selalu tahu dia sedang di bagian mana:

| Fitur | Letak | Sumber |
| --- | --- | --- |
| Progress bar orange | tepi bawah navbar, 0-100% | `useScrollPosition()` |
| Garis aksen orange | sisi atas section yang sedang aktif | `useScrollPosition()` + `Section.jsx` |
| Menu aktif orange | navbar desktop & mobile | scroll-spy di `Navbar.jsx` |

Selain itu, tiap kartu masuk viewport satu per satu (`Reveal`) dengan
urutan sedikit delay, jadi halaman terasa hidup saat digulir.
`useScrollPosition()` mengembalikan `{ progress, activeId }` dan dipakai
bersama oleh navbar dan setiap `Section`.

---

## Section halaman

`Home` -> `Services` -> `SA-MP` -> `Other Services` -> `Products` -> `Pricing` ->
`Showcase` -> `Testimonials` -> `How To Order` -> `Payment` -> `FAQ` -> `CTA/Contact`

Navigasi bisa juga dibuka langsung lewat hash, misal
`http://localhost:8080/#pricing`.

---

### 9. Deploy ke Cloudflare

Situs ini **live** di:

**https://apiszstore.zackahd020410.workers.dev**

```bash
npm run deploy            # build + wrangler deploy (production)
npm run deploy:preview    # -> apiszstore-preview.<akun>.workers.dev
```

`npm run deploy` dibungkus `tools/deploy.mjs` supaya token dibaca dari
file lalu divalidasi bentuknya sebelum dipakai. Untuk mencoba-coba
tanpa menyentuh production, pakai `deploy:preview`.

**Autentikasi.** Token dibaca dari `CLOUDFLARE_API_TOKEN`, atau dari file
`.cloudflare-token` (sudah masuk `.gitignore`) yang isinya **hanya**
tokennya. Jangan pernah menaruh token di source code atau commit.

Token dibuat di Dashboard Cloudflare -> My Profile -> API Tokens ->
Create Token -> template **Edit Cloudflare Workers** (wajib ada
permission **Cloudflare Pages: Edit**).

> `wrangler` otomatis memigrasikan proyek ke Cloudflare Workers: menambah
> `@cloudflare/vite-plugin` + `wrangler` sebagai devDependency, membuat
> `wrangler.jsonc`, dan memindahkan "Pages" ke bawah "Workers". Akibatnya
> URL-nya `*.workers.dev`, bukan `*.pages.dev`.

**Penting — `assets.not_found_handling` di `wrangler.jsonc` sengaja
`"none"`.** Website ini tidak punya router, jadi tidak butuh fallback ke
`index.html`. Kalau dinyalakan `single-page-application`, setiap request
yang tidak ada dijawab `index.html` dengan status **200**, bukan 404 —
browser lalu mencoba merender HTML sebagai gambar, dan aset yang hilang
tidak pernah terlihat di monitoring. Aset hilang harus tetap 404.

**Domain.** `apiszstore.com` belum diarahkan ke mana pun dan **tidak
dipakai** di project ini. Custom domain ditambahkan lewat dashboard
Workers & Pages -> project `apiszstore` -> Domains & Routes, setelah
nameserver domain diarahkan ke Cloudflare.

Setelah dapat domain asli, ganti URL di tiga tempat di `index.html`
(canonical, `og:url`, `url` di JSON-LD), lalu jalankan `npm run check:url`.
Skrip itu gagal kalau ketiganya tidak menunjuk host yang sama — kalau
selisih, search engine dan WhatsApp/FB memakai URL berbeda dari yang
pengunjung lihat, dan share preview rusak.

**Verifikasi berlapis:**

| Perintah | Yang diuji |
| --- | --- |
| `npm run verify` | dev server: layout, kontras, konten (117 cek) |
| `npm run verify:dist` | build statis lewat static server (25 cek) |
| `npm run verify:live` | situs live: header, SEO, aset, 404 (27 cek) |
| `npm run check:url` | canonical / og:url / JSON-LD sinkron |

**Caching & header** diatur di `public/_headers`. Aset `/assets/*` punya
hash di nama file jadi di-cache `immutable` selama setahun; `index.html`
selalu `no-cache` supaya deploy baru langsung terlihat. File `_headers`
sendiri tidak serves publik (Cloudflare memakainya saat deploy).

**Preview link media sosial.** `og-image` memakai PNG 1200x630
(`npm run og:png` untuk regenerate dari `og-image.svg`) — WhatsApp,
Facebook, dan X **tidak** merender SVG, jadi preview-nya akan kosong
kalau og:image berupa `.svg`.

## Checklist sebelum publish

- [ ] `discord` di `src/config/site.js` diganti invite asli
- [ ] `social` (TikTok / Instagram) diisi, atau dibiarkan placeholder
- [ ] Logo payment (`dana.png`, `gopay.png`, `qris.png`) ditaruh di `public/payment/`
- [ ] Logo store `public/brand/logo.png` sudah diunggah
- [ ] Favicon `public/brand/favicon.png` sudah diunggah
- [ ] `src/data/products.js` diisi produk asli (hapus array kosong)
- [ ] Testimonial demo diganti review asli (lalu hapus entri demo)
- [ ] Screenshot showcase ditempel ke `public/`
- [ ] Harga dan `status` setiap layanan sudah dikonfirmasi
- [ ] `npm run build` dan `npm run verify` lolos
- [ ] `npm run verify:dist` lolos
- [ ] `npm run verify:live` lolos
- [ ] `npm run check:url` menunjuk domain final
- [ ] API token Cloudflare sudah di-revoke dan diganti (kalau sempat
      dipublish lewat chat atau screenshot)
