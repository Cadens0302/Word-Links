import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const workspaceRoot = new URL('..', import.meta.url);
const stagedRoot = new URL('publication/website/dist/', workspaceRoot);
const root = existsSync(stagedRoot) ? stagedRoot : new URL('dist/', workspaceRoot);
const bundle = new URL('../WordLinks/WordLinks.bundle/', import.meta.url);
const text = async url => readFile(url, 'utf8');
const fail = message => { throw new Error(message); };

const index = await text(new URL('index.html', root));
const references = [...index.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(match => match[1].split('?')[0])
  .filter(value => !value.startsWith('http') && !value.startsWith('#') && !value.startsWith('data:'));
for (const reference of new Set(references)) {
  if (!existsSync(new URL(reference, root))) fail(`Missing website asset: ${reference}`);
}

for (const file of ['service-worker.js', 'offline-store.js', 'offline-play.js', 'shared-daily.js']) {
  const source = await text(new URL(file, root));
  new Function(source);
  const appSource = await text(new URL(file, bundle));
  if (source !== appSource) fail(`Website/app bundle mismatch: ${file}`);
}

const dailyRoot = new URL('daily/v1/', root);
const dailyFiles = (await readdir(dailyRoot)).filter(file => extname(file) === '.json');
if (dailyFiles.length === 0) fail('No daily puzzle files found.');
for (const file of dailyFiles) {
  const envelope = JSON.parse(await text(new URL(file, dailyRoot)));
  const date = file.slice(0, -5);
  if (envelope.schema !== 1 || envelope.date !== date || typeof envelope.payload !== 'string') fail(`Invalid daily envelope: ${file}`);
  const checksum = createHash('sha256').update(envelope.payload).digest('hex');
  if (checksum !== envelope.sha256) fail(`Daily checksum mismatch: ${file}`);
  const records = JSON.parse(envelope.payload);
  if (!Array.isArray(records) || records.length !== 8) fail(`Daily record count mismatch: ${file}`);
}

console.log(JSON.stringify({
  referencedAssets: new Set(references).size,
  dailyFiles: dailyFiles.length,
  synchronizedRuntimeFiles: ['service-worker.js', 'offline-store.js', 'offline-play.js', 'shared-daily.js']
}, null, 2));
