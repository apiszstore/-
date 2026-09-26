Folder ini menunggu file logo dari pemilik website.

Isi dengan:
  dana.png
  gopay.png
  qris.png

Saran: kotak 200x200 px (rasio 1:1), format PNG dengan latar transparan
atau SVG. Nama file harus persis seperti di atas, karena
src/data/payment.js yang menunjuk ke folder ini.

Kalau file belum ada, section Payment otomatis menampilkan nama metode
sebagai teks (DANA / GoPay / QRIS) — tidak muncul gambar rusak.

Untuk ganti nama file, edit `logo` di src/data/payment.js.
