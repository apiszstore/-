# APISZ STORE

**Digital Service & SA-MP Service**

Solusi jasa digital, Discord, dan SA-MP dengan harga terjangkau untuk pelajar.

Dibuat dengan **React 19 + Vite**. Ringan, tanpa library UI tambahan, dan semua
data mudah diedit tanpa menyentuh komponen.

---

## Menjalankan

```bash
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite (default `http://localhost:5173`).

Perintah lain:

```bash
npm run build     # build produksi ke folder dist/
npm run preview   # cek hasil build secara lokal
```

---

## Struktur Folder

```
web-store/
|-- index.html               # meta title, description, Open Graph, favicon
|-- vite.config.js
|-- public/
|   |-- favicon.svg          # logo/favicon (ganti dengan file kamu)
|   `-- og-image.svg         # gambar preview saat link dibagikan
`-- src/
    |-- main.jsx
    |-- App.jsx              # routing + urutan section
    |-- config.js            # <<< SEMUA LINK KONTAK ADA DI SINI
    |-- data/
    |   |-- services.js      # daftar layanan, paket bundle, paket on-server
    |   |-- products.js      # katalog produk (store)
    |   |-- testimonials.js  # testimoni
    |   |-- showcase.js      # project showcase
    |   `-- faq.js           # pertanyaan FAQ
    |-- context/
    |   |-- AppContext.jsx   # route, navigate, order modal
    |   `-- ToastContext.jsx # notifikasi
    |-- lib/
    |   |-- router.js        # router sederhana berbasis hash
    |   |-- sections.js      # daftar section untuk scroll
    |   |-- links.js         # cek placeholder + format Rupiah
    |   |-- scroll.js
    |   |-- clipboard.js
    |   `-- useExternalLink.jsx
    |-- components/          # Navbar, Hero, sections, modal, dll
    `-- styles/index.css     # seluruh design system
```

---

## Cara Mengubah Data

### 1. Link kontak, taglines, statistik

Buka `src/config.js`.

```js
social: {
  discord:  { label: 'APISZ STORE', invite: 'YOUR_DISCORD_INVITE' },
  whatsapp: { label: 'Coming Soon', link: 'YOUR_WHATSAPP' },
  tiktok:    'YOUR_TIKTOK',
  instagram: 'YOUR_INSTAGRAM',
  youtube:   'YOUR_YOUTUBE',
},
```

Selama nilainya masih `YOUR_...` atau `COMING SOON`, tombol tersebut **tidak
akan membuka halaman palsu**. Instead, muncul notifikasi bahwa tautannya belum
diisi. Jadi website aman dipublish walau data belum lengkap.

Ganti juga angka statistik hero di bagian `stats`:

```js
stats: [
  { id: 'projects', value: '50+', label: 'Projects' },
  { id: 'customers', value: '30+', label: 'Customers' },
  { id: 'services', value: '10+', label: 'Services' },
  { id: 'response', value: 'Fast', label: 'Response' },
],
```

### 2. Nomor pembayaran

`src/config.js` bagian `payment.methods`. Isi `accountName` dan
`accountNumber`. Selama kosong / masih `YOUR_...`, kartu payment menampilkan
status **COMING SOON** dan tidak menampilkan nomor apa pun.

### 3. Menambah produk

Buka `src/data/products.js`, salin satu blok produk, lalu ubah `id`
(harus unik), `name`, dan isinya.

```js
{
  id: 'discord-store-server',   // tanpa spasi, unik
  name: 'Discord Store Server',
  category: 'discord',          // all | discord | samp | textdraw | filescript | mapping | other
  status: 'available',          // available | limited | out-of-stock | custom
  icon: 'discord',              // nama ikon dari components/Icons.jsx
  priceLabel: 'Rp10.000',
  priceValue: 10000,            // boleh null kalau harga custom
  priceNote: 'Mulai dari',
  short: 'Deskripsi singkat untuk kartu.',
  description: 'Deskripsi panjang untuk halaman detail.',
  features: ['Fitur 1', 'Fitur 2'],
  requirements: ['Syarat 1', 'Syarat 2'],
  faq: [{ q: 'Pertanyaan?', a: 'Jawaban.' }],
}
```

Produk baru langsung muncul di halaman `#/products`, bisa dicari, difilter, dan
halaman detailnya otomatis ada di `#/product/<id>`.

### 4. Mengubah harga

Harga ada di dua tempat, dan sengaja dipisah:

| Data | File | Dipakai di |
| --- | --- | --- |
| Harga kartu layanan | `src/data/services.js` | Section OUR SERVICES + section detail |
| Harga paket bundle | `services.js` -> `bundlePackages` | Section PRICING |
| Harga paket on-server | `services.js` -> `onServerPackages` | Section SA-MP |
| Harga produk store | `src/data/products.js` | Halaman Products |

`priceValue` dipakai untuk informasi tambahan (`Rp10.000` -> `10000`). Isi
`null` kalau harga custom.

### 5. Testimoni dan showcase

- `src/data/testimonials.js` - masih data contoh. Setelah diganti dengan data
  asli, ubah `dataDummy` menjadi `false` supaya banner "data contoh" hilang.
- `src/data/showcase.js` - `image` boleh dikosongkan, nanti muncul visual
  placeholder otomatis. Isi dengan URL foto asli bila ada.

### 6. FAQ

Tambah objek baru di `src/data/faq.js`:

```js
{
  id: 'f10',
  question: 'Pertanyaan baru?',
  answer: 'Jawaban lengkapnya di sini.',
}
```

---

## Struktur URL

Website memakai router hash sederhana, jadi tidak butuh konfigurasi server.

| URL | Isi |
| --- | --- |
| `#/` | Home (semua section) |
| `#/products` | Halaman Store |
| `#/product/discord-store-server` | Detail produk |
| `#/services`, `#/pricing`, `#/faq`, ... | Home + scroll ke section tersebut |

---

## Fitur

- Navbar sticky dengan efek blur/transparan saat scroll, hamburger di mobile
- Hero dengan statistik ( configurable ) dan mockup dashboard
- Katalog layanan Digital Service dan SA-MP Service
- Katalog produk dengan **search** dan **filter kategori**
- Halaman detail produk: deskripsi, features, requirements, FAQ produk, status
- Status produk: AVAILABLE, LIMITED, OUT OF STOCK, CUSTOM
- Alur order 3 langkah: pilih layanan -> pilih platform -> arahkan ke Discord
- Payment method DANA / GoPay / QRIS (nomor ditampilkan hanya setelah diisi)
- Project showcase dengan filter kategori dan modal
- Testimoni dengan rating, tombol "VIEW ALL TESTIMONIALS"
- Banner promosi STUDENT FRIENDLY PRICE dan CUSTOM REQUEST
- FAQ accordion, about, contact, footer
- Loading splash, toast notification, scroll-to-top button
- Scroll reveal (fade in + slide up), menghormati `prefers-reduced-motion`
- SEO: title, meta description, Open Graph, Twitter card, JSON-LD, semantic HTML
- Responsive: 4/3/2/1 kolom, tombol full width di mobile, tidak ada text overflow

---

## Alur Order

Sengaja tanpa payment gateway dan tanpa database. Alurnya:

1. User memilih layanan / produk
2. Klik **ORDER** -> muncul modal 3 langkah
3. User isi detail request (opsional) dan pilih platform (Discord, WhatsApp,
   TikTok, Instagram, YouTube)
4. Detail order bisa disalin ke clipboard lalu dikirim ke admin

Admin yang mengeksekusi pembayaran secara manual lewat DANA / GoPay / QRIS
setelah detail pesanan dikonfirmasi.

---

## Catatan Teknis

- Tidak ada library UI, ikon, atau animasi eksternal. Semua SVG ikon ada di
  `src/components/Icons.jsx`.
- Animasi hanya transform + opacity, jadi ringan untuk perangkat low-end.
- Kalau `npm install` memberi peringatan `allow-scripts` untuk `esbuild` di
  npm 11, jalankan `npm approve-scripts esbuild` lalu install ulang.
- Belum ada login, admin dashboard, payment gateway, atau database.
