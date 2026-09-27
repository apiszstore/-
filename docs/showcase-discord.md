# Showcase Discord

Produk showcase diambil langsung dari channel Discord ke website. **Tidak ada
database.** Discord yang jadi sumber data, jadi produk yang sudah diposting
sebelum integration ini pun ikut tampil, dan produk baru otomatis ikut muncul
begitu dikirim ke channel — tanpa input manual.

```
Discord #product-samp   ┐
                         ├─>  /api/showcase (Vercel)  ->  Section Showcase
Discord #digital-service ┘      token di env, di-cache        card yang sudah ada
```

## File

| File | Fungsi |
| --- | --- |
| `api/showcase.js` | Endpoint Vercel. Baca channel, kirim JSON. Token tidak pernah keluar ke browser. |
| `src/lib/discord.js` | `fetchShowcaseProducts()`. Paginasi mundur untuk baca histori produk lama, plus handling rate limit. |
| `src/lib/parse-showcase.js` | Parser pesan/embed -> objek produk. Murni, tanpa import, ada testnya. |
| `src/components/Showcase.jsx` | `useShowcase` hook. Card, filter, dan layout-nya tidak berubah. |
| `test/showcase.test.mjs` | 44 test, termasuk 8 test yang memakai `message.content` asli dari kedua channel. |

Tidak ada file baru di frontend, tidak ada komponen baru, tidak ada warna
atau class baru. Card Showcase tetap `<figure>` yang sama persis seperti
sebelumnya — yang berubah hanya data yang masuk ke dalamnya.

## Format pesan

Bentuk yang dipakai di kedua channel:

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

Parser membaca sumber ini, berurutan:

1. `embed.title` — kalau produk dikirim pakai embed.
2. `embed.fields` — `Harga`, `Kategori`, `Deskripsi`, `Status`, `Produk`.
3. `embed.description`
4. `message.content` — pesan biasa.

Kalau pesannya embed, isinya dibaca dari embed. Kalau pesan biasa, isinya
dibaca dari `content`. Dua-duanya bisa dipakai sekaligus.

### Yang dijamin parser

- **Harga tidak pernah dikarang.** Kalau pesan tidak menyebut harga, hasilnya
  `null`. `Exclusive Preview` dan `Tidak Untuk Dijual` dijamin `price: null`.
- **Angka polos tidak pernah jadi harga.** `Preview → #textdraw`,
  `Terbit tahun 2026`, `No. 3` semuanya aman. Harga hanya dibaca dari baris
  berlabel (`Harga:` / `Price:` / `Nominal:` / `Biaya:`) atau dari angka yang
  didahului mata uang (`Rp`, `IDR`, `rupiah`).
- **Harga verbatim.** `Rp19.500` tidak pernah diformat ulang. Yang dibuang
  hanya spasi di dalamnya, jadi `Rp 19.500` dan `Rp19.500` konsisten.
- **`Preview → #textdraw` tidak dianggap status.** Kata "preview" di baris CTA
  tidak akan salah dibaca sebagai "Exclusive Preview".
- **Baris ajakan bertindak tidak jadi deskripsi.** `Looking for a similar
  concept?`, `Ingin konsep setup seperti ini?`, dan `Silakan lakukan
  pemesanan melalui → #ticket` dipotong, jadi deskripsi yang terkirim hanya
  penjelasan produknya.
- **Percakapan biasa ditolak.** Di channel ada obrolan ("halo semua") yang
  baris pertamanya bisa kebaca sebagai judul. Pesan hanya dianggap produk
  kalau punya minimal satu dari: gambar, judul berdekor (`✦ ... ✦` atau
  `# ✦ ... ✦`), atau embed dengan field berlabel.
- **Markup Discord dibuang sebelum jadi teks.** `<#channel>`, `<@user>`,
  `<a:emoji:123>`, timestamp, dan `@everyone` tidak pernah muncul di website,
  dan backtick pun dibuang dari status (`Exclusive Preview` sudah ada
  backticknya di Discord: `` `Exclusive Preview • Tidak Untuk Dijual` ``).
- **Heading markdown `#` bukan bagian dari nama produk.** Judul `# ✦ Panel
  Character ✦` terkirim sebagai `Panel Character`, bukan `# Panel Character`.

Post yang berjalan di channel saat ini ditulis seperti ini, dan bentuk itulah
yang dipakai test (lihat blok "TES BERBASIS PESAN ASLI" di
`test/showcase.test.mjs`):

```
# ✦ Announcement Modern ✦
`Exclusive Preview • Tidak Untuk Dijual`
**High-quality textdraw design
dirancang untuk memberikan visual yang clean, modern, dan elegan
pada server GTA SAMP Anda.**
✨ Looking for a similar concept?
Silakan lakukan pemesanan melalui ➜ <#1545657764833919118>
@everyone
```

Hasilnya: judul `Announcement Modern`, status `Exclusive Preview`, deskripsi
berisi tiga baris penjelasan saja, dan `@everyone` tidak ikut.
- **Gambar dipakai apa adanya.** Attachment gambar pertama, tidak pernah
  diganti gambar acak. Kalau tidak ada attachment, `image` berupa `null` dan
  card memakai placeholder berlabel kategori yang memang sudah ada.

### Field yang dikirim

| Field | Isi | Dipakai card? |
| --- | --- | --- |
| `id` | id pesan Discord | ya (key React) |
| `title` | nama produk, glyph `✦` dilepas | ya |
| `category` | salah satu filter yang sudah ada | ya |
| `image` | attachment gambar pertama | ya |
| `description` | paragraf penjelasan produk | belum |
| `price` | `"Rp19.500"` atau `null` | belum |
| `status` | `available` / `unavailable` / `soon` | belum |
| `statusLabel` | teks aslinya, mis. `Exclusive Preview` | belum |
| `channelId`, `channelName` | asal channel | belum |
| `messageUrl` | link ke pesan di Discord | belum |
| `postedAt` | timestamp pesan | belum |

Empat field pertama yang dipakai card, sisanya sudah tersedia kalau nanti mau
ditampilkan tanpa harus baca ulang Discord.

## Mapping kategori

Filter di website **tidak diubah**:

```
All   SA-MP   Discord   Bot   Website   UI
```

Parser tidak pernah membuat kategori baru. `category` selalu salah satu dari
lima filter itu, supaya produk tidak pernah muncul di card tapi tidak bisa
difilter.

Urutan penentuannya:

1. **Kategori yang ditulis di dalam embed** (`Kategori: UI`).
2. **Kata kunci di judul produk.**
3. **Kategori yang dipin di env** (`<idChannel>:SA-MP`) - sebagai nilai
   default channel, bukan kunci mati.
4. **Kata kunci di nama channel** (`product-samp` -> SA-MP,
   `digital-service` -> Discord).
5. Fallback `UI`.

Pin di env sengaja tidak berada di nomor 2, tapi di nomor 3. Satu pin untuk satu
selalu lebih kasar daripada isi tiap produknya, jadi judul harus boleh
menyimpulkan. Contoh nyatanya: `#product-samp` dipin `SA-MP`, tapi produk
"Digital Speedometer" di channel itu tetap jadi `UI` karena judulnya menyebut
speedometer. Kalau pengin pin selalu menang, tulis `Kategori:` di embed.

Hanya judul dan nama channel yang dipakai, **bukan deskripsi**. Deskripsi di
`#digital-service` hampir selalu menulis "desain" dan "server Discord", jadi
kalau ikut dibaca, semua produk di channel itu akan salah masuk UI atau
Discord.

Contoh hasil penentuan kategori:

| Channel | Judul | Kategori | Alasan |
| --- | --- | --- | --- |
| #product-samp | Textdraw Smartphone | SA-MP | kata kunci `textdraw` |
| #product-samp | Panel Character | SA-MP | judul tidak menunjuk, nama channel |
| #product-samp | Custom Mapping Roleplay | SA-MP | kata kunci `mapping`, `roleplay` |
| #product-samp | Digital Speedometer | UI | kata kunci `speedometer` (pin SA-MP dikalahkan) |
| #digital-service | Setup Discord | Discord | kata kunci `discord` |
| #digital-service | Custom Bot Musik | Bot | kata kunci `bot` |
| #digital-service | Digital Speedometer | UI | kata kunci `speedometer` |
| #digital-service | Website Store | Website | kata kunci `website` |

## Setup

### 1. Bot Discord

Bot yang sama dengan testimoni sudah cukup. Izin yang dibutuhkan di server:

- **View Channel**
- **Read Message History**
- **Message Content Intent** (Server Settings -> Features)

Bot tidak perlu konek terus-menerus. Semua produk dibaca lewat REST API saat
website meminta data, jadi bot boleh offline.

### 2. Environment variable di Vercel

Project -> Settings -> Environment Variables:

| Nama | Wajib | Isi |
| --- | --- | --- |
| `DISCORD_BOT_TOKEN` | ya | Token bot, sama seperti testimoni |
| `DISCORD_SHOWCASE_CHANNELS` | ya | Id channel showcase, dipisah koma |
| `DISCORD_GUILD_ID` | tidak | Id server, untuk membuat link pesan |

Cara isi `DISCORD_SHOWCASE_CHANNELS`:

```
# paling sederhana - kategori ditebak dari nama channel
DISCORD_SHOWCASE_CHANNELS=1553622067746840709,1553622274001735782

# kalau mau memaksa kategorinya
DISCORD_SHOWCASE_CHANNELS=1553622067746840709:SA-MP,1553622274001735782:Discord
```

Formatnya `<idChannel>:<Kategori>`. **Kategorinya harus salah satu dari lima
filter yang sudah ada** - `SA-MP`, `Discord`, `Bot`, `Website`, `UI`. Jadi
`1553622067746840709:samp` itu kategori yang benar (huruf besar-kecil tidak
berpengaruh, `samp` dan `sa-mp` keduanya dibaca `SA-MP`), tapi
`1553622274001735782:digital` **bukan** nama filter - `digital-service` tidak
ada di filter website.

Kategori yang tidak dikenal tidak menggagalkan apa pun: kategorinya
dikosongkan, jadi produk dari channel itu tetap tampil dan kategorinya ditebak
otomatis dari isi produk. Nilainya dikembalikan di field `unknown` pada
respons endpoint supaya kelihatan, bukan hilang diam-diam:

```bash
curl https://domain-kamu.com/api/showcase | jq .unknown
# [ "digital" ]
```

Kalau `unknown` tidak kosong, perbaiki nilainya di Vercel.

Cara dapat id-nya: aktifkan **Developer Mode** (User Settings -> Advanced),
lalu klik kanan channel -> **Copy Channel ID**. Nilai harus 17-20 digit angka.
Kalau tidak, endpoint membalas `500` dengan pesan yang menyebutkan masalahnya,
bukan diam saja.

Salin `.env.example` jadi `.env.local` untuk pengembangan lokal. Nilai yang
di-trigger Vercel/Developer Portal kadang kesalin dengan tanda kutip atau
spasi tersembunyi, jadi semua nilai di-trim dulu sebelum dipakai.

### 3. Keamanan

**Token tidak pernah disimpan di kode dan tidak pernah masuk ke browser.**
Satu-satunya tempat token dibaca adalah `api/showcase.js`, dari environment
Vercel. Token tidak ikut response, tidak ikut query string, dan tidak ikut
`process.env` di sisi klien. `src/lib/discord.js` hanya menerima token lewat
argumen fungsi, sama seperti `api/testimonials.js`.

Test `handler: 500 bila env belum di-set, token tidak ikut pesan` dan
`token tidak ikut ke payload produk` menjaga ini tetap begitu.

## Produk lama

Discord tidak bisa menyaring pesan, jadi setiap channel dipindai dari pesan
terbaru ke lama memakai `before`. Default `maxPages=2` berarti 200 pesan
terbaru per channel. Kalau produk lama masih lebih jauh:

```
/api/showcase?limit=50&maxPages=10
```

`truncated: true` di respons berarti histori belum habis dipindai. `false`
berarti channel sudah tuntas dibaca sampai pesan paling lama.

Tidak ada event, tidak ada webhook, tidak ada cron. Mengulang request yang sama
akan menemukan produk lama yang sama.

## Produk baru

`Cache-Control: s-maxage=60, stale-while-revalidate=600` membuat CDN Vercel
menyegarkan respons tiap 60 detik. Section di browser memanggil ulang tiap 90
detik, jadi produk baru terlihat maksimal sekitar 1-2 menit tanpa refresh
halaman. `?refresh=1` untuk memaksa ambil data baru saat debugging.

Tidak ada langkah manual. Kirim produk ke `#product-samp` atau
`#digital-service` dengan format di atas, tunggu satu-dua menit, selesai.

## Kalau Discord tidak bisa dihubungi

| Keadaan | Yang tampil |
| --- | --- |
| Data Discord ada | Kartu produk asli, catatan "diambil langsung dari channel Discord kami" |
| Endpoint sehat, channel kosong | 7 placeholder dari `src/data/showcase.js` |
| Endpoint error / env belum di-set | 7 placeholder + catatan "belum bisa dimuat" |
| Satu channel error, channel lain sehat | Produk dari channel yang sehat, `channels[].error` di respons |

Card, filter, layout, warna, dan animasinya tidak berubah di semua keadaan
tersebut. Placeholder di `src/data/showcase.js` sengaja tidak dihapus, jadi
section tidak pernah kosong.

## Kalau ada produk yang tidak muncul

```bash
node tools/dump-embed.mjs showcase
```

Skrip itu membaca 20 pesan terbaru dari setiap channel showcase lalu
menampilkan hasil parser-nya persis seperti yang akan dikirim ke browser:

```
########## #product-samp (1111111111111111111) ##########
  ✓ SA-MP    | Textdraw Smartphone
      harga: Rp19.500
      gambar: ada
      https://discord.com/channels/154/111/900
  - 1234567890 dilewati (bukan produk)
```

`dilewati (bukan produk)` artinya pesannya memang tidak punya gambar, tidak
punya judul berdekor, dan tidak punya field berlabel — atau tidak ada judul
yang bisa dibaca. Kalau produk yang benar ikut terlewati, cek apakah format
pesan masih `✦ Nama Produk ✦` di baris pertama.

## Test

```bash
npm test
```

33 test di `test/showcase.test.mjs`, termasuk skenario yang biasanya gagal:
pesan dari kedua channel apa adanya, produk tanpa attachment, percakapan
bukan produk, `Preview →` yang tidak boleh jadi status, harga dalam berbagai
format, angka polos yang tidak boleh jadi harga, 11 kasus pemetaan kategori,
paginasi mundur untuk produk lama, channel error tidak menggagalkan channel
lain, dan nama channel gagal dibaca. Tidak ada test yang menyentuh API Discord
sungguhan — semuanya memakai fetch tiruan.
