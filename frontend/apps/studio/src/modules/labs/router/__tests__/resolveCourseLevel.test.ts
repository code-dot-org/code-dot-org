import {describe, expect, it} from 'vitest';

import type {LevelPropertiesMap} from '@code-dot-org/core/api';

import {
  fishLevel,
  oceansScriptStructure,
  videoLevel,
} from '../../oceans/fixtures';
import type {ResolvedCourseLevel} from '../resolveCourseLevel';
import {
  CourseLevelNotFoundError,
  nextDestination,
  resolveCourseLevel,
} from '../resolveCourseLevel';

// Level properties for the levels these tests resolve, built from the shared
// oceans fixture factories in parsed shape (what the API client returns). The
// structure and the factories are the single source shared with the MSW fixture.
const LEVEL_PROPERTIES: LevelPropertiesMap = {
  '19423': videoLevel.parsed({
    id: 19423,
    name: 'Oceans_Video_Machine_Learning',
    finishUrl: '/levels/2',
  }),
  '19419': fishLevel.parsed({
    id: 19419,
    name: 'Oceans_FishVTrash',
    finishUrl: '/levels/3',
  }),
  '19418': fishLevel.parsed({
    id: 19418,
    name: 'Oceans_CreaturesVTrashDemo',
    finishUrl: '/levels/4',
  }),
};

describe('resolveCourseLevel', () => {
  it('resolves position to level properties via activeId join', () => {
    const result = resolveCourseLevel(
      oceansScriptStructure,
      LEVEL_PROPERTIES,
      1,
      2,
    );

    expect(result.levelId).toBe(19419);
    expect(result.scriptLevelId).toBe('158433');
    expect(result.properties.appName).toBe('fish');
    expect(result.properties.name).toBe('Oceans_FishVTrash');
  });

  it('provides navigation context', () => {
    const result = resolveCourseLevel(
      oceansScriptStructure,
      LEVEL_PROPERTIES,
      1,
      1,
    );

    expect(result.position).toBe(1);
    expect(result.totalLevels).toBe(8);
    expect(result.scriptName).toBe('oceans');
  });

  it('includes finishLink from the lesson', () => {
    const result = resolveCourseLevel(
      oceansScriptStructure,
      LEVEL_PROPERTIES,
      1,
      1,
    );

    expect(result.finishLink).toBe('/api/hour/finish/oceans');
  });

  it('provides all level paths for navigation', () => {
    const result = resolveCourseLevel(
      oceansScriptStructure,
      LEVEL_PROPERTIES,
      1,
      2,
    );

    expect(result.levels).toHaveLength(8);
    expect(result.levels[0]).toEqual({
      position: 1,
      levelId: 19423,
      scriptLevelId: '158432',
      path: '/courses/oceans/units/1/lessons/1/levels/1',
    });
    expect(result.levels[1].position).toBe(2);
  });

  it('throws naming the lesson position when lesson not found', () => {
    expect(() =>
      resolveCourseLevel(oceansScriptStructure, LEVEL_PROPERTIES, 99, 1),
    ).toThrow(/lesson.*position 99/i);
  });

  it('throws naming the level position when level not found in structure', () => {
    expect(() =>
      resolveCourseLevel(oceansScriptStructure, LEVEL_PROPERTIES, 1, 99),
    ).toThrow(/level.*position 99/i);
  });

  it('throws naming the level id when activeId not in level_properties', () => {
    const sparse: LevelPropertiesMap = {
      '19423': videoLevel.parsed({id: 19423, name: 'V'}),
    };

    expect(() =>
      resolveCourseLevel(oceansScriptStructure, sparse, 1, 2),
    ).toThrow(/level.*19419/i);
  });

  it('throws CourseLevelNotFoundError (not a bare Error) so the loader can narrow', () => {
    const sparse: LevelPropertiesMap = {
      '19423': videoLevel.parsed({id: 19423, name: 'V'}),
    };

    expect(() =>
      resolveCourseLevel(oceansScriptStructure, LEVEL_PROPERTIES, 99, 1),
    ).toThrow(CourseLevelNotFoundError);
    expect(() =>
      resolveCourseLevel(oceansScriptStructure, LEVEL_PROPERTIES, 1, 99),
    ).toThrow(CourseLevelNotFoundError);
    expect(() =>
      resolveCourseLevel(oceansScriptStructure, sparse, 1, 2),
    ).toThrow(CourseLevelNotFoundError);
  });
});

// Builds only the fields nextDestination reads. Cast so the fixture stays
// agnostic to fields other properties of ResolvedCourseLevel carry.
function resolvedFixture(
  overrides: Partial<ResolvedCourseLevel> = {},
): ResolvedCourseLevel {
  return {
    levelId: 1,
    scriptLevelId: 's1',
    position: 1,
    totalLevels: 3,
    scriptName: 'oceans',
    properties: {} as ResolvedCourseLevel['properties'],
    // Positions are intentionally non-contiguous (1, 2, 4) to prove the next
    // level is chosen by array order, not by `position + 1`.
    levels: [
      {position: 1, levelId: 1, scriptLevelId: 's1', path: '/l1'},
      {position: 2, levelId: 2, scriptLevelId: 's2', path: '/l2'},
      {position: 4, levelId: 4, scriptLevelId: 's4', path: '/l4'},
    ],
    ...overrides,
  } as ResolvedCourseLevel;
}

describe('nextDestination', () => {
  it('advances to the next level in array order', () => {
    expect(nextDestination(resolvedFixture({position: 1}))).toEqual({
      to: '/l2',
    });
  });

  it('uses array order, not position arithmetic, across a gap', () => {
    // position 2 has no position-3 sibling; the next entry is position 4.
    expect(nextDestination(resolvedFixture({position: 2}))).toEqual({
      to: '/l4',
    });
  });

  it('on the last level, finishes via properties.finishUrl', () => {
    const resolved = resolvedFixture({
      position: 4,
      finishLink: '/lesson-finish',
      properties: {finishUrl: '/finish'} as ResolvedCourseLevel['properties'],
    });
    expect(nextDestination(resolved)).toEqual({href: '/finish'});
  });

  it('falls back to the lesson finishLink when finishUrl is absent', () => {
    const resolved = resolvedFixture({
      position: 4,
      finishLink: '/lesson-finish',
    });
    expect(nextDestination(resolved)).toEqual({href: '/lesson-finish'});
  });

  it('falls back to the script overview when neither is set', () => {
    expect(nextDestination(resolvedFixture({position: 4}))).toEqual({
      href: '/s/oceans',
    });
  });
});
