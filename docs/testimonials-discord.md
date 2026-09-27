# Testimoni Discord

Testimoni diambil langsung dari channel Discord ke website. **Tidak ada
database.** Discord yang jadi sumber data, jadi testimoni baru otomatis ikut
tampil begitu embed-nya dikirim ke channel — tanpa input manual.

```
Discord channel  ->  /api/testimonials (Vercel)  ->  TestimonialCard
   embed             token di env, di-cache        format website
```

## File

| File | Fungsi |
| --- | --- |
| `api/testimonials.js` | Endpoint Vercel. Baca channel, kirim JSON. Token tidak pernah keluar ke browser. |
| `src/lib/discord.js` | Client Discord REST v10. Paginasi mundur untuk baca histori, plus handling rate limit. |
| `src/lib/parse-testimonial.js` | Parser embed -> objek testimoni. Murni, tanpa import, ada testnya. |
| `src/components/TestimonialCard.jsx` | Card + `useTestimonials` hook. Tanpa dependency selain React. |
| `test/*.test.mjs` | 21 test, termasuk contoh format asli. |

## Format embed

Dua cara penyusunan embed otomatis dikenali.

**Cara 1 — `embed.fields`**

```
Customer     : @IC MATEO_DEGUERRA
Rate         : ⭐⭐⭐⭐⭐
Product/Jasa : Custom DC
Harga        : Rp19.500
Komentar     : PELAYANAN CEPAT JOSJIS PKOKNYA
Invoice      : INV-20260913-XXXX
Tanggal      : 13 September 2026
```

**Cara 2 — `embed.description`** dengan baris `Label: nilai` yang sama.

Label alternatif yang dikenali: `Nama`, `Pembeli`, `Username`, `Rating`,
`Bintang`, `Produk`, `Jasa`, `Layanan`, `Paket`, `Price`, `Nominal`,
`Comment`, `Review`, `Date`, `Waktu`, `Nota`.

## Yang dijamin parser

- **`Harga` tidak pernah diformat ulang.** `Rp19.500` tetap `Rp19.500`, tanpa
  spasi dan tanpa pemisah ribuan lain. Tidak ada `Intl.NumberFormat` di jalur
  ini.
- **`Invoice` tidak pernah ikut ke card,** walaupun ada di embed.
- **Username ber-spasi tidak dipecah.** `@IC MATEO_DEGUERRA` tetap satu
  username, bukan dua.
- **Bintang dibatasi 1-5** dan menangani dua varian: `⭐` dan `⭐️` (U+FE0F).
- **Tanggal** dibaca dari nama bulan Indonesia maupun Inggris, dengan fallback
  ke `message.timestamp`.
- Bentuk `⭐` di luar 1-5, embed tanpa nama dan tanpa komentar, serta pesan
  tanpa embed semuanya ditolak, bukan ditampilkan setengah jadi.

## Format card

```
Customer Name                    VERIFIED BUYER ✓

@username · tanggal

★★★★★  5.0

"Komentar customer"

Product/Jasa                                 Harga

Custom DC                                     Rp19.500
```

Product di kiri, Harga di kanan, **satu baris**. Label `Jasa:` dan `Harga:`
tidak pernah ditulis. Baris itu dijamin tetap satu baris dengan `truncate` di
sisi kiri dan `shrink-0 whitespace-nowrap` di sisi kanan, jadi produk yang
namanya panjang tidak mendorong harga ke baris berikutnya.

Kalau `product` dan `price` sama-sama kosong, barisnya disembunyikan — tidak
ada placeholder karangan.

## Setup

### 1. Bot Discord

Bot wajib punya izin ini di server tempat channel testimoni berada:

- **View Channel**
- **Read Message History**
- **Message Content Intent** (Server Settings -> Features)

Tanpa ketiganya, API mengembalikan `403` dan endpoint membalas `502`.

### 2. Environment variable di Vercel

Project -> Settings -> Environment Variables:

| Nama | Wajib | Isi |
| --- | --- | --- |
| `DISCORD_BOT_TOKEN` | ya | Token bot dari Developer Portal |
| `DISCORD_CHANNEL_ID` | ya | Klik kanan channel -> Copy Channel ID |
| `TESTIMONIAL_EMBED_TITLE` | tidak | Saring embed by judul, mis. `Rating` |

Salin `.env.example` jadi `.env.local` untuk pengembangan lokal.

**Token tidak pernah disimpan di kode.** Satu-satunya tempat token dibaca adalah
`api/testimonials.js`, dan nilainya tidak pernah masuk ke response maupun ke
query string. Test `handler: 500 bila env belum di-set` memastikan pesan error
tidak membocorkan token.

### 3. Pakai di halaman

```jsx
import { TestimonialGrid, useTestimonials } from './TestimonialCard.jsx';

export default function Testimoni() {
  const { testimonials, loading, error } = useTestimonials({ limit: 12 });

  if (loading) return <p>Memuat testimoni...</p>;
  if (error) return null;

  return <TestimonialGrid testimonials={testimonials} />;
}
```

Kalau website punya komponen card sendiri, jangan pakai `TestimonialCard` —
cukup mapping hasilnya:

```jsx
const { testimonials } = useTestimonials();

testimonials.map((t) => (
  <CardYangSudahAda
    key={t.id}
    name={t.name}              // "IC MATEO_DEGUERRA"
    username={t.username}      // "@IC MATEO_DEGUERRA"
    rating={t.rating}          // 5
    text={t.text}              // "PELAYANAN CEPAT JOSJIS PKOKNYA"
    product={t.product}        // "Custom DC"
    price={t.price}            // "Rp19.500"
    date={t.date}              // "2026-09-13"
    dateDisplay={t.dateDisplay} // "13 September 2026"
  />
));
```

Tidak ada field `invoice`, jadi tidak ada yang perlu disembunyikan di card lama.

## Kenapa "otomatis" berarti sekitar 60 detik

Vercel serverless tidak menyediakan koneksi persisten ke Discord, jadi tidak
ada WebSocket yang menahan channel. Yang dipakai:

1. `Cache-Control: s-maxage=60, stale-while-revalidate=600` — CDN Vercel
   menyegarkan respons tiap 60 detik tanpa membebani server.
2. `?refresh=1` untuk memaksa ambil data baru saat debugging.

Artinya testimoni baru tampil **maksimal sekitar 1 menit** tanpa perlu refresh
halaman. Kalau mau lebih cepat, tambahkan polling di client:

```jsx
const { testimonials } = useTestimonials({ pollMs: 30_000 });
```

## Membaca testimoni lama

Discord tidak bisa memfilter pesan berdasarkan embed, jadi channel harus
dipindai dari pesan terbaru ke lama memakai `before`. Default `maxPages=3`
yaitu 300 pesan terbaru. Kalau testimoni lama masih lebih jauh:

```
/api/testimonials?limit=50&maxPages=10
```

Respons menyertakan `truncated: true` kalau histori belum habis dipindai, jadi
UI bisa menampilkan "muat lebih banyak" alih-alih diam-diam memotong.

Rate limit `429` ditangani dengan menghormati `retry_after` dari Discord, dengan
batas satu kali percobaan ulang supaya function tidak kena timeout.

## Test

```bash
npm test
```

21 test, termasuk skenario yang biasanya gagal: embed `fields` maupun
`description`, harga dalam berbagai format, `⭐️` dengan variation selector,
tanggal Indonesia dan Inggris, username ber-spasi, pesan duplikat, paginasi, dan
rate limit. Tidak ada test yang menyentuh API Discord sungguhan — semua memakai
fetch tiruan.
