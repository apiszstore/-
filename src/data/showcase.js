/**
 * Showcase / galeri project.
 *
 * CARA MENGGANTI GAMBAR:
 *  Taruh file di /public/showcase/, lalu ubah `image` jadi
 *  '/showcase/nama-file.png'.
 *
 *  Kalau `image` null, kartu memakai placeholder berlabel kategori
 *  supaya tidak menampilkan gambar yang tidak relevan.
 */

export const showcaseCategories = ['All', 'SA-MP', 'Discord', 'Bot', 'Website', 'UI'];

export const showcaseFilters = ['All', 'SA-MP', 'Discord', 'Bot', 'Website', 'UI'];

export const showcaseItems = [
  {
    id: 's-textdraw',
    title: 'Textdraw Pack',
    category: 'SA-MP',
    image: null,
    note: 'Contoh kategori Textdraw',
  },
  {
    id: 's-speedometer',
    title: 'Speedometer',
    category: 'UI',
    image: null,
    note: 'Contoh kategori UI',
  },
  {
    id: 's-hud',
    title: 'HUD',
    category: 'SA-MP',
    image: null,
    note: 'Contoh kategori HUD',
  },
  {
    id: 's-discord',
    title: 'Discord Server',
    category: 'Discord',
    image: null,
    note: 'Contoh kategori Discord',
  },
  {
    id: 's-bot',
    title: 'Custom Bot',
    category: 'Bot',
    image: null,
    note: 'Contoh kategori Custom Bot',
  },
  {
    id: 's-website',
    title: 'Website',
    category: 'Website',
    image: null,
    note: 'Contoh kategori Website',
  },
  {
    id: 's-mapping',
    title: 'Mapping',
    category: 'SA-MP',
    image: null,
    note: 'Contoh kategori Mapping',
  },
];
