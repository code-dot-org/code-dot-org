import {describe, expect, it} from 'vitest';

import type {LevelPropertiesMap, ScriptStructure} from '@code-dot-org/core/api';

import {resolveCourseLevel} from '../resolveCourseLevel';

// The value shape carried in a core LevelPropertiesMap.
type LevelProps = LevelPropertiesMap[string];

const STRUCTURE: ScriptStructure = {
  name: 'oceans',
  lessons: [
    {
      script_name: 'oceans',
      position: 1,
      levels: [
        {
          id: '158432',
          activeId: '19423',
          position: 1,
          path: '/courses/oceans/units/1/lessons/1/levels/1',
          app: 'standalone_video',
        },
        {
          id: '158433',
          activeId: '19419',
          position: 2,
          path: '/courses/oceans/units/1/lessons/1/levels/2',
          app: 'fish',
        },
        {
          id: '158434',
          activeId: '19418',
          position: 3,
          path: '/courses/oceans/units/1/lessons/1/levels/3',
          app: 'fish',
        },
      ],
      finishLink: 'https://studio.code.org/api/hour/finish/oceans',
    },
  ],
};

// Core-shaped level properties: the strict levels-API base shape, with the
// backend's real appName 'fish' for AI-for-Oceans levels.
function levelProps(
  overrides: Partial<LevelProps> &
    Pick<LevelProps, 'id' | 'appName' | 'type' | 'name'>,
): LevelProps {
  return {
    isAssessment: false,
    offerBrowserTts: true,
    helpVideos: [],
    baseAssetUrl: '/blockly/',
    showExemplarLink: false,
    parentLevelLink: undefined,
    exemplarSources: undefined,
    ...overrides,
  };
}

const LEVEL_PROPERTIES: LevelPropertiesMap = {
  '19423': levelProps({
    id: 19423,
    appName: 'standalone_video',
    type: 'StandaloneVideo',
    name: 'Oceans_Video_Machine_Learning',
    finishUrl: '/levels/2',
  }),
  '19419': levelProps({
    id: 19419,
    appName: 'fish',
    type: 'Fish',
    name: 'Oceans_FishVTrash',
    finishUrl: '/levels/3',
  }),
  '19418': levelProps({
    id: 19418,
    appName: 'fish',
    type: 'Fish',
    name: 'Oceans_CreaturesVTrashDemo',
    finishUrl: '/levels/4',
  }),
};

describe('resolveCourseLevel', () => {
  it('resolves position to level properties via activeId join', () => {
    const result = resolveCourseLevel(STRUCTURE, LEVEL_PROPERTIES, 1, 2);

    expect(result.levelId).toBe(19419);
    expect(result.scriptLevelId).toBe('158433');
    expect(result.properties.appName).toBe('fish');
    expect(result.properties.name).toBe('Oceans_FishVTrash');
  });

  it('provides navigation context', () => {
    const result = resolveCourseLevel(STRUCTURE, LEVEL_PROPERTIES, 1, 1);

    expect(result.position).toBe(1);
    expect(result.totalLevels).toBe(3);
    expect(result.scriptName).toBe('oceans');
  });

  it('includes finishLink from the lesson', () => {
    const result = resolveCourseLevel(STRUCTURE, LEVEL_PROPERTIES, 1, 1);

    expect(result.finishLink).toBe(
      'https://studio.code.org/api/hour/finish/oceans',
    );
  });

  it('provides all level paths for navigation', () => {
    const result = resolveCourseLevel(STRUCTURE, LEVEL_PROPERTIES, 1, 2);

    expect(result.levels).toHaveLength(3);
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
      resolveCourseLevel(STRUCTURE, LEVEL_PROPERTIES, 99, 1),
    ).toThrow(/lesson.*position 99/i);
  });

  it('throws naming the level position when level not found in structure', () => {
    expect(() =>
      resolveCourseLevel(STRUCTURE, LEVEL_PROPERTIES, 1, 99),
    ).toThrow(/level.*position 99/i);
  });

  it('throws naming the level id when activeId not in level_properties', () => {
    const sparse: LevelPropertiesMap = {
      '19423': levelProps({
        id: 19423,
        appName: 'standalone_video',
        type: 'StandaloneVideo',
        name: 'V',
      }),
    };

    expect(() => resolveCourseLevel(STRUCTURE, sparse, 1, 2)).toThrow(
      /level.*19419/i,
    );
  });
});
