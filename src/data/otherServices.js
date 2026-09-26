/**
 * Layanan lain (Website, Mapping, Streamer).
 *
 * Semua masih `soon` — jangan diubah jadi `available` sebelum
 * benar-benar siap menerima order.
 */

export const otherServices = [
  {
    id: 'website',
    name: 'Website',
    icon: 'globe',
    price: null,
    status: 'soon',
    tagline: 'Landing page, store, atau website custom.',
    description: 'Pembuatan website untuk kebutuhan personal maupun bisnis.',
    features: ['Landing page', 'Website store', 'Custom website'],
    requirements: ['Kebutuhan & referensi design'],
    notes: 'Harga ditentukan setelah lingkup project disepakati.',
  },
  {
    id: 'mapping',
    name: 'Mapping GTA SA-MP',
    icon: 'map',
    price: null,
    status: 'soon',
    tagline: 'Pembuatan map untuk server SA-MP.',
    description: 'Interior, landmark, dan area khusus untuk server GTA SA-MP.',
    features: ['Interior mapping', 'Landmark', 'Area khusus'],
    requirements: ['Referensi map', 'Gamemode server'],
    notes: null,
  },
  {
    id: 'streamer',
    name: 'Streamer GTA SA-MP',
    icon: 'radio',
    price: null,
    status: 'soon',
    tagline: 'Custom script untuk kebutuhan streamer.',
    description: 'Fitur khusus untuk aktivitas streaming di server GTA SA-MP.',
    features: ['Custom script', 'Fitur streamer', 'Request khusus'],
    requirements: ['Detail kebutuhan streaming'],
    notes: null,
  },
];
