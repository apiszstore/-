/**
 * Lihat isi channel Discord, buat cek kenapa produk tidak muncul.
 *
 * Pakai:
 *   node tools/dump-embed.mjs                 # channel testimoni
 *   node tools/dump-embed.mjs showcase        # semua channel showcase
 *
 * Isi env yang dibaca: DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID,
 * DISCORD_SHOWCASE_CHANNELS, DISCORD_GUILD_ID.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseProductMessage } from '../src/lib/parse-showcase.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = existsSync(join(root, '.env.local')) ? '.env.local' : '.env';
const env = {};
for (const line of readFileSync(join(root, envFile), 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=');
  if (i === -1 || line.trim().startsWith('#')) continue;
  env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}

const showcase = process.argv[2] === 'showcase';
const guildId = (env.DISCORD_GUILD_ID ?? '').trim();

/** Daftar channel yang mau dibedah. */
const channels = showcase
  ? (env.DISCORD_SHOWCASE_CHANNELS ?? '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [id, category] = part.split(':');
        return { id: (id ?? '').trim(), category: (category ?? '').trim() };
      })
      .filter((channel) => /^\d{17,20}$/.test(channel.id))
  : [{ id: (env.DISCORD_CHANNEL_ID ?? '').trim(), category: '' }];

if (channels.length === 0 || !channels[0].id) {
  console.error(
    showcase
      ? 'DISCORD_SHOWCASE_CHANNELS belum diisi.'
      : 'DISCORD_CHANNEL_ID belum diisi.',
  );
  process.exit(1);
}

for (const channel of channels) {
  let meta = { name: null };
  try {
    meta = await call(`/channels/${channel.id}`);
  } catch {
    // Nama channel cuma dipakai untuk menebak kategori, jadi gagal ambil
    // tidak masalah - produk tetap dibaca dari isinya.
  }

  const messages = await call(`/channels/${channel.id}/messages?limit=20`);
  console.log(`\n########## #${meta.name ?? channel.id} (${channel.id}) ##########`);

  for (const message of messages) {
    if (showcase) {
      const item = parseProductMessage(message, {
        channelId: channel.id,
        channelName: meta.name,
        pinnedCategory: channel.category || null,
        guildId,
      });
      if (item) {
        console.log(`  ✓ ${item.category.padEnd(8)} | ${item.title}`);
        console.log(`      harga: ${item.price ?? '(tidak ada)'}`);
        console.log(`      gambar: ${item.image ? 'ada' : 'tidak ada'}`);
        console.log(`      ${item.messageUrl ?? item.id}`);
      } else {
        console.log(`  - ${message.id} dilewati (bukan produk)`);
      }
      continue;
    }

    console.log('\n========================================');
    console.log('PESAN', message.id);
    const e = message.embeds?.[0];
    if (!e) { console.log('  (tidak ada embed)'); continue; }
    console.log('title      :', JSON.stringify(e.title));
    console.log('author.name:', JSON.stringify(e.author?.name));
    console.log('description:', JSON.stringify(e.description));
    console.log('fields:');
    for (const f of e.fields ?? []) {
      console.log('   name=' + JSON.stringify(f.name) + '  value=' + JSON.stringify(f.value));
    }
  }
}
console.log('\n(token tidak pernah dicetak)');

async function call(path) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Discord API error ${res.status}`);
  return res.json();
}
