import {existsSync, readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

import {parseLevelXml} from '../../importer/levelXml';
import {patchLevelFile, serializeLevelXml} from '../levelFile';

// Same convention as node/__tests__/loadCourse.test.ts: walk up looking for
// dashboard/config (the signature of the repo root) rather than assume a
// fixed number of `..` hops, and skip gracefully outside the monorepo.
function findRepoRoot(startDir: string): string | undefined {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (existsSync(path.join(dir, 'dashboard', 'config'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
  return undefined;
}

const repoRoot = findRepoRoot(path.dirname(fileURLToPath(import.meta.url)));

function levelPath(repo: string, dir: string, name: string): string {
  return path.join(repo, 'dashboard/config/levels/custom', dir, name);
}

/** Evenly-spaced sample across a directory's *.level files, real names. */
function sample(repo: string, dir: string, n: number): string[] {
  const full = path.join(repo, 'dashboard/config/levels/custom', dir);
  const files = readdirSync(full)
    .filter(name => name.endsWith('.level'))
    .sort();
  if (files.length <= n) return files.map(name => levelPath(repo, dir, name));
  const step = files.length / n;
  const picked: string[] = [];
  for (let i = 0; i < n; i++) {
    picked.push(levelPath(repo, dir, files[Math.floor(i * step)]));
  }
  return picked;
}

// Files chosen for a specific, named edge case rather than even spacing —
// see docs/prototypes and the writeback plan's risk list.
const NAMED_EDGE_CASES = (repo: string) => [
  // audit_log, contained_level_names, authored_hints, parent_level_id — a
  // 40-entry audit_log and several config fields this project never models.
  levelPath(repo, 'maze', 'courseA_bee_seq10.level'),
  // `maze` (flat int grid) rather than `serialized_maze` (per-cell objects).
  levelPath(repo, 'maze', '20hr_maze_stage2_11.level'),
  // Non-ASCII prose in short/long_instructions.
  levelPath(repo, 'maze', 'coursea_maze_ramp1_2018.level'),
  // A forward slash inside short_instructions prose (not JSON-escaped, since
  // neither Ruby's nor Node's JSON generator escapes `/` by default).
  levelPath(repo, 'maze', '4-5 Maze Conditionals Assessment 1.level'),
];

if (repoRoot === undefined) {
  describe.skip('levelFile (real .level corpus)', () => {
    it('skipped: dashboard/config not found from this checkout', () => {});
  });
} else {
  const repo = repoRoot;

  describe('patchLevelFile: byte-identity with no patch', () => {
    const files = [
      ...sample(repo, 'maze', 20),
      ...sample(repo, 'fish', 15),
      ...sample(repo, 'music', 15),
      ...sample(repo, 'standalone_video', 15),
      ...NAMED_EDGE_CASES(repo),
    ];

    it.each(files.map(file => [path.relative(repo, file), file]))(
      'reconstructs %s byte-for-byte with an empty patch',
      (_label, file) => {
        const original = readFileSync(file, 'utf8');
        expect(patchLevelFile(original, {})).toBe(original);
        expect(patchLevelFile(original)).toBe(original);
      },
    );

    it('covers at least 20 files across all four scanned directories', () => {
      expect(files.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('serializeLevelXml', () => {
    const file = levelPath(repo, 'maze', 'courseA_bee_seq10.level');

    it('reconstructs the parsed original byte-for-byte', () => {
      const original = readFileSync(file, 'utf8');
      const parsed = parseLevelXml(original);
      expect(serializeLevelXml(parsed, original)).toBe(original);
    });

    it('rejects a parse that does not belong to the given original', () => {
      const original = readFileSync(file, 'utf8');
      const otherFile = levelPath(repo, 'fish', 'Oceans_FishVTrash_2024.level');
      const otherParsed = parseLevelXml(readFileSync(otherFile, 'utf8'));
      expect(() => serializeLevelXml(otherParsed, original)).toThrow();
    });
  });

  describe('the measured decision: full reparse-and-reprint is not safe', () => {
    it('JSON.stringify(JSON.parse(cdata), null, 2) diverges from the source on a large share of real files', () => {
      const dirs = ['maze', 'fish', 'music', 'standalone_video'];
      let total = 0;
      let mismatched = 0;
      for (const dir of dirs) {
        const full = path.join(repo, 'dashboard/config/levels/custom', dir);
        for (const name of readdirSync(full)) {
          if (!name.endsWith('.level')) continue;
          total++;
          const xml = readFileSync(path.join(full, name), 'utf8');
          const match = xml.match(/<config>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/config>/);
          if (!match) continue;
          const raw = match[1];
          const reprinted = JSON.stringify(JSON.parse(raw), null, 2);
          if (reprinted !== raw) mismatched++;
        }
      }
      // Measured at 4396/9057 (48.5%) when this test was written — Ruby's
      // JSON.pretty_generate renders an empty object/array as two lines,
      // Node's JSON.stringify collapses it to one. Threshold is generous
      // (corpus grows over time); the point is that it's a large, structural
      // fraction, not a rounding error.
      expect(mismatched / total).toBeGreaterThan(0.3);
    });
  });

  describe('patchLevelFile: properties patching', () => {
    const file = levelPath(repo, 'maze', 'courseA_bee_seq10.level');
    const original = readFileSync(file, 'utf8');

    it('replaces an existing string property, leaving everything else untouched', () => {
      const patched = patchLevelFile(original, {
        properties: {short_instructions: 'Updated instructions.'},
      });
      const parsedPatched = parseLevelXml(patched);
      expect(parsedPatched.properties.short_instructions).toBe(
        'Updated instructions.',
      );
      const parsedOriginal = parseLevelXml(original);
      const untouchedKeys = Object.keys(parsedOriginal.properties).filter(
        key => key !== 'short_instructions',
      );
      for (const key of untouchedKeys) {
        expect(parsedPatched.properties[key]).toEqual(
          parsedOriginal.properties[key],
        );
      }
      // Only the one line should differ.
      const origLines = original.split('\n');
      const patchedLines = patched.split('\n');
      expect(patchedLines.length).toBe(origLines.length);
      const changedLines = origLines.filter((line, i) => line !== patchedLines[i]);
      expect(changedLines).toHaveLength(1);
    });

    it('deletes a key when the patch value is null', () => {
      const withKey = patchLevelFile(original, {
        properties: {a_brand_new_key: 'value'},
      });
      expect(parseLevelXml(withKey).properties.a_brand_new_key).toBe('value');
      const removed = patchLevelFile(withKey, {
        properties: {a_brand_new_key: null},
      });
      expect(parseLevelXml(removed).properties.a_brand_new_key).toBeUndefined();
      // Round-trips back to the original once the inserted key is removed.
      expect(removed).toBe(original);
    });

    it('inserts a new key that did not previously exist', () => {
      const original2 = readFileSync(
        levelPath(repo, 'fish', 'Oceans_FishVTrash_2024.level'),
        'utf8',
      );
      expect(parseLevelXml(original2).properties.short_instructions).toBeUndefined();
      const patched = patchLevelFile(original2, {
        properties: {short_instructions: 'New!'},
      });
      expect(parseLevelXml(patched).properties.short_instructions).toBe('New!');
    });

    it('is a no-op deleting a key that never existed', () => {
      const patched = patchLevelFile(original, {
        properties: {this_key_does_not_exist: null},
      });
      expect(patched).toBe(original);
    });

    it('stringifies a JSON-in-a-string value without double-escaping (serialized_maze)', () => {
      const grid = '[[{"tileType":0}]]';
      const patched = patchLevelFile(original, {
        properties: {serialized_maze: grid},
      });
      expect(parseLevelXml(patched).properties.serialized_maze).toBe(grid);
    });

    it('preserves non-ASCII prose byte-for-byte through a patch of a different key', () => {
      const nonAscii = levelPath(repo, 'maze', 'coursea_maze_ramp1_2018.level');
      const xml = readFileSync(nonAscii, 'utf8');
      const before = parseLevelXml(xml).properties;
      const patched = patchLevelFile(xml, {properties: {ideal: '99'}});
      const after = parseLevelXml(patched).properties;
      for (const key of Object.keys(before)) {
        if (key === 'ideal') continue;
        expect(after[key]).toEqual(before[key]);
      }
    });
  });

  describe('patchLevelFile: block XML patching', () => {
    const file = levelPath(repo, 'maze', '20hr_farmer_stage9_1.level');

    it('replaces one named block, leaving siblings untouched', () => {
      const original = readFileSync(file, 'utf8');
      const before = parseLevelXml(original);
      const newStart =
        '<xml xmlns="https://developers.google.com/blockly/xml"><block type="when_run"/></xml>';
      const patched = patchLevelFile(original, {
        blocks: {startBlocksXml: newStart},
      });
      const after = parseLevelXml(patched);
      expect(after.startBlocksXml).toBe(newStart);
      expect(after.toolboxBlocksXml).toBe(before.toolboxBlocksXml);
      expect(after.solutionBlocksXml).toBe(before.solutionBlocksXml);
    });
  });
}
