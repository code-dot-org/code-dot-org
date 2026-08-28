import {describe, expect, it} from 'vitest';

import {buildCourse, type LevelSource} from '../buildCourse';

const COURSE_JSON = JSON.stringify({name: 'test-course'});
const OFFERING_JSON = JSON.stringify({
  key: 'test-course',
  display_name: 'Test Course',
});

// A Dancelab level type is neither Fish/Music/Maze/Karel (which get their
// own LevelProperties builders) nor a recognized DSL kind, so it exercises
// the plain XML "opaque generic" title-fallback path.
const LEVEL_WITHOUT_DISPLAY_NAME: LevelSource = {
  kind: 'xml',
  content: `<Dancelab>
  <config><![CDATA[{
  "properties": {
    "skin": "dance"
  }
}]]></config>
</Dancelab>`,
};

const LEVEL_WITH_DISPLAY_NAME: LevelSource = {
  kind: 'xml',
  content: `<Dancelab>
  <config><![CDATA[{
  "properties": {
    "display_name": "Freestyle Remix"
  }
}]]></config>
</Dancelab>`,
};

// Excerpt of a real StandaloneVideo level (e.g.
// music-coding-intro-songwriter-shakira-video.level).
const VIDEO_LEVEL: LevelSource = {
  kind: 'xml',
  content: `<StandaloneVideo>
  <config><![CDATA[{
  "properties": {
    "video_key": "musiclab_shakira",
    "display_name": "Shakira"
  }
}]]></config>
</StandaloneVideo>`,
};

// Excerpt of a real .bubble_choice DSL file (e.g.
// coding_with_music_career_videos_standalone.bubble_choice).
const BUBBLE_CHOICE_DSL: LevelSource = {
  kind: 'dsl',
  ext: 'bubble_choice',
  content: `name 'career-videos-standalone'
display_name 'Career Exploration'

sublevels
level 'songwriter-video'`,
};

function scriptJsonWith(scriptLevels: unknown[]): string {
  return JSON.stringify({
    script: {name: 'test-script'},
    lessons: [{key: 'lesson-1', name: 'Lesson 1', absolute_position: 1}],
    script_levels: scriptLevels,
  });
}

describe('buildCourse title fallback chain', () => {
  it('falls back to a humanized levelKey, not the shared progression label, when the level has no display_name', () => {
    const {course} = buildCourse({
      courseJson: COURSE_JSON,
      offeringJson: OFFERING_JSON,
      scriptJson: scriptJsonWith([
        {
          position: 1,
          level_keys: ['dance-2024_freestyle-loop1'],
          seeding_key: {'lesson.key': 'lesson-1'},
          properties: {progression: 'Skill Building'},
        },
      ]),
      levelSources: new Map([
        ['dance-2024_freestyle-loop1', LEVEL_WITHOUT_DISPLAY_NAME],
      ]),
    });

    const [experience] = course.units[0].lessons[0].experiences;
    expect(experience.title).toBe('Dance freestyle loop1');
  });

  it("prefers the level's own display_name over the progression label", () => {
    const {course} = buildCourse({
      courseJson: COURSE_JSON,
      offeringJson: OFFERING_JSON,
      scriptJson: scriptJsonWith([
        {
          position: 1,
          level_keys: ['dance-2024_freestyle-loop2'],
          seeding_key: {'lesson.key': 'lesson-1'},
          properties: {progression: 'Skill Building'},
        },
      ]),
      levelSources: new Map([
        ['dance-2024_freestyle-loop2', LEVEL_WITH_DISPLAY_NAME],
      ]),
    });

    const [experience] = course.units[0].lessons[0].experiences;
    expect(experience.title).toBe('Freestyle Remix');
  });

  it('strips a levelKey prefix that repeats the script name', () => {
    const {course} = buildCourse({
      courseJson: COURSE_JSON,
      offeringJson: OFFERING_JSON,
      scriptJson: scriptJsonWith([
        {
          position: 1,
          level_keys: ['test-script-play-sound'],
          seeding_key: {'lesson.key': 'lesson-1'},
          properties: {progression: 'Skill Building'},
        },
      ]),
      levelSources: new Map([
        ['test-script-play-sound', LEVEL_WITHOUT_DISPLAY_NAME],
      ]),
    });

    const [experience] = course.units[0].lessons[0].experiences;
    expect(experience.title).toBe('Play sound');
  });

  it('gives distinct titles to two experiences that share a progression label', () => {
    const {course} = buildCourse({
      courseJson: COURSE_JSON,
      offeringJson: OFFERING_JSON,
      scriptJson: scriptJsonWith([
        {
          position: 1,
          level_keys: ['dance-2024_loop-together'],
          seeding_key: {'lesson.key': 'lesson-1'},
          properties: {progression: 'Skill Building'},
        },
        {
          position: 2,
          level_keys: ['dance-2024_loop-layered'],
          seeding_key: {'lesson.key': 'lesson-1'},
          properties: {progression: 'Skill Building'},
        },
      ]),
      levelSources: new Map([
        ['dance-2024_loop-together', LEVEL_WITHOUT_DISPLAY_NAME],
        ['dance-2024_loop-layered', LEVEL_WITHOUT_DISPLAY_NAME],
      ]),
    });

    const titles = course.units[0].lessons[0].experiences.map(e => e.title);
    expect(titles).toEqual(['Dance loop together', 'Dance loop layered']);
  });
});

describe('buildCourse bubbleChoice sublevel resolution', () => {
  it("resolves each choice's own data, not just its display name", () => {
    const {course} = buildCourse({
      courseJson: COURSE_JSON,
      offeringJson: OFFERING_JSON,
      scriptJson: scriptJsonWith([
        {
          position: 1,
          level_keys: ['career-videos-standalone'],
          seeding_key: {'lesson.key': 'lesson-1'},
          properties: {},
        },
      ]),
      levelSources: new Map([
        ['career-videos-standalone', BUBBLE_CHOICE_DSL],
        ['songwriter-video', VIDEO_LEVEL],
      ]),
    });

    const [experience] = course.units[0].lessons[0].experiences;
    if (
      experience.kind !== 'existingLevel' ||
      experience.data?.type !== 'bubbleChoice'
    ) {
      throw new Error('expected a bubbleChoice experience');
    }
    expect(experience.data.choices).toEqual([
      {
        levelKey: 'songwriter-video',
        displayName: 'Shakira',
        data: {
          type: 'video',
          videoKey: 'musiclab_shakira',
          displayName: 'Shakira',
        },
      },
    ]);
  });
});
