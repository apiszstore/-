import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8080,
    // gagal/error kalau port 8080 sudah dipakai, bukan otomatis pindah port
    strictPort: true,
    // expose ke jaringan LAN supaya bisa dibuka dari HP / perangkat lain
    // lewat alamat IP (mis. http://192.168.1.22:8080/).
    // Firewall Windows tetap harus mengizinkan Node.js lewat.
    host: true,
    open: false,
    watch: {
      /* File arsip / build output tidak perlu di-watch.
       Tanpa ini Vite mencoba memindai file .rar/.zip, dan kalau OneDrive
       sedang mengunci filenya Vite crash dengan EBUSY — dev server mati
       total tanpa pesan yang jelas. */
      ignored: ['**/*.rar', '**/*.zip', '**/*.7z', '**/dist/**'],
    },
  },
  preview: {
    port: 8080,
  },
});