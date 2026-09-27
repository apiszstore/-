# Aturan untuk AI agent yang mengerjakan repo ini

## Bersihkan scratch file setelah selesai

Setiap kali menjalankan browser test lewat `tools/cdp.mjs`, profil Edge
dibuat di `C:\Users\zacka\AppData\Local\Temp\opencode\edge-<nama>`. Satu
profil antara 14 sampai 89 MB. Kalau tiap test pakai profil baru dan
dibiarkan, satu sesi bisa menumpuk lebih dari 1 GB di drive user.

Aturannya:

1. Pakai **satu nama profil** untuk semua test dalam satu sesi, bukan satu
   nama per test. Profil akan dipakai ulang, bukan diduplikasi.
2. Setelah browser test selesai, **hapus folder profilnya**:
   `Remove-Item -Recurse -Force "$env:TEMP\opencode\edge-<nama>"`
3. Hapus juga log dev, screenshot, dan `.mjs` sementara di temp sebelum
   menutup sesi.
4. Kalau sebuah test gagal di tengah jalan, bersihkan di `finally`, jangan
   hanya di jalur sukses.

Jangan pernah menyisakan file di drive user tanpa diminta. Kalau memang
perlu menyimpan sesuatu untuk langkah berikutnya, sebutkan ke user secara
eksplisit beserta lokasinya.

## Hal lain yang berlaku

- Bahasa Indonesia untuk semua komentar, pesan commit, dan penjelasan ke
  user. Jangan sisipkan kata dari bahasa lain.
- Jangan pernah mencetak isi `.env` atau token apa pun ke output.
- `public/favicon.png` itu untracked dan bukan bagian dari proyek. Jangan
  di-commit tanpa diminta user.
- `npm run verify` tidak memulai dev server. Jalankan
  `npm run dev -- --port 8080 --strictPort` lebih dulu, dan matikan
  setelahnya.
