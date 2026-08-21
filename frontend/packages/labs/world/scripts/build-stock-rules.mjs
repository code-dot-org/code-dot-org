// Generate the stock `.rule` workspaces we maintain in code.
//
// Source is `scripts/rules/<name>.mjs`; output is `src/rules/stock/<name>.ts`,
// committed, so nothing changes at run time and a reader still sees what ships.
// Nothing works backward: the six rules a human authored in the editor are not
// here, and editing a generated one means editing its source.
//
//   yarn build:rules          write them
//   yarn build:rules --check  fail if any is out of date (CI, pre-commit)

import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'src', 'rules', 'stock');

const RULES = [
  'input',
  'mouse',
  'arrows',
  'drive',
  'drag',
  'shoots',
  'expires',
  'motion',
  'collisions',
  'gravity',
  'jump',
  'solid',
  'wrap',
  'bounds',
  'collect',
  'health',
  'steering',
  'time',
  'score',
  'patrol',
  'attachment',
  'healthBar',
  'writing',
  'progress',
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
  // A rule added to the list above has no file yet, and that is not an error —
  // it is the first build of a new rule. `--check` then reports it stale, which
  // is the right answer: the tree does not have what the sources describe.
  const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
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
