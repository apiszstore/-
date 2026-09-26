Folder ini untuk file branding milikmu.

Isi dengan:
  logo.png       -> logo yang tampil di samping nama "APISZ STORE"
  favicon.png    -> ikon tab browser

Kalau nama file kamu berbeda, tidak masalah: ubah path-nya di
src/config/site.js bagian `brand`:

  brand: {
    logo: '/brand/logo.png',
    favicon: '/brand/favicon.png',
  }

Saran ukuran:
  logo.png     - tinggi 60-120 px, rasio bebas, latar transparan (PNG)
  favicon.png  - 32x32 atau 48x48 px, kotak, tidak transparan

Kalau file belum ada, website tetap tampil rapi:
  - logo    -> otomatis pakai tulisan "APISZ STORE" saja
  - favicon -> otomatis pakai icon bawaan (public/favicon.svg)

Format lain (jpg/webp/svg) juga bisa, asal path di config ikut diubah.
