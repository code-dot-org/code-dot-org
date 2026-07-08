import {describe, expect, it} from 'vitest';

import type {LevelPropertiesMap} from '@code-dot-org/core/api';

import {
  fishLevel,
  oceansScriptStructure,
  videoLevel,
} from '../../oceans/fixtures';
import {resolveCourseLevel} from '../resolveCourseLevel';

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
});
