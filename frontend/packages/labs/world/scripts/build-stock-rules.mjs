// Generate the stock `.rule` workspaces we maintain in code.
//
// Source is `scripts/rules/<name>.mjs`; output is `src/rules/stock/<name>.ts`,
// committed, so nothing changes at run time and a reader still sees what ships.
// Nothing works backward: the six rules a human authored in the editor are not
// here, and editing a generated one means editing its source.
//
//   yarn build:rules          write them
//   yarn build:rules --check  fail if any is out of date (CI, pre-commit)

import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'src', 'rules', 'stock');

const RULES = [
  'input',
  'arrows',
  'motion',
  'collisions',
  'gravity',
  'solid',
  'camera',
  'cameraFollow',
  'cameraEase',
  'cameraConfined',
  'cameraDeadzone',
];

const check = process.argv.includes('--check');
const stale = [];

for (const name of RULES) {
  const {default: build} = await import(join(here, 'rules', `${name}.mjs`));
  const generated = build();
  const path = join(out, `${name}.ts`);
  const current = readFileSync(path, 'utf8');
  if (current === generated) {
    continue;
  }
  if (check) {
    stale.push(name);
    continue;
  }
  writeFileSync(path, generated);
  console.log(`wrote ${name}.ts`);
}

if (stale.length) {
  console.error(
    `Out of date: ${stale.join(', ')}\n` +
      `Their source changed without the workspace being regenerated. ` +
      `Run \`yarn build:rules\`.`,
  );
  process.exit(1);
}
console.log(check ? 'stock rules up to date' : 'stock rules written');
