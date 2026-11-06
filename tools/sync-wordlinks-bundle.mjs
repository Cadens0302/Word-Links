import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = join(root, 'WordLinks', 'WordLinks.bundle');
const stagedDestination = join(root, 'publication', 'website', 'dist');
const destination = existsSync(stagedDestination) ? stagedDestination : join(root, 'dist');

mkdirSync(destination, { recursive: true });
for (const name of readdirSync(source)) {
  cpSync(join(source, name), join(destination, name), { recursive: true });
}

console.log(`Synchronized ${readdirSync(source).length} Word Links bundle assets.`);
