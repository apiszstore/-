/**
 * Parser pesan produk Discord -> objek showcase.
 *
 * ============================================================
 *  FUNGSI INI MURNI: tanpa import, tanpa network, tanpa side effect.
 *  Aman dipakai di server (Vercel) maupun di test.
 * ============================================================
 *
 * Bentuk pesan yang ada di channel showcase APISZ STORE:
 *
 *   \u2726 Textdraw Smartphone \u2726
 *   FOR SALE
 *   High-quality textdraw design
 *   dirancang untuk memberikan visual yang clean, modern, dan elegan
 *   pada server GTA SAMP Anda.
 *   Preview \u2192 #textdraw
 *   [IMAGE]
 *
 * Pola di atas muncul baik di `message.content` (pesan biasa) maupun di
 * `embed.title` / `embed.description` (pesan bot). Dua-duanya didukung, dan
 * `content` digabung dengan embed supaya produk tetap terbaca kalau salah
 * satu tidak dipakai.
 *
 * Aturan yang WAJIB dijaga:
 *   - `price` TIDAK PERNAH dikarang. Kalau pesan tidak menyebut harga, atau
 *     statusnya "Exclusive Preview" / "Tidak Untuk Dijual", hasilnya `null`.
 *   - `category` SELALU salah satu filter yang sudah ada di website
 *     (SA-MP / Discord / Bot / Website / UI). Tidak ada kategori baru.
 *   - `image` memakai attachment pertama, jadi thumbnail selalu gambar produk
 *     yang asli, bukan gambar acak.
 */

/**
 * Filter showcase yang sudah ada di website. Parser TIDAK BOLEH menambah
 * nilai lain, kalau tidak produk bisa muncul di card tapi tidak pernah bisa
 * difilter.
 */
export const SHOWCASE_FILTERS = ['All', 'SA-MP', 'Discord', 'Bot', 'Website', 'UI'];

/** Nilai `category` yang boleh dipakai (tanpa "All"). */
const CATEGORIES = SHOWCASE_FILTERS.filter((item) => item !== 'All');

/**
 * Dipakai kalau nama channel dan isi produk sama-sama tidak memuat kata kunci
 * kategori. "UI" dipilih karena itu filter paling umum untuk showcase desain.
 * Kalau ini tidak pas, pin kategorinya lewat env `DISCORD_SHOWCASE_CHANNELS`
 * (`<idChannel>:<Kategori>`).
 */
const FALLBACK_CATEGORY = 'UI';

/**
 * Urutan penting. Bot dan Website dicek lebih dulu karena "Discord Bot" dan
 * "Website Discord" keduanya menyebut Discord - kalau Discord dicek duluan,
 * dua-duanya salah masuk kategori Discord.
 *
 * Hanya judul dan nama channel yang dipakai, BUKAN deskripsi. Deskripsi di
 * channel #digital-service hampir selalu menulis "desain" dan "server Discord"
 * sehingga kata kunci di situ selalu menunjuk ke UI atau Discord dan menutupi
 * kategori sebenarnya.
 */
const KEYWORDS = [
  { category: 'Bot', test: /\b(bot|botnya|otomas|automation|discord ?bot|custom ?bot)\b/i },
  { category: 'Website', test: /\b(website|web ?site|web ?dev|web ?design|landing ?page|wordpress|web ?store)\b/i },
  { category: 'UI', test: /\b(ui|ux|desain|design|speedometer|interface|layout|dashboard|theme|ikon|icon|logo|pack|template)\b/i },
  { category: 'SA-MP', test: /\b(sa-?mp|samp|gtasa|gta ?sa|textdraw|mapping|panel|hud|pawn|amx|roleplay|server ?sa)\b/i },
  { category: 'Discord', test: /\b(discord|server|setup|channel|emoji|sticker|nsfw|bot ?server)\b/i },
];

/** Kata kunci NAMA CHANNEL -> kategori. Dipakai kalau judul tidak memancing. */
const CHANNEL_KEYWORDS = [
  { category: 'SA-MP', test: /(product[-_ ]?samp|samp[-_ ]?product|sa-?mp|gtasa|gta ?sa)/i },
  { category: 'Discord', test: /(digital[-_ ]?service|digital|discord)/i },
];

/**
 * Status produk. `label` adalah teks apa adanya dari Discord supaya frontend
 * bisa menampilkan kalimat aslinya ("Exclusive Preview"), bukan terjemahan
 * yang mengarang.
 *
 * "Exclusive Preview" dan "Tidak Untuk Dijual" dipetakan ke `unavailable`
 * karena memang bukan barang yang dijual - ini bukan "Custom Pricing".
 * Statusnya sendiri tidak dirender di card, jadi pemetaan ini hanya untuk
 * data yang dikirim ke API.
 */
const STATUS_RULES = [
  { status: 'unavailable', label: 'Exclusive Preview', test: /exclusive\s*[-–]?\s*preview/i },
  { status: 'unavailable', label: 'Tidak Untuk Dijual', test: /tidak\s+(?:untuk\s+)?dijual|not\s+for\s+sale/i },
  { status: 'available', label: 'For Sale', test: /\bfor\s+(?:sale|sell)\b|\bdijual\b|\bavailable\b|\bready\b/i },
  { status: 'soon', label: 'Coming Soon', test: /coming\s+soon|\bsegera\b/i },
];

/** Garis pemisah yang dipakai orang untuk membungkus judul: \u2726 teks \u2726. */
const DECOR = '\u2726\u2728\u2733\u2727\u2756\u275a\u2605\u2606\u2666\u25c8\u2722\u22c5\u2049\u2055\u203b';

/**
 * Dua cara orang menulis baris judul di Discord, keduanya harus dikenali:
 *
 *   1. "# \u2726 Panel Character \u2726" - heading markdown. Ini yang benar-benar
 *      dipakai di channel APISZ STORE. Tanpa ini, "# " ikut jadi bagian dari
 *      judul dan yang tampil di website jadi "# Panel Character".
 *   2. "\u2726 Panel Character \u2726" - glyph dekoratif saja.
 *
 * Satu pola gabungan tidak bisa dipakai: begitu "#" dan glyph jadi opsional,
 * SEMUA baris jadi cocok dan baris deskripsi bisa salah jadi judul. Jadi dua
 * polanya sengaja dipisah dan diuji berurutan.
 */
const HEADING_TITLE = new RegExp(`^#{1,6}\\s+[${DECOR}]?\\s*(.+?)\\s*[${DECOR}]?$`);
const DECORATED_TITLE = new RegExp(`^[${DECOR}]\\s*(.+?)\\s*[${DECOR}]$`);
const TITLE_PATTERNS = [HEADING_TITLE, DECORATED_TITLE];

/**
 * Markup inline Discord yang tidak pernah berguna di website: mention user,
 * mention channel (`<#123>`), custom emoji (`<a:nama:123>`), dan timestamp.
 * `message.content` Discord memuat semuanya apa adanya, jadi harus dibuang
 * sebelum jadi judul atau deskripsi - kalau tidak, `@everyone` ikut tampil di
 * website dan emoji custom muncul sebagai teks mentah "<a:logo:123>".
 */
const INLINE_MARKUP =
  /<a?:[a-z0-9_]+:\d+>|<#\d+>|<@[!?]?\d+>|<@&\d+>|<t:-?\d+(?::[tTdDfFR])?>|@[!]?everyone\b|@[!]?here\b/gi;

/** Panah yang biasa dipakai menggantikan "->" di baris ajakan bertindak. */
const ARROW = '\u2192\u2794\u279c\u27a1\u27a4';

/** Label embed -> kunci internal, buat author yang pakai embed.fields. */
const FIELD_ALIASES = {
  produk: 'product',
  product: 'product',
  nama: 'title',
  name: 'title',
  title: 'title',
  judul: 'title',
  harga: 'price',
  price: 'price',
  nominal: 'price',
  biaya: 'price',
  category: 'category',
  kategori: 'category',
  status: 'status',
  deskripsi: 'description',
  description: 'description',
  catatan: 'description',
  note: 'description',
};

/** Nomor uang: "Rp19.500", "Rp 19.500", "IDR 20.000", "Rp20K", "25rb". */
const PRICE_TOKEN = /\b(?:rp|idr|rupiah)\s*\.?\s*(\d[\d.,\s]*\s*(?:k|rb|juta|jt)?)\b/i;
const PRICE_LABEL = /^\s*(?:harga|price|nominal|biaya|rate)\s*[:=]\s*(.+)$/i;

/** Baris ajakan bertindak / navigasi, bukan bagian deskripsi produk. */
const CTA_LINE = new RegExp(`[${ARROW}]|->|\\bpreview\\b|\\bcek\\b|\\blihat\\b|\\bsilakan\\b|\\bhubungi\\b|\\border\\b|\\bvisit\\b|#[a-z0-9-]{2,}`, 'i');

/** Awal baris yang berarti "penutup", jadi deskripsi berhenti di situ. */
const CLOSING_LINE = /^(?:looking\s+for|need|want|butuh|ingin|yang\s+)\b.*\?\s*$|\?\s*$/i;

/**
 * Buang sisa markdown dan markup Discord.
 *
 * Dua hal SENGAJA TIDAK dibuang di sini:
 *   1. Glyph pembatas judul (`\u2726 Teks \u2726`) - justru baris itu yang
 *      dipakai `parseTitle` dan `hasDecoratedTitle` untuk mengenali pola produk.
 *   2. Heading markdown di awal baris - ditulis ulang jadi pola `HEADING_TITLE`.
 *
 * Yang dibuang cuma bullet, pemisah, font fancy, dan markup Discord
 * (`<#channel>`, `<@user>`, `<a:emoji:123>`, `@everyone`) yang kalau ikut tinggal
 * jadi teks aneh di website.
 */
export function clean(raw) {
  return String(raw ?? '')
    .replace(INLINE_MARKUP, ' ')
    .replace(/```/g, '')
    // Backtick tunggal = inline code. Status di channel APISZ STORE ditulis
    // begini: `Exclusive Preview - Tidak Untuk Dijual`.
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/[\u2022\u00b7]/g, ' ')
    .replace(/[\u{1d400}-\u{1d7ff}\u{1ee00}-\u{1eeff}]/gu, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
}


function normalizeKey(raw) {
  return String(raw ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Gabungkan `content` + embed jadi satu teks, embed diprioritaskan. */
function collectText(message) {
  const embed = pickEmbed(message);
  const parts = [];

  if (embed?.title) parts.push(embed.title);
  if (embed?.fields?.length) {
    for (const field of embed.fields) parts.push(`${field?.name}: ${field?.value}`);
  }
  if (embed?.description) parts.push(embed.description);
  if (message?.content) parts.push(message.content);

  return parts.join('\n');
}

/**
 * Pilih embed yang paling mungkin berisi produk. Bot showcase biasanya
 * mengirim satu embed; kalau beberapa, yang pertama yang punya judul atau
 * deskripsi non-kosong.
 */
function pickEmbed(message) {
  const embeds = message?.embeds ?? [];
  if (embeds.length === 0) return null;
  if (embeds.length === 1) return embeds[0];
  return embeds.find((embed) => clean(embed?.title) || clean(embed?.description)) ?? embeds[0];
}

/** Kumpulkan `embed.fields` -> peta kunci internal (label -> nilai). */
function collectFields(embed) {
  const map = new Map();
  for (const field of embed?.fields ?? []) {
    const key = FIELD_ALIASES[normalizeKey(field?.name)];
    const value = clean(field?.value);
    if (key && value && !map.has(key)) map.set(key, value);
  }
  return map;
}

/** Cocokkan satu baris dengan pola judul (heading markdown dulu, lalu glyph). */
function matchTitle(line) {
  for (const pattern of TITLE_PATTERNS) {
    const match = line.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Judul produk: baris yang ditulis sebagai heading markdown atau dibungkus
 * glyph dekoratif, misalnya "# \u2726 Panel Character \u2726". Kalau tidak ada,
 * pakai baris pendek pertama yang bukan status, bukan CTA, dan bukan
 * "Label: nilai".
 *
 * `index` baris judul ikut dikembalikan supaya pemanggil bisa mengeluarkannya
 * dari deskripsi. Dicocokkan lewat index, bukan lewat isi baris, karena baris
 * aslinya masih menyimpan glyph pembatas ("\u2726 Panel \u2726") sedangkan
 * judulnya sudah dibersihkan jadi "Panel".
 */
export function locateTitle(lines) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = clean(lines[i]);
    if (!line) continue;
    const raw = matchTitle(line);
    if (raw === null) continue;
    const title = clean(raw);
    // "\u2726 \u2726" saja bukan judul, dan baris status tidak boleh jadi judul.
    if (title && !STATUS_RULES.some((rule) => rule.test.test(title))) {
      return { title, index: i };
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = clean(lines[i]);
    if (!line) continue;
    if (line.length > 70) continue;
    if (line.includes(':')) continue;
    if (CTA_LINE.test(line)) continue;
    if (STATUS_RULES.some((rule) => rule.test.test(line))) continue;
    return { title: line, index: i };
  }

  return { title: null, index: -1 };
}

export function parseTitle(lines) {
  return locateTitle(lines).title;
}

/**
 * Status produk, dibaca dari baris pendek di bawah judul. Baris yang memuat
 * "Preview \u2192 #textdraw" sengaja diabaikan supaya kata "preview" di situ
 * tidak salah dibaca sebagai "Exclusive Preview".
 */
export function parseStatus(lines, skipIndexes = new Set()) {
  let seen = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (skipIndexes.has(i)) continue;
    const line = clean(lines[i]);
    if (!line) continue;
    seen += 1;
    // Status selalu ada di baris awal; setelah 4 baris lain itu isi deskripsi.
    if (seen > 4) break;
    if (line.includes('\u2192') || line.includes(':')) continue;
    const rule = STATUS_RULES.find((item) => item.test.test(line));
    if (rule) return { status: rule.status, statusLabel: rule.label, line, index: i };
  }
  return { status: null, statusLabel: null, line: null, index: -1 };
}

/**
 * Harga. Dua sumber yang diizinkan:
 *   1. Baris berlabel ("Harga: Rp19.500", juga dari embed.fields).
 *   2. Angka yang didahului mata uang ("Rp20.000", "IDR 25.000").
 *
 * Angka polos TIDAK pernah dianggap harga supaya tahun atau nomor urut tidak
 * salah jadi harga.
 *
 * Angka di dalam hasil tangkapan tidak pernah diformat ulang: "Rp19.500"
 * tetap "Rp19.500". Yang dibuang hanya spasi di dalamnya, supaya "Rp 19.500"
 * dan "Rp19.500" konsisten.
 */
export function parsePrice(text, labelled = null) {
  if (labelled) {
    const normalised = normalisePrice(labelled);
    if (normalised) return normalised;
  }

  const fromLabel = PRICE_LABEL.exec(clean(text));
  if (fromLabel) {
    const normalised = normalisePrice(fromLabel[1]);
    if (normalised) return normalised;
  }

  const match = PRICE_TOKEN.exec(clean(text));
  return match ? normalisePrice(match[0]) : null;
}

function normalisePrice(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return null;
  // "Rp 19.500" -> "Rp19.500". Angka itself is not touched.
  const tight = value.replace(/\s+/g, '');
  if (!/\d/.test(tight)) return null;
  return tight;
}

/**
 * Deskripsi: paragraf antara baris status dan baris CTA/penutup.
 * Dipotong di baris ajakan bertindak ("Preview \u2192 #textdraw", "Looking for
 * a similar concept?") supaya yang tampil hanya penjelasan produknya.
 */
export function parseDescription(lines, skipIndexes = new Set()) {
  const collected = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (skipIndexes.has(i)) continue;
    const line = clean(lines[i]);
    if (!line) continue;
    if (line.includes(':')) continue;
    if (CTA_LINE.test(line) || CLOSING_LINE.test(line)) break;
    collected.push(line);
  }

  const text = collected.join(' ').trim();
  if (!text) return null;
  return text.length > 320 ? `${text.slice(0, 317).trimEnd()}\u2026` : text;
}

/**
 * Kategori untuk filter showcase yang sudah ada.
 *
 * Urutan: kata kunci judul > pin dari env > kata kunci nama channel > fallback.
 *
 * Pin di `<idChannel>:<Kategori>` TIDAK diprioritaskan di atas isi produk.
 * Env dipakai sebagai nilai default channel, bukan kunci mati, karena satu
 * pin untuk satu channel selalu lebih kasar daripada isi tiap produknya.
 * Contoh nyata dari #product-samp yang dipin `samp` (jadi SA-MP): produk
 * "Digital Speedometer" ikut kategori UI karena judulnya didahulukan, dan itu
 * memang yang diinginkan - speedometer adalah komponen UI, bukan script SA-MP.
 *
 * Kalau pengin pin kategori selalu menang, tulis kategori eksplisit di dalam
 * embed (field "Kategori:") - baris itu selalu menang atas semua tebakan.
 */
export function inferCategory({ title, channelName, pinned }) {
  const fromTitle = KEYWORDS.find((rule) => rule.test.test(title ?? ''));
  if (fromTitle) return fromTitle.category;

  if (pinned && CATEGORIES.includes(pinned)) return pinned;

  const fromChannel = CHANNEL_KEYWORDS.find((rule) => rule.test.test(channelName ?? ''));
  if (fromChannel) return fromChannel.category;

  return FALLBACK_CATEGORY;
}

/**
 * Gambar produk. Urutan: attachment gambar pertama -> `embed.image` ->
 * `embed.thumbnail`.
 *
 * Attachment dipakai lebih dulu karena bot showcase menaruh preview produk di
 * sana; `embed.image` biasanya cuma logo channel.
 */
export function pickImage(message) {
  for (const attachment of message?.attachments ?? []) {
    const type = String(attachment?.content_type ?? '');
    if (type.startsWith('image/') && attachment?.url) return attachment.url;
    if (attachment?.url && /\.(?:png|jpe?g|gif|webp|avif)(?:\?|$)/i.test(attachment.url)) {
      return attachment.url;
    }
  }

  const embed = pickEmbed(message);
  if (embed?.image?.url) return embed.image.url;
  if (embed?.thumbnail?.url) return embed.thumbnail.url;

  return null;
}

/** Link ke pesan aslinya di Discord. Null kalau guild id belum di-set. */
export function buildMessageUrl({ guildId, channelId, messageId }) {
  if (!guildId || !channelId || !messageId) return null;
  return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
}

/**
 * Ada baris judul yang ditulis sebagai heading atau dibungkus glyph dekoratif,
 * mis. "# \u2726 Panel \u2726".
 *
 * Ini yang membedakan post produk dari percakapan biasa, jadi dibaca dari
 * baris yang sudah di-`clean` (markdown sudah dibuang, glyph pembatas
 * sengaja dipertahankan).
 */
export function hasDecoratedTitle(lines) {
  return lines.some((raw) => {
    const line = clean(raw);
    if (!line) return false;
    const matched = matchTitle(line);
    if (matched === null) return false;
    return Boolean(clean(matched));
  });
}

/**
 * Satu pesan Discord -> satu objek showcase, atau `null` kalau bukan produk.
 *
 * Field yang dikembalikan persis yang dipakai card yang sudah ada
 * (`id`, `title`, `category`, `image`) plus data tambahan yang tidak dirender
 * sekarang tapi sudah siap dipakai nanti.
 */
export function parseProductMessage(message, context = {}) {
  const embed = pickEmbed(message);
  const fields = collectFields(embed);
  const text = collectText(message);
  const lines = text.split('\n');
  const image = pickImage(message);

  // Kategori yang ditulis manual di dalam embed ("Kategori: UI") paling kuat,
  // lalu judul di dalam embed, baru judul yang dibaca dari isi pesan.
  const declaredCategory = clean(fields.get('category'));
  const declaredTitle = clean(fields.get('title'));
  const located = locateTitle(lines);
  const title = declaredTitle || located.title;

  // Tanpa judul tidak ada yang bisa jadi kartu, jadi pesannya dilewati.
  if (!title) return null;

  // Saringan obrolan. Di channel showcase ada percakapan biasa ("halo", "makasih
  // bro") yang baris pertamanya kebaca sebagai judul. Satu produk yang benar
  // selalu punya setidaknya satu dari tiga tanda ini:
  //   1. gambar (semua contoh produk di channel memang punya attachment),
  //   2. judul berdekor, mis. "\u2726 Panel Character \u2726",
  //   3. embed yang field-nya berlabel, mis. "Harga: Rp20.000".
  // Kalau tidak ada satu pun, pesannya percakapan, bukan produk.
  if (!image && !hasDecoratedTitle(lines) && fields.size === 0) return null;

  const skip = new Set();
  // Kalau judul datang dari embed, baris mana pun di pesan ini tidak boleh
  // ikut terpotong sebagai deskripsi.
  if (!declaredTitle && located.index >= 0) skip.add(located.index);

  const status = parseStatus(lines, skip);
  if (status.index >= 0) skip.add(status.index);

  const price = parsePrice(text, fields.get('price'));
  const description = clean(fields.get('description')) || parseDescription(lines, skip);

  const postedAt = message?.timestamp ? String(message.timestamp) : null;
  const channelId = context.channelId ?? null;
  const messageId = String(message?.id ?? '');

  const category = inferCategory({
    title,
    channelName: context.channelName ?? null,
    pinned: declaredCategory || context.pinnedCategory || null,
  });

  return {
    id: messageId,
    title,
    category,
    image,
    description,
    price,
    status: status.status,
    statusLabel: status.statusLabel,
    channelId,
    channelName: context.channelName ?? null,
    messageUrl: buildMessageUrl({
      guildId: context.guildId ?? null,
      channelId,
      messageId,
    }),
    postedAt,
    source: 'discord',
  };
}

/** Urut terbaru -> terlama. */
export function sortProducts(list) {
  return [...list].sort((a, b) => {
    if (a.postedAt && b.postedAt) return a.postedAt < b.postedAt ? 1 : -1;
    if (a.postedAt) return -1;
    if (b.postedAt) return -1;
    return 0;
  });
}

/** Buang duplikat berdasarkan id pesan, hasil embed ulang di pesan sama. */
export function dedupe(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = item.id || `${item.title}|${item.postedAt}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export const __test = {
  normalizeKey,
  collectText,
  collectFields,
  parsePrice,
  normalisePrice,
  inferCategory,
  pickImage,
  locateTitle,
  matchTitle,
  CATEGORIES,
  FALLBACK_CATEGORY,
  HEADING_TITLE,
  DECORATED_TITLE,
};
