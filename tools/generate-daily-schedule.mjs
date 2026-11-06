import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const stagedDist = join(root, 'publication', 'website', 'dist');
const dist = existsSync(stagedDist) ? stagedDist : join(root, 'dist');
const dailyDirectory = join(dist, 'daily', 'v1');
const difficulties = ['easy', 'medium', 'hard', 'master'];
const games = ['links', 'crossword'];
const write = process.argv.includes('--write');
const daysOption = process.argv.find(argument => argument.startsWith('--days='));
const days = Math.max(1, Number(daysOption?.slice('--days='.length) || 400));

const dateKey = date => date.toISOString().slice(0, 10);
const addDays = (date, amount) => { const next = new Date(`${date}T12:00:00Z`); next.setUTCDate(next.getUTCDate() + amount); return dateKey(next); };
const hash = value => { let state = 2166136261; for (const character of value) { state ^= character.charCodeAt(0); state = Math.imul(state, 16777619); } return state >>> 0; };
const envelopeFor = (date, records) => { const payload = JSON.stringify(records); return {schema:1,date,sha256:createHash('sha256').update(payload).digest('hex'),payload}; };

function readEnvelope(file) {
  const envelope = JSON.parse(readFileSync(join(dailyDirectory, file), 'utf8'));
  if (envelope.schema !== 1 || envelope.date !== file.slice(0, -5) || typeof envelope.payload !== 'string') throw new Error(`Invalid daily envelope: ${file}`);
  if (createHash('sha256').update(envelope.payload).digest('hex') !== envelope.sha256) throw new Error(`Checksum mismatch: ${file}`);
  const records = JSON.parse(envelope.payload);
  if (!Array.isArray(records) || records.length !== 8) throw new Error(`Expected 8 records: ${file}`);
  return records;
}

function validateRecords(date, records) {
  if (records.length !== 8) throw new Error(`Expected 8 records for ${date}`);
  const ids = new Set();
  for (const record of records) {
    if (!difficulties.includes(record.difficulty) || !games.includes(record.game)) throw new Error(`Unsupported record in ${date}`);
    const id = `${date}:${record.difficulty}:${record.game}`;
    if (record.id !== id || record.date !== date || ids.has(id)) throw new Error(`Invalid record identity in ${date}`);
    ids.add(id);
    if (record.game === 'links' && (!Array.isArray(record.layout) || record.layout.length !== 2)) throw new Error(`Invalid links layout in ${date}`);
    if (record.game === 'crossword' && (!Array.isArray(record.entries) || record.entries.length !== 8)) throw new Error(`Invalid crossword entries in ${date}`);
  }
  if (ids.size !== 8) throw new Error(`Missing record in ${date}`);
}

mkdirSync(dailyDirectory, {recursive:true});
const files = readdirSync(dailyDirectory).filter(file => /^\d{4}-\d{2}-\d{2}\.json$/.test(file));
const catalog = new Map();
let latest = '';
for (const file of files) {
  const date = file.slice(0, -5);
  latest = latest > date ? latest : date;
  const records = readEnvelope(file);
  validateRecords(date, records);
  for (const record of records) { const key = `${record.difficulty}:${record.game}`; if (!catalog.has(key)) catalog.set(key, []); catalog.get(key).push(record); }
}
for (const difficulty of difficulties) for (const game of games) if (!catalog.get(`${difficulty}:${game}`)?.length) throw new Error(`No catalog records for ${difficulty}/${game}`);

const today = dateKey(new Date());
const targetLastDate = addDays(today, days - 1);
const firstDate = latest && latest >= today ? addDays(latest, 1) : today;
const generated = [];
for (let date = firstDate; date <= targetLastDate; date = addDays(date, 1)) {
  const file = `${date}.json`;
  if (existsSync(join(dailyDirectory, file))) continue;
  const records = [];
  for (const difficulty of difficulties) for (const game of games) {
    const options = catalog.get(`${difficulty}:${game}`);
    const template = options[hash(`${date}:${difficulty}:${game}`) % options.length];
    records.push({...structuredClone(template), id:`${date}:${difficulty}:${game}`, date});
  }
  validateRecords(date, records);
  if (write) writeFileSync(join(dailyDirectory, file), `${JSON.stringify(envelopeFor(date, records))}\n`);
  generated.push(file);
}
console.log(JSON.stringify({mode:write?'write':'dry-run',today,targetLastDate,generated:generated.length,files:generated}, null, 2));
