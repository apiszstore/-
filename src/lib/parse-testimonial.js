/**
 * Parser embed Discord -> objek testimoni.
 *
 * ============================================================
 *  FUNGSI INI MURNI: tanpa import, tanpa network, tanpa side effect.
 *  Aman dipakai di server (Vercel) maupun di test.
 * ============================================================
 *
 *  Dua sumber data didukung, karena embed bisa disusun dua cara:
 *   1. `embed.fields`  -> [{ name: 'Rate', value: '⭐⭐⭐⭐⭐' }, ...]
 *   2. `embed.description` -> teks bebas berbaris "Label: nilai"
 *
 *  Aturan tampilan yang WAJIB dijaga:
 *   - `price` TIDAK pernah diformat ulang. "Rp19.500" harus tetap
 *     "Rp19.500" (tanpa spasi, tanpa pemisah ribuan).
 *   - `invoice` sengaja tidak dikembalikan supaya tidak pernah
 *     bocor ke card, walau ada di embed.
 */

const BULLET = '\u2022';
const MIDDOT = '\u00b7';

/** Label embed -> kunci internal. Kunci dinormalisasi (lowercase, tanpa non-alnum). */
const FIELD_ALIASES = {
  customer: 'customer',
  nama: 'customer',
  name: 'customer',
  pembeli: 'customer',
  buyer: 'customer',
  user: 'customer',
  username: 'username',
  handle: 'username',
  discord: 'username',
  rate: 'rating',
  rating: 'rating',
  bintang: 'rating',
  star: 'rating',
  stars: 'rating',
  nilai: 'rating',
  product: 'product',
  produk: 'product',
  jasa: 'product',
  service: 'product',
  layanan: 'product',
  item: 'product',
  paket: 'product',
  // label gabungan yang sering dipakai, mis. "Product/Jasa"
  productjasa: 'product',
  produkjasa: 'product',
  jasaproduk: 'product',
  namaproduk: 'product',
  namajasa: 'product',
  productname: 'product',
  servicename: 'product',
  price: 'price',
  harga: 'price',
  nominal: 'price',
  biaya: 'price',
  cost: 'price',
  comment: 'comment',
  komentar: 'comment',
  review: 'comment',
  testimoni: 'comment',
  testimonial: 'comment',
  feedback: 'comment',
  date: 'date',
  tanggal: 'date',
  waktu: 'date',
  created: 'date',
  invoice: 'invoice',
  nota: 'invoice',
  notainv: 'invoice',
  ref: 'invoice',
};

const MONTHS = {
  januari: 1, january: 1, jan: 1,
  februari: 2, february: 2, feb: 2, febr: 2, pebruari: 2,
  maret: 3, march: 3, mar: 3,
  april: 4, apr: 4,
  mei: 5, may: 5,
  juni: 6, june: 6, jun: 6,
  juli: 7, july: 7, jul: 7,
  agustus: 8, agu: 8, august: 8, aug: 8,
  september: 9, sept: 9, sep: 9,
  oktober: 10, october: 10, oct: 10, okt: 10,
  november: 11, nov: 11,
  desember: 12, december: 12, dec: 12, des: 12,
};

/** Samakan label: "Product/Jasa" -> "productjasa". */
function normalizeKey(raw) {
  return String(raw ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Buang tanda kutip pembungkus: '"teks"', "'teks'", atau smart quote. */
function stripDecorativeGlyphs(text) {
  return text.replace(/[\u{1d400}-\u{1d7ff}\u{1ee00}-\u{1eeff}]/gu, '');
}

function stripQuotes(text) {
  const match = text.match(/^([\u201c\u2018"'])([\s\S]*)\1$/);
  return match ? match[2].trim() : text;
}

/**
 * Buang sisa format markdown Discord dan whitespace berlebih.
 *
 * Penting: bot testimoni menulis label sebagai "**Customer:**" - titik dua
 * berada DI DALAM bold. Memecah baris di titik dua pertama menyisakan "**"
 * di awal nilai, sehingga tanpa cleaned di sini nilai tampil sebagai
 * "** Rp16.000" dan bukan "Rp16.000".
 */
export function clean(raw) {
  const stripped = stripQuotes(
    String(raw ?? '')
      .replace(/```/g, '')
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/[ \t]+/g, ' ')
      .trim(),
  );

  return stripDecorativeGlyphs(stripped)
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[\s.,:;-]+/, '')
    .trim();
}

/**
 * Kumpulkan embed.fields + embed.description jadi satu peta label->nilai.
 * `fields` diprioritaskan karena lebih terstruktur.
 */
function collectFields(embed) {
  const map = new Map();

  for (const field of embed?.fields ?? []) {
    const key = FIELD_ALIASES[normalizeKey(field?.name)];
    const value = clean(field?.value);
    if (key && value && !map.has(key)) map.set(key, value);
  }

  for (const line of clean(embed?.description).split('\n')) {
    const cut = line.indexOf(':');
    if (cut === -1) continue;
    const key = FIELD_ALIASES[normalizeKey(line.slice(0, cut))];
    const value = clean(line.slice(cut + 1));
    if (key && value && !map.has(key)) map.set(key, value);
  }

  return map;
}

/**
 * Hitung rating 1-5.
 * Sumber utama: jumlah glyph bintang (U+2B50, dengan atau tanpa U+FE0F).
 * Fallback: "5/5", "4 dari 5", atau angka mentah.
 */
export function parseRating(raw) {
  const text = clean(raw);
  if (!text) return null;

  const stars = text.split('\u2b50').length - 1;
  if (stars >= 1) return Math.min(5, stars);

  const ratio = text.match(/(\d+(?:[.,]\d+)?)\s*(?:\/|dari|out of)\s*(\d+)/i);
  if (ratio) {
    const value = Number(ratio[1].replace(',', '.'));
    const max = Number(ratio[2]);
    if (max > 0) return Math.max(1, Math.min(5, Math.round((value / max) * 5)));
  }

  const first = text.match(/\d+(?:[.,]\d+)?/);
  if (first) {
    const value = Number(first[0].replace(',', '.'));
    if (value >= 1 && value <= 5) return Math.round(value);
  }

  return null;
}

/**
 * Parse "13 September 2026" -> { iso: '2026-09-13', display: '13 September 2026' }.
 * `display` sengaja memakai nama bulan dari sumber supaya card terlihat sama
 * persis dengan yang ditulis di Discord. Null kalau tidak bisa diparse.
 */
export function parseDate(raw, fallbackIso) {
  const text = clean(raw);

  if (text) {
    const match = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (match) {
      const month = MONTHS[match[2].toLowerCase()];
      if (month) {
        const day = Number(match[1]);
        const year = Number(match[3]);
        if (day >= 1 && day <= 31) {
          return {
            iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            display: `${day} ${match[2][0].toUpperCase()}${match[2].slice(1).toLowerCase()} ${year}`,
          };
        }
      }
    }

    const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return {
        iso: `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`,
        display: `${Number(isoMatch[3])} ${monthName(Number(isoMatch[2]))} ${isoMatch[1]}`,
      };
    }
  }

  if (fallbackIso) return { iso: fallbackIso.slice(0, 10), display: null };

  return null;
}

function monthName(month) {
  return (
    ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][
      month - 1
    ] ?? ''
  );
}

/**
 * Pisahkan nama dan username.
 *
 * Dua bentuk input yang nyata di channel:
 *   1. Teks bebas  -> "Customer: @IC MATEO_DEGUERRA"
 *   2. Discord mention -> "Customer: <@1368863471659122740>"
 *
 * Bentuk 2 tidak bisa diubah jadi nama tanpa request ke Discord, jadi
 * `userId` dikembalikan apa adanya dan resolution-nya diserahkan ke
 * lapisan API (lihat resolveUsers di lib/discord.js).
 *
 * Nama dengan spasi dipertahankan (tidak dipecah) supaya "@IC MATEO_DEGUERRA"
 * tidak jadi dua username. Discriminator lama "#1234" dibuang dari nama saja.
 */
function splitIdentity(usernameField, customerField) {
  const raw = clean(usernameField || customerField);
  if (!raw) return { name: null, username: null, userId: null };

  // Mention murni: "<@123>" atau "<@!123>" (nickname lama).
  const pure = raw.match(/^<@!?(\d+)>$/);
  if (pure) return { name: null, username: null, userId: pure[1] };

  // Mention ditempel di samping teks, mis. "Budi <@123>".
  const embedded = raw.match(/<@!?(\d+)>/);
  if (embedded) {
    const label = raw.replace(/<@!?\d+>/g, '').replace(/@+/g, '').trim();
    return {
      name: label || null,
      username: raw.startsWith('@') ? raw : label || null,
      userId: embedded[1],
    };
  }

  const hasAt = raw.startsWith('@');
  const username = hasAt ? raw : null;
  const name = raw.replace(/^@+/, '').replace(/#\d{4}$/, '').trim();

  return { name: name || null, username: username || (hasAt ? raw : null), userId: null };
}

/**
 * Satu pesan Discord -> satu objek testimoni, atau null kalau bukan testimoni.
 * Field yang dikembalikan sudah siap dipakai card, tidak ada `invoice`.
 */
export function parseMessage(message) {
  const embed = message?.embeds?.[0];
  if (!embed) return null;

  const fields = collectFields(embed);
  if (fields.size === 0) return null;

  const { name, username, userId } = splitIdentity(
    fields.get('username'),
    fields.get('customer'),
  );
  const comment = fields.get('comment') ?? null;
  const product = fields.get('product') ?? null;
  const price = fields.get('price') ?? null;

  // Tanpa nama, tanpa mention, dan tanpa komentar, ini bukan testimoni.
  if (!name && !userId && !comment) return null;

  const rating = parseRating(fields.get('rating'));
  const messageIso = message?.timestamp ? String(message.timestamp).slice(0, 10) : null;
  const date = parseDate(fields.get('date'), messageIso);

  return {
    id: String(message?.id ?? ''),
    name,
    username,
    userId,
    rating,
    text: comment,
    product,
    price,
    date: date?.iso ?? null,
    dateDisplay: date?.display ?? null,
    source: 'discord',
  };
}

/** Urut terbaru -> terlama. Pesan tanpa tanggal jatuh ke paling akhir. */
export function sortTestimonials(list) {
  return [...list].sort((a, b) => {
    if (a.date && b.date) return a.date < b.date ? 1 : -1;
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}

/** Buang duplikat berdasarkan nama + komentar (embed ulang di pesan sama). */
export function dedupe(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = `${item.name ?? ''}|${(item.text ?? '').slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export const __test = {
  normalizeKey,
  clean,
  stripDecorativeGlyphs,
  stripQuotes,
  collectFields,
  splitIdentity,
  monthName,
  BULLET,
  MIDDOT,
};
