#!/usr/bin/env node
// Validates .docs-evidence files against schema.json and checks
// page-evidence parity for the four audience roots.
import {execSync} from 'node:child_process';
import {readdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..', '..', '..', '..');
const evidenceDir = join(root, '.docs-evidence');
const docsDir = join(root, 'docs');
const schema = join(evidenceDir, 'schema.json');
const audiences = ['students', 'teachers', 'district-administrators', 'developers'];

// 1. Validate every JSON file against the schema.
const jsonFiles = [];
for (const aud of audiences) {
  const dir = join(evidenceDir, aud);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir, {recursive: true})) {
    if (f.endsWith('.json')) jsonFiles.push(join(dir, f));
  }
}
if (jsonFiles.length) {
  const ajvBin = join(fileURLToPath(import.meta.url), '..', '..', '..', '..', 'node_modules', '.bin', 'ajv');
  const cmd = `${ajvBin} validate -s ${schema} --spec=draft2020 -c ajv-formats -d '${jsonFiles.join("' -d '")}'`;
  try {
    execSync(cmd, {cwd: root, stdio: 'inherit'});
  } catch {
    process.exit(1);
  }
}

// 2. Check parity: every page (except index.md) needs an evidence file, and vice versa.
let errors = 0;
for (const aud of audiences) {
  const pages = existsSync(join(docsDir, aud))
    ? readdirSync(join(docsDir, aud), {recursive: true})
        .filter(f => f.endsWith('.md') && !f.endsWith('index.md'))
        .map(f => f.replace(/\.md$/, ''))
    : [];
  const evidence = existsSync(join(evidenceDir, aud))
    ? readdirSync(join(evidenceDir, aud), {recursive: true})
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace(/\.json$/, ''))
    : [];

  for (const p of pages) {
    if (!evidence.includes(p)) {
      console.error(`Missing evidence: .docs-evidence/${aud}/${p}.json`);
      errors++;
    }
  }
  for (const e of evidence) {
    if (!pages.includes(e)) {
      console.error(`Orphan evidence: .docs-evidence/${aud}/${e}.json (no matching page)`);
      errors++;
    }
  }
}

if (errors) {
  console.error(`\n${errors} parity error(s).`);
  process.exit(1);
}
console.log('Evidence check passed.');
