import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

import {parseLevelXml} from '@code-dot-org/authoring';

import type {ParseLevelXml} from '../../authoring/model.js';
import {
  groupLevelFamilies,
  LevelCatalog,
  parseLevelFamilyKey,
} from '../levelCatalog.js';
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
    for (const family of lower) {
      for (const variant of family.variants) {
        expect(variant.levelKey.toLowerCase()).toContain('oceans');
        expect(variant.levelType).toBe('Fish');
      }
    }
  });

  it('honors the result limit, counting family rows not raw entries', () => {
    expect(catalog.searchLevels('a', 3)).toHaveLength(3);
  });

  it('groups a known multi-year family into one row', () => {
    const [family] = catalog.searchLevels('courseD_bee_conditionalsVid1');
    expect(family.variantCount).toBeGreaterThan(1);
    expect(
      family.variants.every(v =>
        v.levelKey.startsWith('courseD_bee_conditionalsVid1'),
      ),
    ).toBe(true);
  });

  it('tags each scanned directory with its Levelbuilder type', () => {
    const types = new Set(
      catalog
        .searchLevels('', 5000)
        .flatMap(family => family.variants.map(v => v.levelType)),
    );
    expect(types).toEqual(
      new Set(['Fish', 'Music', 'StandaloneVideo', 'Maze']),
    );
  });

  it('cannot resolve a level without the authoring parser', () => {
    const [firstFamily] = catalog.searchLevels('oceans');
    expect(
      catalog.resolveLevel(firstFamily.defaultVariant.levelKey, {
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

// Names below are drawn from the real dashboard/config/levels/custom
// catalog (see the frequency table in levelCatalog.ts's suffix comment),
// not invented — these run unconditionally, without the repo checkout.
describe('parseLevelFamilyKey', () => {
  it('strips a bare trailing year', () => {
    expect(parseLevelFamilyKey('courseD_bee_conditionalsVid1_2024')).toEqual(
      {familyKey: 'courseD_bee_conditionalsVid1', year: 2024},
    );
  });

  it('leaves a bare name with no suffix untouched', () => {
    expect(parseLevelFamilyKey('courseD_bee_conditionalsVid1')).toEqual({
      familyKey: 'courseD_bee_conditionalsVid1',
      year: undefined,
    });
  });

  it('strips "(copy N)" and bare "_copy" markers', () => {
    expect(parseLevelFamilyKey('2-3 Maze 12 (copy 1)').familyKey).toBe(
      '2-3 Maze 12',
    );
    expect(parseLevelFamilyKey('courseD_bee_conditionalsVid1_copy')).toEqual({
      familyKey: 'courseD_bee_conditionalsVid1',
      year: undefined,
    });
  });

  it('strips stacked pilot + year suffixes regardless of order', () => {
    expect(
      parseLevelFamilyKey('CourseF_Oceans_CreaturesVTrash_2022_pilot'),
    ).toEqual({familyKey: 'CourseF_Oceans_CreaturesVTrash', year: 2022});
  });

  it('strips stacked version + year + dev suffixes', () => {
    expect(
      parseLevelFamilyKey(
        'problem-solving-with-ai-lesson10-level1_v2_2026_dev',
      ),
    ).toEqual({
      familyKey: 'problem-solving-with-ai-lesson10-level1',
      year: 2026,
    });
  });

  it('does not treat a sibling-exercise index as a variant suffix', () => {
    // "Generate_music_1" / "_2" are distinct steps in a sequence, not
    // variants of the same puzzle - collapsing them would be a real
    // curriculum regression, not just noise reduction.
    expect(parseLevelFamilyKey('Generate_music_1').familyKey).toBe(
      'Generate_music_1',
    );
    expect(parseLevelFamilyKey('Generate_music_2').familyKey).toBe(
      'Generate_music_2',
    );
  });

  it('leaves an idiosyncratic author tag alone (out of scope)', () => {
    expect(
      parseLevelFamilyKey('courseD_bee_conditionalsVid1_2023MB_k5-maker-2024')
        .familyKey,
    ).toBe('courseD_bee_conditionalsVid1_2023MB_k5-maker');
  });
});

describe('groupLevelFamilies', () => {
  const entry = (levelKey: string) => ({levelKey, levelType: 'Karel'});

  it('picks the newest year suffix as the default variant', () => {
    const [family] = groupLevelFamilies([
      entry('courseD_bee_conditionalsVid1_2018'),
      entry('courseD_bee_conditionalsVid1_2024'),
      entry('courseD_bee_conditionalsVid1_2021'),
    ]);
    expect(family.familyKey).toBe('courseD_bee_conditionalsVid1');
    expect(family.defaultVariant.levelKey).toBe(
      'courseD_bee_conditionalsVid1_2024',
    );
    expect(family.variantCount).toBe(3);
    expect(family.variants[0]).toBe(family.defaultVariant);
  });

  it('falls back to the bare name when no variant carries a year', () => {
    const [family] = groupLevelFamilies([
      entry('courseD_bee_conditionalsVid1_copy'),
      entry('courseD_bee_conditionalsVid1'),
      entry('courseD_bee_conditionalsVid1_pilot'),
    ]);
    expect(family.defaultVariant.levelKey).toBe(
      'courseD_bee_conditionalsVid1',
    );
  });

  it('keeps unrelated families separate', () => {
    const families = groupLevelFamilies([
      entry('courseD_bee_conditionalsVid1_2024'),
      entry('courseD_farmer_while1_2024'),
    ]);
    expect(families).toHaveLength(2);
    expect(families.map(f => f.familyKey)).toEqual([
      'courseD_bee_conditionalsVid1',
      'courseD_farmer_while1',
    ]);
  });
});
