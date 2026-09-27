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

### 9. Deploy ke Vercel

Situs ini berjalan di **Vercel**. Repo ini di-push ke GitHub, lalu Vercel
 otomatis build tiap kali ada push ke `main`.

```bash
npm run build      # build lokal, sama dengan yang Vercel jalankan
npm run preview    # serve hasil build untuk cek sebelum push
```

Tidak ada CLI deploy yang harus dijalankan manual. Yang perlu disiapkan
hanya di dashboard Vercel:

| Project setting | Nilai |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

Semuanya sudah ditulis di `vercel.json` jadi biasanya tidak perlu diubah
manual. `api/testimonials.js` otomatis jadi endpoint `/api/testimonials`, dan
`api/showcase.js` jadi `/api/showcase`.

#### Environment variable

Project -> Settings -> Environment Variables:

| Nama | Wajib | Isi |
| --- | --- | --- |
| `DISCORD_BOT_TOKEN` | ya | Token bot dari Discord Developer Portal |
| `DISCORD_CHANNEL_ID` | ya | Klik kanan channel -> Copy Channel ID (testimoni) |
| `TESTIMONIAL_EMBED_TITLE` | tidak | Saring embed by judul, mis. `Rating` |
| `DISCORD_SHOWCASE_CHANNELS` | tidak | Id channel showcase, dipisah koma |
| `DISCORD_GUILD_ID` | tidak | Id server, untuk link pesan Discord |

Salin `.env.example` jadi `.env.local` untuk pengembangan lokal.

> **Token tidak boleh masuk GitHub.** Repo ini publik, jadi siapa pun bisa
> membaca isinya. Credential hanya disimpan di Environment Variables Vercel.
> Kalau token pernah ikut ter-push atau ter-posts, revoke dan ganti.

#### Domain

Project -> Settings -> Domains -> Add. Domain tidak harus صعوبة di tempat
yang sama dengan repo; Vercel memberi sertifikat HTTPS otomatis.

Setelah dapat domain asli, ganti URL di tiga tempat di `index.html`
(canonical, `og:url`, `url` di JSON-LD), lalu jalankan `npm run check:url`.
Skrip itu gagal kalau ketiganya tidak menunjuk host yang sama - kalau
selisih, search engine dan WhatsApp/FB memakai URL berbeda dari yang
pengunjung lihat, dan share preview rusak.

`tools/site-url.mjs` membaca canonical di `index.html` sebagai sumber URL
tunggal, jadi tidak ada lagi tool yang hardcode URL sendiri.

**Penting - jangan pakai rewrite wildcard di `vercel.json`.** Website ini
tidak punya router, jadi tidak butuh fallback ke `index.html`. Kalau
ditambahkan, setiap request yang tidak ada dijawab `index.html` dengan
status **200**, bukan 404 - browser lalu mencoba merender HTML sebagai
gambar, dan aset yang hilang tidak pernah terlihat di monitoring.
Aset hilang harus tetap 404.

#### Verifikasi berlapis

| Perintah | Yang diuji |
| --- | --- |
| `npm run verify` | dev server: layout, kontras, konten (122 cek) |
| `npm test` | parser embed Discord + endpoint (115 cek) |
| `npm run verify:dist` | build statis lewat static server (25 cek) |
| `npm run verify:live` | situs live: header, SEO, aset, 404 (27 cek) |
| `npm run check:url` | canonical / og:url / JSON-LD sinkron |

`npm run verify` dan `npm run verify:dist` butuh server yang jalan
terlebih dulu (`npm run dev`, atau `npx serve dist -l 8090`).

**Caching & header** diatur di `vercel.json`. Aset `/assets/*` punya hash di
nama file jadi di-cache `immutable` selama setahun; `index.html` selalu
`no-cache` supaya deploy baru langsung terlihat. `vercel.json` sendiri
tidak serves publik, jadi `/vercel.json` harus balas 404.

**Preview link media sosial.** `og-image` memakai PNG 1200x630
(`npm run og:png` untuk regenerate dari `og-image.svg`) - WhatsApp,
Facebook, dan X **tidak** merender SVG, jadi preview-nya akan kosong
kalau og:image berupa `.svg`.

### 10. Testimoni dari Discord

Section `Testimonials` membaca data langsung dari channel Discord lewat
`/api/testimonials` - **tanpa database**. Testimoni lama dan testimoni baru
ikut terbaca, jadi tidak ada input manual per testimoni.

```
Discord channel  ->  /api/testimonials (Vercel)  ->  TestimonialCard
   embed             token di env, di-cache        format website
```

Bot Discord butuh izin **View Channel**, **Read Message History**, dan
**Message Content Intent**. Tanpa itu API membalas `403`.

Embed dibaca dari `embed.fields` maupun `embed.description`, dan mendukung
label `Customer`/`Nama`/`Pembeli`, `Rate`/`Bintang`, `Product/Jasa`/`Jasa`/
`Layanan`, `Harga`, `Komentar`, `Tanggal`. `Invoice` sengaja tidak pernah
dikembalikan ke card. `Harga` diteruskan apa adanya, jadi `Rp19.500`
tidak pernah jadi `Rp 19.500`.

Vercel serverless tidak punya koneksi persisten ke Discord, jadi "otomatis"
berarti **sekitar 60 detik**, bukan real-time. Endpoint mengirim
`Cache-Control: s-maxage=60`, jadi CDN Vercel yang menyegarkan. Paksa
ambil data baru dengan `?refresh=1`.

Kalau endpoint belum dikonfigurasi, section otomatis jatuh ke
`src/data/testimonials.js` dan memakai badge "Demo" supaya tidak pernah
disalahartikan sebagai review asli.

Detail lengkap ada di `docs/testimonials-discord.md`.


### 11. Showcase dari Discord

Section `Showcase` membaca produk langsung dari channel Discord lewat
`/api/showcase` - **tanpa database**. Produk yang sudah diposting sebelum
integration ini ikut tampil, dan produk baru ikut muncul tanpa input manual.

```
#product-samp    ┐
                 ├─>  /api/showcase (Vercel)  ->  Section Showcase
#digital-service ┘      token di env, di-cache       card yang sudah ada
```

Card, filter, layout, warna, dan animasi Showcase **tidak berubah**. Yang
berubah hanya data yang masuk ke dalamnya, dari placeholder ke produk asli.
Kalau endpoint belum dikonfigurasi atau Discord sedang error, section otomatis
jatuh ke `src/data/showcase.js` supaya tidak pernah kosong.

Isi channel yang dibaca:

```
✦ Textdraw Smartphone ✦

FOR SALE
Harga: Rp19.500

High-quality textdraw design
dirancang untuk memberikan visual yang clean, modern, dan elegan
pada server GTA SAMP Anda.

Preview → #textdraw

[IMAGE]
```

Sumber data dibaca berurutan dari `embed.title`, `embed.fields`,
`embed.description`, lalu `message.content` - jadi produk yang dikirim pakai
embed maupun pesan biasa sama-sama terbaca.

Yang dijamin parser:

- **Harga tidak pernah dikarang.** `Exclusive Preview` dan `Tidak Untuk
  Dijual` selalu `price: null`. Angka polos (`Terbit tahun 2026`, `No. 3`)
  tidak pernah salah jadi harga.
- **`Rp19.500` diteruskan apa adanya**, tidak pernah jadi `Rp 19.500`.
- **Gambar produk memakai attachment pertama**, tidak pernah diganti gambar
  acak. Kalau tidak ada attachment, `image` `null` dan card memakai
  placeholder berlabel kategori yang memang sudah ada.
- **`Preview → #textdraw` tidak dianggap status**, dan baris ajakan bertindak
  (`Silakan ... melalui → #ticket`) tidak ikut jadi deskripsi.
- **Percakapan biasa ditolak** - hanya pesan yang punya gambar, judul berdekor
  (`✦ ... ✦` atau `# ✦ ... ✦`), atau embed berlabel yang dianggap produk.
- **Markup Discord dibuang** - `<#channel>`, `<@user>`, `<a:emoji:123>`,
  `@everyone`, dan heading markdown tidak pernah ikut ke judul atau deskripsi.

Kategori mengikuti filter yang **sudah ada** (`SA-MP`, `Discord`, `Bot`,
`Website`, `UI`) dan tidak pernah bernilai baru. Urutannya: `Kategori:` di
embed -> kata kunci judul -> pin kategori di env -> kata kunci nama channel
(`product-samp` -> SA-MP, `digital-service` -> Discord) -> `UI`. Hanya judul
dan nama channel yang dibaca, bukan deskripsi - deskripsi di
`#digital-service` hampir selalu menyebut "desain" dan "server Discord" yang
akan menutupi kategori sesungguhnya.

Pin di env dipakai sebagai **nilai default channel, bukan kunci mati** di atas
isi produk. Satu pin untuk satu channel selalu lebih kasar daripada isi tiap
produknya: kalau `#product-samp` dipin `SA-MP`, produk "Digital Speedometer"
tetap jadi `UI` karena judulnya menyebut speedometer. Kalau pengin pin selalu
menang, tulis kategori eksplisit di embed (field `Kategori:`) - baris itu
selalu menang atas semua tebakan.

```
DISCORD_SHOWCASE_CHANNELS=1553622067746840709:SA-MP,1553622274001735782:Discord
```

Formatnya `<idChannel>:<Kategori>`, dan kategorinya **harus salah satu dari
lima filter yang sudah ada** - `SA-MP`, `Discord`, `Bot`, `Website`, `UI`.
Huruf besar-kecil tidak berpengaruh, jadi `samp` dan `sa-mp` sama-sama
dibaca `SA-MP`. Nilai yang tidak dikenal (mis. `digital`) tidak menggagalkan
apa pun - kategorinya dikosongkan lalu ditebak otomatis - tapi muncul di field
`unknown` pada respons endpoint supaya kelihatan, bukan hilang diam-diam.

Discord tidak bisa menyaring pesan, jadi tiap channel dipindai dari pesan
terbaru ke lama memakai `before` - inilah yang membuat produk lama ikut
terbaca. Default `maxPages=2` (200 pesan per channel); naikkan dengan
`?limit=50&maxPages=10`. `truncated: true` artinya histori belum habis
dibaca, `false` artinya channel sudah tuntas.

"otomatis" berarti **sekitar 1-2 menit**: endpoint mengirim
`Cache-Control: s-maxage=60` dan section memanggil ulang tiap 90 detik. Paksa
ambil data baru dengan `?refresh=1`.

Detail lengkap ada di `docs/showcase-discord.md`.


## Checklist sebelum publish

- [ ] `discord` di `src/config/site.js` diganti invite asli
- [ ] `social` (TikTok / Instagram) diisi, atau dibiarkan placeholder
- [ ] Logo payment (`dana.png`, `gopay.png`, `qris.png`) ditaruh di `public/payment/`
- [ ] Logo store `public/brand/logo.png` sudah diunggah
- [ ] Favicon `public/brand/favicon.png` sudah diunggah
- [ ] `src/data/products.js` diisi produk asli (hapus array kosong)
- [ ] Testimonial demo diganti review asli (lalu hapus entri demo)
- [ ] Harga dan `status` setiap layanan sudah dikonfirmasi
- [ ] `npm run build` dan `npm run verify` lolos
- [ ] `npm run verify:dist` lolos
- [ ] `npm run verify:live` lolos
- [ ] `npm run check:url` menunjuk domain final
- [ ] `DISCORD_BOT_TOKEN` + `DISCORD_CHANNEL_ID` sudah di-set di Vercel
- [ ] `/api/testimonials` balas 200 di URL production
- [ ] `DISCORD_SHOWCASE_CHANNELS` sudah di-set di Vercel
- [ ] `/api/showcase` balas 200 di URL production
- [ ] Token Cloudflare yang pernah dipublish sudah di-revoke
- [ ] Deployment Cloudflare lama sudah dihapus dari dashboard
- [ ] Tidak ada credential di repo (repo ini publik)
