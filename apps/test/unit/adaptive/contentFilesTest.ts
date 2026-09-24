// Every content file shipped in the repo must parse. This is the CI guard
// for hand-authored JSON; the server does not validate the format.

import fs from 'fs';
import path from 'path';

import {parsePathway, parsePathwaySource} from '@cdo/apps/adaptive/schema';

const CONTENT_DIR = path.resolve(
  __dirname,
  '../../../../dashboard/config/level_content/adaptive'
);

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

// Stands in for the server: gives every standard reference the fields the
// served schema requires, without consulting the standards tables.
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

const pathwayFiles = fs
  .readdirSync(CONTENT_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => path.join(CONTENT_DIR, f));

describe('adaptive content files', () => {
  it('has at least one pathway', () => {
    expect(pathwayFiles.length).toBeGreaterThan(0);
  });

  describe.each(pathwayFiles)('%s', file => {
    it('parses as a pathway source whose id matches the file name', () => {
      const source = parsePathwaySource(readJson(file));
      expect(source.id).toBe(path.basename(file, '.json'));
    });

    it('composes into a served pathway with consistent references', () => {
      expect(() =>
        parsePathway(fakeResolve(parsePathwaySource(readJson(file))))
      ).not.toThrow();
    });
  });
});
