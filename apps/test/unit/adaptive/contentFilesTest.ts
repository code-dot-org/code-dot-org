// Every content file shipped in the repo must parse. This is the CI guard
// for hand-authored JSON; the server does not validate the format.

import fs from 'fs';
import path from 'path';

import {
  parsePathway,
  parsePathwaySource,
  parseSkillSource,
  referencedSkillIds,
} from '@cdo/apps/adaptive/schema';
import {Pathway} from '@cdo/apps/adaptive/types';

type ResolvedStandard = NonNullable<
  Pathway['skills'][string]['standards']
>[number];
type StandardRef = Pick<ResolvedStandard, 'framework' | 'shortcode'>;

const CONTENT_DIR = path.resolve(
  __dirname,
  '../../../../dashboard/config/level_content/adaptive'
);
const SKILLS_DIR = path.join(CONTENT_DIR, 'skills');
const STANDARDS_DIR = path.resolve(
  __dirname,
  '../../../../dashboard/config/standards'
);

// Minimal RFC 4180 reader: quoted fields may contain commas and doubled quotes.
function readCsv(file: string): {[column: string]: string}[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const text = fs.readFileSync(file, 'utf-8');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter(r => r.some(v => v !== ''));
  return body.map(r =>
    Object.fromEntries(header.map((h, i) => [h, r[i] ?? '']))
  );
}

// The standards tables as the seeder builds them from the CSVs. Mirrors the
// lookups in AdaptiveContent.resolve_standards.
const frameworks = new Map(
  readCsv(path.join(STANDARDS_DIR, 'frameworks.csv')).map(r => [
    r.framework,
    r.name,
  ])
);
function resolveStandard(ref: StandardRef): ResolvedStandard {
  const frameworkName = frameworks.get(ref.framework);
  if (!frameworkName) throw new Error(`unknown framework '${ref.framework}'`);
  const standard = readCsv(
    path.join(STANDARDS_DIR, `${ref.framework}_standards.csv`)
  ).find(r => r.standard === ref.shortcode);
  if (!standard) {
    throw new Error(`unknown standard '${ref.framework}/${ref.shortcode}'`);
  }
  const categories = readCsv(
    path.join(STANDARDS_DIR, `${ref.framework}_categories.csv`)
  );
  const category = categories.find(r => r.category === standard.category);
  const parent =
    category && categories.find(r => r.category === category.parent);
  return {
    ...ref,
    frameworkName,
    description: standard.description,
    categoryShortcode: category?.category,
    categoryDescription: category?.description,
    parentCategoryShortcode: parent?.category,
    parentCategoryDescription: parent?.description,
  };
}

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function jsonFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(dir, f));
}

// Mirrors AdaptiveContent.load in dashboard/lib/adaptive_content.rb.
function composeLikeServer(pathwayFile: string) {
  const pathway = parsePathwaySource(readJson(pathwayFile));
  const skills: {[id: string]: unknown} = {};
  for (const id of referencedSkillIds(pathway.steps)) {
    const file = path.join(SKILLS_DIR, `${id}.json`);
    if (!fs.existsSync(file)) continue;
    const skill = parseSkillSource(readJson(file));
    skills[id] = {...skill, standards: skill.standards?.map(resolveStandard)};
  }
  return {...pathway, skills};
}

describe('adaptive content files', () => {
  const pathwayFiles = jsonFiles(CONTENT_DIR);
  const skillFiles = jsonFiles(SKILLS_DIR);

  it('ships at least one pathway and one skill', () => {
    expect(pathwayFiles.length).toBeGreaterThan(0);
    expect(skillFiles.length).toBeGreaterThan(0);
  });

  it.each(skillFiles)('skill file %s parses and matches its filename', file => {
    const parsed = parseSkillSource(readJson(file));
    expect(parsed.id).toBe(path.basename(file, '.json'));
  });

  it.each(pathwayFiles)('pathway file %s is a valid source', file => {
    expect(parsePathwaySource(readJson(file)).id).toBe(
      path.basename(file, '.json')
    );
  });

  it.each(pathwayFiles)(
    'pathway file %s parses with its skills inlined',
    file => {
      const parsed = parsePathway(composeLikeServer(file));
      expect(parsed.id).toBe(path.basename(file, '.json'));
    }
  );
});
