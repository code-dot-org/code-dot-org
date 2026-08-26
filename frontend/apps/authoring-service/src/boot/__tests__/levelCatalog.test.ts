import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

import {parseLevelXml} from '@code-dot-org/authoring';

import type {ParseLevelXml} from '../../authoring/model.js';
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
    const onDisk = ['fish', 'music', 'standalone_video', 'maze'].reduce(
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
    expect(types).toEqual(
      new Set(['Fish', 'Music', 'StandaloneVideo', 'Maze']),
    );
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

  // Maze and Karel share one directory and one game engine, dispatching on
  // `skin`. Bee/Farmer/Harvester/Collector/Planter block sets are all
  // authored (see levelCatalog.ts's projectRuntime) — any other Karel skin's
  // toolbox flyout still throws at mount. Pins the runtime split per skin so
  // a future block-set change (a new skin, or one going unsupported) is a
  // deliberate, visible change here rather than an accidental revert.
  describe('Maze/Karel runtime split', () => {
    const parsingCatalog = LevelCatalog.scan(
      repoRoot as string,
      parseLevelXml as ParseLevelXml,
    );
    let nextId = 1;
    const context = {
      nextLevelNumericId: () => nextId++,
      registerLevelProperties: () => {},
    };

    it('resolves a Maze level to labhost/maze', () => {
      const level = parsingCatalog.resolveLevel(
        'courseD_maze_ramp1_2024',
        context,
      );
      expect(level?.levelType).toBe('Maze');
      expect(level?.runtime).toBe('labhost');
      expect(level?.labKey).toBe('maze');
    });

    it('resolves a Karel (Bee) level to labhost/maze', () => {
      const level = parsingCatalog.resolveLevel(
        'courseD_bee_conditionals2_2024',
        context,
      );
      expect(level?.levelType).toBe('Karel');
      expect(level?.runtime).toBe('labhost');
      expect(level?.labKey).toBe('maze');
    });

    it('resolves a Karel (Farmer) level to labhost/maze', () => {
      const level = parsingCatalog.resolveLevel(
        'courseD_farmer_while1_2024',
        context,
      );
      expect(level?.levelType).toBe('Karel');
      expect(level?.runtime).toBe('labhost');
      expect(level?.labKey).toBe('maze');
    });

    it('resolves a Karel (Harvester) level to labhost/maze', () => {
      const level = parsingCatalog.resolveLevel(
        'courseD_harvester_nested_loops_challenge1_2024',
        context,
      );
      expect(level?.levelType).toBe('Karel');
      expect(level?.runtime).toBe('labhost');
      expect(level?.labKey).toBe('maze');
    });

    it('resolves a Karel (Collector) level to labhost/maze', () => {
      const level = parsingCatalog.resolveLevel(
        'courseD_collector_debugging1a_2024',
        context,
      );
      expect(level?.levelType).toBe('Karel');
      expect(level?.runtime).toBe('labhost');
      expect(level?.labKey).toBe('maze');
    });

    it('resolves a Karel (Planter) level to labhost/maze', () => {
      const level = parsingCatalog.resolveLevel('Planter Test', context);
      expect(level?.levelType).toBe('Karel');
      expect(level?.runtime).toBe('labhost');
      expect(level?.labKey).toBe('maze');
    });

    // farmer_night is a Farmer reskin with its own asset set, not one of
    // the five skins with an authored block set (see SUPPORTED_KAREL_SKINS
    // in levelCatalog.ts); left unsupported until it gets its own pass.
    it('resolves an unrecognized Karel skin to unsupported', () => {
      const level = parsingCatalog.resolveLevel(
        '20hr_farmer_stage9_10',
        context,
      );
      expect(level?.levelType).toBe('Karel');
      expect(level?.runtime).toBe('unsupported');
      expect(level?.labKey).toBeUndefined();
    });
  });
});
