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
  },
  preview: {
    port: 8080,
  },
});
