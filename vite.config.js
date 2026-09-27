import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Jalankan file di `api/` sebagai endpoint saat dev server jalan.
 *
 * Direktori `api/` adalah konvensi Vercel. Vercel yang mengintercepts
 * `/api/*` sebelum melayani file statis, sedangkan Vite tidak - tanpa plugin
 * ini, `http://localhost:8080/api/testimonials` malah mengembalikan file
 * sumbernya sebagai `text/javascript`, bukan JSON. Akibatnya endpoint tidak
 * bisa dites sebelum deploy.
 *
 * Plugin ini hanya berlaku di dev (`apply: 'serve'`), jadi tidak ikut ke
 * build production. Perilaku dan bentuk request/response-nya dibuat sama
 * dengan Vercel: `req.query`, `res.setHeader()`, `res.status().json()`.
 */
function apiDevServer(apiDir = 'api') {
  return {
    name: 'api-dev-server',
    apply: 'serve',

    async configResolved(resolved) {
      // Muat .env.local ke process.env supaya DISCORD_BOT_TOKEN terbaca
      // di sisi server, sama seperti Vercel membaca env project.
      Object.assign(process.env, loadEnv(resolved.mode, process.cwd(), ''));
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const route = url.pathname.replace(/^\/api\//, '').replace(/\/+$/, '');
        if (!route) return next();

        const entry = server.config.root
          ? `/${apiDir}/${route}.js`
          : `/${apiDir}/${route}.js`;

        let module;
        try {
          module = await server.ssrLoadModule(entry);
        } catch {
          return next();
        }

        const handler = module.default;
        if (typeof handler !== 'function') return next();

        const query = Object.fromEntries(url.searchParams);

        // Shim minimal yang sesuai apa yang dipakai api/testimonials.js.
        const shim = {
          method: req.method,
          query,
          headers: req.headers,
          setHeader: (key, value) => res.setHeader(key, value),
          status(code) {
            res.statusCode = code;
            return this;
          },
          json(payload) {
            if (!res.getHeader('Content-Type')) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
            }
            res.end(JSON.stringify(payload));
            return this;
          },
        };

        try {
          await handler(req, shim);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Dev API error', detail: error?.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServer()],
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
