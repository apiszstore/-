import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = existsSync(join(root, '.env.local')) ? '.env.local' : '.env';
const env = {};
for (const line of readFileSync(join(root, envFile), 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=');
  if (i === -1 || line.trim().startsWith('#')) continue;
  env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}

const res = await fetch(
  `https://discord.com/api/v10/channels/${env.DISCORD_CHANNEL_ID}/messages?limit=2`,
  { headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` } },
);
const messages = await res.json();

console.log('jumlah pesan:', messages.length);
for (const m of messages.slice(0, 2)) {
  console.log('\n========================================');
  console.log('PESAN', m.id);
  const e = m.embeds?.[0];
  if (!e) { console.log('  (tidak ada embed)'); continue; }
  console.log('title      :', JSON.stringify(e.title));
  console.log('author.name:', JSON.stringify(e.author?.name));
  console.log('description:', JSON.stringify(e.description));
  console.log('fields:');
  for (const f of e.fields ?? []) {
    console.log('   name=' + JSON.stringify(f.name) + '  value=' + JSON.stringify(f.value));
  }
}
console.log('\n(token tidak pernah dicetak)');
