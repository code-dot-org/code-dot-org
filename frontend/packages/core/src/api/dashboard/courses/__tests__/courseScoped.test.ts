import {describe, expect, it} from 'vitest';

import {
  ScriptStructureSchema,
  CourseLevelPropertiesMapSchema,
} from '../courses.schemata';
import {coursesKeys} from '../courses.keys';

const OCEANS_STRUCTURE = {
  id: 446,
  name: 'oceans',
  title: 'AI for Oceans',
  tts: true,
  scriptPath: '/courses/oceans/units/1',
  lessons: [
    {
      script_id: 446,
      script_name: 'oceans',
      num_script_lessons: 1,
      id: 5066,
      position: 1,
      name: 'AI for Oceans',
      levels: [
        {
          id: '158432',
          ids: ['19423'],
          activeId: '19423',
          inactiveIds: [],
          position: 1,
          kind: 'puzzle',
          icon: 'fa-video-camera',
          is_concept_level: true,
          title: 1,
          url: 'https://studio.code.org/courses/oceans/units/1/lessons/1/levels/1',
          path: '/courses/oceans/units/1/lessons/1/levels/1',
          freePlay: false,
          bonus: false,
          display_as_unplugged: false,
          app: 'standalone_video',
          uses_lab2: false,
          is_validated: false,
          can_have_feedback: false,
          progression_display_name: 'AI Machine Learning - Video',
        },
        {
          id: '158433',
          ids: ['19419'],
          activeId: '19419',
          inactiveIds: [],
          position: 2,
          kind: 'puzzle',
          icon: null,
          is_concept_level: false,
          title: 2,
          url: 'https://studio.code.org/courses/oceans/units/1/lessons/1/levels/2',
          path: '/courses/oceans/units/1/lessons/1/levels/2',
          freePlay: false,
          bonus: false,
          display_as_unplugged: false,
          app: 'fish',
          uses_lab2: false,
          is_validated: false,
          can_have_feedback: false,
          progression_display_name: 'Train an AI to Clean the Ocean',
        },
      ],
      finishLink: 'https://studio.code.org/api/hour/finish/oceans',
      finishText: 'I finished!',
      lessonEditPath: '/lessons/5066/edit',
      duration: 45,
    },
  ],
};

const OCEANS_LEVEL_PROPERTIES = {
  '19423': {
    videoKey: 'oceans_machine_learning',
    displayName: 'Video: Machine Learning',
    videoRoundedCorners: true,
    videoFullWidth: true,
    background: 'oceans-blue',
    skipDialog: true,
    skipSound: true,
    name: 'Oceans_Video_Machine_Learning',
    id: 19423,
    levelData: {
      src: 'https://www.youtube-nocookie.com/embed/KHbwOetbmbs/',
      key: 'oceans_machine_learning',
      name: 'Machine Learning',
      download: 'https://videos.code.org/01-ai.mp4',
      thumbnail: '/c/video_thumbnails/oceans_machine_learning.jpg',
      enableFallback: true,
      autoplay: false,
    },
    helpVideos: [],
    type: 'StandaloneVideo',
    appName: 'standalone_video',
    useRestrictedSongs: false,
    usesProjects: false,
    finishUrl: '/courses/oceans/units/1/lessons/1/levels/2',
    baseAssetUrl: '/blockly/',
    isAssessment: false,
    enableBlocklyKeyboardNavigation: null,
    offerBrowserTts: true,
    showExemplarLink: false,
    parentLevelName: null,
  },
  '19419': {
    mode: 'fishvtrash',
    background: 'oceans-blue',
    name: 'Oceans_FishVTrash',
    id: 19419,
    helpVideos: [],
    type: 'Fish',
    appName: 'fish',
    useRestrictedSongs: false,
    usesProjects: false,
    finishUrl: '/courses/oceans/units/1/lessons/1/levels/3',
    baseAssetUrl: '/blockly/',
    isAssessment: false,
    enableBlocklyKeyboardNavigation: null,
    offerBrowserTts: true,
    showExemplarLink: false,
    parentLevelName: null,
  },
};

describe('ScriptStructureSchema', () => {
  it('parses a live oceans response preserving required fields', () => {
    const result = ScriptStructureSchema.parse(OCEANS_STRUCTURE);

    expect(result.name).toBe('oceans');
    expect(result.lessons).toHaveLength(1);

    const lesson = result.lessons[0];
    expect(lesson.script_name).toBe('oceans');
    expect(lesson.levels).toHaveLength(2);

    const level = lesson.levels[0];
    expect(level.id).toBe('158432');
    expect(level.activeId).toBe('19423');
    expect(level.position).toBe(1);
    expect(level.app).toBe('standalone_video');
    expect(level.path).toBe('/courses/oceans/units/1/lessons/1/levels/1');
  });

  it('preserves unknown top-level and nested fields via passthrough', () => {
    const result = ScriptStructureSchema.parse(OCEANS_STRUCTURE);

    expect(result.title).toBe('AI for Oceans');
    expect(result.tts).toBe(true);
    expect(result.lessons[0].finishLink).toBe(
      'https://studio.code.org/api/hour/finish/oceans',
    );
    expect(result.lessons[0].levels[0].progression_display_name).toBe(
      'AI Machine Learning - Video',
    );
  });

  it('rejects a response missing the name field', () => {
    const bad = {...OCEANS_STRUCTURE, name: undefined};
    expect(() => ScriptStructureSchema.parse(bad)).toThrow();
  });

  it('rejects a lesson level missing activeId', () => {
    const bad = {
      ...OCEANS_STRUCTURE,
      lessons: [
        {
          ...OCEANS_STRUCTURE.lessons[0],
          levels: [
            {...OCEANS_STRUCTURE.lessons[0].levels[0], activeId: undefined},
          ],
        },
      ],
    };
    expect(() => ScriptStructureSchema.parse(bad)).toThrow();
  });
});

describe('CourseLevelPropertiesMapSchema', () => {
  it('parses a live oceans response preserving known fields', () => {
    const result = CourseLevelPropertiesMapSchema.parse(
      OCEANS_LEVEL_PROPERTIES,
    );

    const video = result['19423'];
    expect(video.appName).toBe('standalone_video');
    expect(video.name).toBe('Oceans_Video_Machine_Learning');
    expect(video.finishUrl).toBe('/courses/oceans/units/1/lessons/1/levels/2');

    const fish = result['19419'];
    expect(fish.appName).toBe('fish');
    expect(fish.name).toBe('Oceans_FishVTrash');
  });

  it('preserves lab-specific fields through passthrough', () => {
    const result = CourseLevelPropertiesMapSchema.parse(
      OCEANS_LEVEL_PROPERTIES,
    );

    expect(result['19419'].mode).toBe('fishvtrash');
    expect(result['19423'].levelData).toBeDefined();
    expect(result['19423'].videoKey).toBe('oceans_machine_learning');
    expect(result['19423'].displayName).toBe('Video: Machine Learning');
  });

  it('accepts appName values not in ProjectTypes (e.g. fish)', () => {
    const result = CourseLevelPropertiesMapSchema.parse(
      OCEANS_LEVEL_PROPERTIES,
    );
    expect(result['19419'].appName).toBe('fish');
  });

  it('rejects a level entry missing appName', () => {
    const bad = {
      '1': {name: 'NoAppName', id: 1, finishUrl: '/done'},
    };
    expect(() => CourseLevelPropertiesMapSchema.parse(bad)).toThrow();
  });
});

describe('coursesKeys', () => {
  it('produces a stable structure key', () => {
    const key = coursesKeys.structure('oceans', 1);
    expect(key).toEqual(['courses', 'structure', 'oceans', 1]);
  });

  it('produces a stable levelProperties key', () => {
    const key = coursesKeys.levelProperties('oceans', 1, 1);
    expect(key).toEqual(['courses', 'levelProperties', 'oceans', 1, 1]);
  });

  it('uses courses as the top-level scope', () => {
    expect(coursesKeys.all).toEqual(['courses']);
  });
});
