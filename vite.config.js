import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8080,
    // gagal/error kalau port 8080 sudah dipakai, bukan otomatis pindah port
    strictPort: true,
    open: false,
  },
  preview: {
    port: 8080,
  },
});
