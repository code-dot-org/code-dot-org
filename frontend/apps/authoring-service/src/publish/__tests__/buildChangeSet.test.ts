import {describe, expect, it} from 'vitest';

import {injectWidgetChrome} from '@code-dot-org/widget-runtime/chrome';

import type {
  CourseModel,
  CurriculumChange,
  WidgetDescriptor,
} from '../../authoring/model.js';
import type {CurriculumSnapshot} from '../../store/SessionStore.js';
import {buildChangeSet} from '../buildChangeSet.js';

const widget: WidgetDescriptor = {
  id: 'sorter',
  toolName: 'present_sorter',
  title: 'Sorter',
  description: 'Sort samples.',
  inputSchema: {type: 'object'},
  resourceUri: 'ui://widgets/sorter.html',
  visibility: ['model', 'app'],
  network: 'none',
};

const course: CourseModel = {
  id: 'k5-ai-data-2024',
  displayName: 'How AI Makes Decisions',
  origin: 'levelbuilder',
  units: [
    {
      id: 'k5-ai-data-2024',
      displayName: 'How AI Makes Decisions',
      origin: 'levelbuilder',
      lessons: [
        {
          id: 'lb:k5-ai-data-2024:what-is-data',
          displayName: 'What is data?',
          origin: 'levelbuilder',
          adaptivePolicy: {tutorGuidance: 'Nudge, never solve.'},
          experiences: [
            {
              id: 'lb:Oceans_FishVTrash_2024',
              origin: 'levelbuilder',
              kind: 'existingLevel',
              levelKey: 'Oceans_FishVTrash_2024',
              levelType: 'Fish',
              runtime: 'labhost',
              labKey: 'oceans',
            },
            {
              id: 'lb:ai_data_intro_video',
              origin: 'levelbuilder',
              kind: 'existingLevel',
              levelKey: 'ai_data_intro_video',
              levelType: 'StandaloneVideo',
              runtime: 'generic',
              data: {type: 'video', videoKey: 'ai-data-intro'},
            },
            {
              id: 'lb:some_dance_level',
              origin: 'levelbuilder',
              kind: 'existingLevel',
              levelKey: 'some_dance_level',
              levelType: 'Dancelab',
              runtime: 'unsupported',
            },
          ],
        },
        {
          id: 'draft-lesson-1',
          displayName: 'Balance the data',
          origin: 'draft',
          experiences: [
            {
              id: 'draft-experience-1',
              origin: 'draft',
              kind: 'widget',
              widgetId: 'sorter',
              toolName: 'present_sorter',
            },
          ],
        },
        {
          id: 'draft-lesson-2',
          displayName: 'Outline only',
          origin: 'draft',
          experiences: [],
        },
      ],
    },
  ],
};

const draftCourse: CourseModel = {
  id: 'draft-course-1',
  displayName: 'A brand new course',
  origin: 'draft',
  units: [],
};

// Not every minting scheme uses the `draft-` prefix (see create_level, which
// mints the level's own id separately from its `draft-exp-` experience id) —
// this id proves newness is read from the change log, not string-matched.
const customIdCourse: CourseModel = {
  id: 'custom-course-2',
  displayName: 'Course with a non-draft- id',
  origin: 'draft',
  units: [],
};

const snapshot: CurriculumSnapshot = {
  version: 4,
  courses: [course, draftCourse, customIdCourse],
  widgets: [widget],
  levelProperties: {},
};

const changes: CurriculumChange[] = [
  {
    seq: 1,
    at: '2026-08-25T00:00:00.000Z',
    actor: 'agent',
    op: 'createLesson',
    unitId: 'k5-ai-data-2024',
    lesson: {
      id: 'draft-lesson-1',
      displayName: 'Balance the data',
      origin: 'draft',
    },
  },
  {
    seq: 2,
    at: '2026-08-25T00:00:01.000Z',
    actor: 'agent',
    op: 'createWidget',
    descriptor: widget,
  },
  {
    seq: 6,
    at: '2026-08-25T00:00:05.000Z',
    actor: 'author',
    op: 'createLesson',
    unitId: 'k5-ai-data-2024',
    lesson: {
      id: 'draft-lesson-2',
      displayName: 'Outline only',
      origin: 'draft',
    },
  },
  {
    seq: 3,
    at: '2026-08-25T00:00:02.000Z',
    actor: 'agent',
    op: 'createCourse',
    course: {
      id: 'draft-course-1',
      displayName: 'A brand new course',
      origin: 'draft',
    },
  },
  {
    seq: 4,
    at: '2026-08-25T00:00:03.000Z',
    actor: 'agent',
    op: 'insertExperience',
    lessonId: 'draft-lesson-1',
    position: 0,
    experience: {
      id: 'draft-experience-1',
      origin: 'draft',
      kind: 'widget',
      widgetId: 'sorter',
      toolName: 'present_sorter',
    },
  },
  {
    seq: 5,
    at: '2026-08-25T00:00:04.000Z',
    actor: 'agent',
    op: 'createCourse',
    course: {
      id: 'custom-course-2',
      displayName: 'Course with a non-draft- id',
      origin: 'draft',
    },
  },
];

const SOURCE =
  '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'"><p>hi</p>';

function build() {
  return buildChangeSet({
    snapshot,
    changes,
    readWidgetSource: id => (id === widget.id ? SOURCE : undefined),
    generatedAt: new Date('2026-08-25T12:00:00.000Z'),
  });
}

describe('buildChangeSet', () => {
  it('reports the courses the change log touched', () => {
    expect(build().courseIds).toEqual([
      'k5-ai-data-2024',
      'draft-course-1',
      'custom-course-2',
    ]);
  });

  it('carries the full change log', () => {
    expect(build().changes).toEqual(changes);
  });

  it('collects objects the change log created as new, regardless of id prefix', () => {
    const {newObjects} = build();
    expect(newObjects.courses.map(c => c.id)).toEqual([
      'draft-course-1',
      'custom-course-2',
    ]);
    expect(newObjects.units).toEqual([]);
    expect(newObjects.lessons.map(lesson => lesson.id)).toEqual([
      'draft-lesson-1',
      'draft-lesson-2',
    ]);
    expect(newObjects.experiences.map(exp => exp.id)).toEqual([
      'draft-experience-1',
    ]);
  });

  // Regression: the collector used to string-match the `draft-` prefix,
  // which create_level's own level id (minted separately from its
  // `draft-exp-` experience id — see ClaudeAgentRunner) would have missed
  // had it ever used a different scheme. Newness is now read from which
  // change created the id, not from the id's shape.
  it('collects a newly created object whose id does not start with draft-', () => {
    expect(build().newObjects.courses.map(c => c.id)).toContain(
      'custom-course-2',
    );
  });

  it('excludes an object that merely appears in the tree without a matching create* change', () => {
    // `lb:k5-ai-data-2024:what-is-data` and its levelbuilder-imported
    // experiences are present in the snapshot but were never created by a
    // change in this session's log.
    const {newObjects} = build();
    expect(newObjects.lessons.map(l => l.id)).not.toContain(
      'lb:k5-ai-data-2024:what-is-data',
    );
    expect(newObjects.experiences.map(e => e.id)).not.toContain(
      'lb:Oceans_FishVTrash_2024',
    );
  });

  it('publishes the served, chrome-injected source, not the raw agent output', () => {
    expect(build().widgets).toEqual([
      {
        id: 'sorter',
        descriptor: widget,
        source: injectWidgetChrome(SOURCE),
        validation: {hasHtml: true, networkPolicy: 'none', cspPresent: true},
      },
    ]);
  });

  it('flags external video and unsupported level types per lesson', () => {
    const [imported, realized, outline] = build().offline;

    expect(imported).toMatchObject({
      lessonId: 'lb:k5-ai-data-2024:what-is-data',
      contentPresent: true,
      deterministicNextStep: true,
    });
    expect(imported.experiences).toEqual([
      {
        experienceId: 'lb:Oceans_FishVTrash_2024',
        kind: 'existingLevel',
        deterministic: true,
        flags: [],
      },
      {
        experienceId: 'lb:ai_data_intro_video',
        kind: 'existingLevel',
        deterministic: true,
        flags: ['external-video'],
      },
      {
        experienceId: 'lb:some_dance_level',
        kind: 'existingLevel',
        deterministic: false,
        flags: ['unsupported-level-type:Dancelab'],
      },
    ]);

    expect(realized.experiences).toEqual([
      {
        experienceId: 'draft-experience-1',
        kind: 'widget',
        deterministic: true,
        flags: [],
      },
    ]);

    expect(outline).toMatchObject({
      lessonId: 'draft-lesson-2',
      contentPresent: false,
      deterministicNextStep: false,
    });
  });

  it('lists only lessons that carry an adaptive policy', () => {
    expect(build().adaptivePolicies).toEqual([
      {
        lessonId: 'lb:k5-ai-data-2024:what-is-data',
        policy: {tutorGuidance: 'Nudge, never solve.'},
      },
    ]);
  });
});
