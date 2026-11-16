#!/usr/bin/env node
// Usage: node .agents/skills/figma-pixel-parity/validate-recipe.mjs <recipe.json> [--final]
// --final also checks that the recipe can back a "done" claim: no pending or
// failing case, accepted differences recorded, and every case id resolves.
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// ajv and ajv-formats are transitive dependencies of frontend/, not direct ones.
const require = createRequire(join(here, '../../../frontend/package.json'));

const args = process.argv.slice(2);
const final = args.includes('--final');
const [recipePath, ...extra] = args.filter(arg => arg !== '--final');
if (!recipePath || extra.length) {
  console.error('usage: validate-recipe.mjs <recipe.json> [--final]');
  process.exit(2);
}

let Ajv2020, addFormats;
try {
  Ajv2020 = require('ajv/dist/2020').default;
  addFormats = require('ajv-formats').default;
} catch {
  console.error(
    'ajv or ajv-formats not found; run `yarn install` in frontend/',
  );
  process.exit(2);
}

const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const ajv = new Ajv2020({allErrors: true, allowUnionTypes: true});
addFormats(ajv);
const validate = ajv.compile(readJson(join(here, 'visual-recipe.schema.json')));

// Rules the schema cannot express. Returns a list of problems.
const finalProblems = recipe => {
  const problems = [];
  const cases = recipe.coverage.cases;
  const caseIds = new Set(cases.map(c => c.id));
  const accepted = new Set(
    recipe.acceptedDifferences.flatMap(difference => difference.caseIds),
  );

  for (const c of cases) {
    if (c.result === 'pending' || c.result === 'fail') {
      problems.push(`case ${c.id} is ${c.result}`);
    }
    if (c.result === 'pass') {
      const open = c.mismatches.filter(m => m.category !== 'rendering-noise');
      if (open.length) {
        problems.push(
          `case ${c.id} is pass but lists ${open.length} mismatch(es)`,
        );
      }
    }
    if (c.result === 'accepted-difference' && !accepted.has(c.id)) {
      problems.push(
        `case ${c.id} is accepted-difference but not in acceptedDifferences`,
      );
    }
  }
  for (const [i, difference] of recipe.acceptedDifferences.entries()) {
    for (const id of difference.caseIds) {
      if (!caseIds.has(id)) {
        problems.push(`acceptedDifferences[${i}] names unknown case ${id}`);
      }
    }
  }
  for (const [i, pass] of recipe.evidence.correctionPasses.entries()) {
    for (const id of pass.caseIds) {
      if (!caseIds.has(id)) {
        problems.push(`correctionPasses[${i}] names unknown case ${id}`);
      }
    }
  }
  return problems;
};

const recipe = readJson(resolve(recipePath));
if (!validate(recipe)) {
  for (const error of validate.errors) {
    console.error(`${error.instancePath || '/'} ${error.message}`);
  }
  process.exit(1);
}
if (final) {
  const problems = finalProblems(recipe);
  if (problems.length) {
    for (const problem of problems) console.error(problem);
    process.exit(1);
  }
}
console.log(`ok ${recipePath}${final ? ' (final)' : ''}`);
