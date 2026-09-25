// Every content file shipped in the repo must parse, and every level it
// names must have a level file that agrees with how the pathway uses it.
// This is the CI guard for hand-authored JSON; the server does not validate
// the format.

import fs from 'fs';
import path from 'path';

import {parsePathway, parsePathwaySource} from '@cdo/apps/adaptive/schema';

const CONTENT_DIR = path.resolve(
  __dirname,
  '../../../../dashboard/config/level_content/adaptive'
);
const LEVELS_DIR = path.resolve(
  __dirname,
  '../../../../dashboard/config/levels'
);

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

// Stands in for the server: gives every standard reference the fields the
// served schema requires, without consulting the standards tables. Level
// references stay unresolved, which the served schema allows.
function fakeResolve(source: unknown): unknown {
  const pathway = source as {
    skills: {[id: string]: {standards?: {[k: string]: string}[]}};
  };
  const skills = Object.fromEntries(
    Object.entries(pathway.skills).map(([id, skill]) => [
      id,
      {
        ...skill,
        standards: skill.standards?.map(ref => ({
          ...ref,
          frameworkName: 'Fake Framework',
          description: `Standard ${ref.shortcode}`,
        })),
      },
    ])
  );
  return {...pathway, skills};
}

// Level files are named after the level, one directory per level type.
function levelFilesUnder(dir: string): Map<string, string> {
  const files = new Map<string, string>();
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const [name, file] of levelFilesUnder(full)) files.set(name, file);
    } else if (entry.name.endsWith('.level')) {
      files.set(path.basename(entry.name, '.level'), full);
    }
  }
  return files;
}

// A level file is the level's type as the root element around a JSON config.
function readLevelFile(file: string): {
  type: string;
  properties: {[key: string]: unknown};
} {
  const xml = fs.readFileSync(file, 'utf-8');
  const type = /<(\w+)>\s*<config>/.exec(xml)?.[1] ?? '';
  const json = /<!\[CDATA\[([\s\S]*?)\]\]>/.exec(xml)?.[1] ?? '{}';
  return {type, properties: JSON.parse(json).properties ?? {}};
}

const pathwayFiles = fs
  .readdirSync(CONTENT_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => path.join(CONTENT_DIR, f));

let levelFiles: Map<string, string>;
beforeAll(() => {
  levelFiles = levelFilesUnder(LEVELS_DIR);
});

describe('adaptive content files', () => {
  it('has at least one pathway', () => {
    expect(pathwayFiles.length).toBeGreaterThan(0);
  });

  describe.each(pathwayFiles)('%s', file => {
    const source = () => parsePathwaySource(readJson(file));
    const levelSteps = () =>
      source().checkpoints.flatMap(checkpoint =>
        checkpoint.steps.flatMap(step =>
          step.kind === 'level' ? [{checkpoint, step}] : []
        )
      );

    it('parses as a pathway source whose id matches the file name', () => {
      expect(source().id).toBe(path.basename(file, '.json'));
    });

    it('composes into a served pathway with consistent references', () => {
      expect(() => parsePathway(fakeResolve(source()))).not.toThrow();
    });

    it('names only levels that have a level file', () => {
      const referenced = [
        source().project.templateLevel,
        ...levelSteps().map(({step}) => step.level),
      ];
      expect(referenced.filter(name => !levelFiles.has(name))).toEqual([]);
    });

    it('names a template level that is not itself templated', () => {
      const template = levelFiles.get(source().project.templateLevel);
      if (!template) return;
      expect(
        readLevelFile(template).properties.project_template_level_name
      ).toBeUndefined();
    });

    it('marks exactly the steps whose level shares the project template', () => {
      const template = source().project.templateLevel;
      const mismatched = levelSteps().flatMap(({checkpoint, step}) => {
        const file = levelFiles.get(step.level);
        if (!file) return [];
        const sharesProject =
          step.level === template ||
          readLevelFile(file).properties.project_template_level_name ===
            template;
        return sharesProject === !!step.project
          ? []
          : [`${checkpoint.id}/${step.id}`];
      });
      expect(mismatched).toEqual([]);
    });
  });
});
