import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

import {LevelCatalog} from '../levelCatalog.js';
import {resolveRepoRoot} from '../paths.js';

let repoRoot: string | undefined;
try {
  repoRoot = resolveRepoRoot();
} catch {
  repoRoot = undefined;
}

// The catalog indexes the real Levelbuilder files; there is nothing to assert
// in a checkout without them.
describe.skipIf(!repoRoot)('LevelCatalog', () => {
  const catalog = LevelCatalog.scan(repoRoot as string);

  it('indexes every .level file in the scanned directories', () => {
    const onDisk = ['fish', 'music', 'standalone_video'].reduce(
      (total, dir) =>
        total +
        fs
          .readdirSync(
            path.join(
              repoRoot as string,
              'dashboard/config/levels/custom',
              dir,
            ),
          )
          .filter(name => name.endsWith('.level')).length,
      0,
    );
    expect(catalog.size).toBe(onDisk);
  });

  it('matches level keys case-insensitively', () => {
    const lower = catalog.searchLevels('oceans');
    const upper = catalog.searchLevels('OCEANS');
    expect(lower.length).toBeGreaterThan(0);
    expect(upper).toEqual(lower);
    for (const entry of lower) {
      expect(entry.levelKey.toLowerCase()).toContain('oceans');
      expect(entry.levelType).toBe('Fish');
    }
  });

  it('honors the result limit', () => {
    expect(catalog.searchLevels('a', 3)).toHaveLength(3);
  });

  it('tags each scanned directory with its Levelbuilder type', () => {
    const types = new Set(catalog.searchLevels('', 5000).map(e => e.levelType));
    expect(types).toEqual(new Set(['Fish', 'Music', 'StandaloneVideo']));
  });

  it('cannot resolve a level without the authoring parser', () => {
    const [first] = catalog.searchLevels('oceans');
    expect(
      catalog.resolveLevel(first.levelKey, {
        nextLevelNumericId: () => 1,
        registerLevelProperties: () => {},
      }),
    ).toBeUndefined();
  });
});
