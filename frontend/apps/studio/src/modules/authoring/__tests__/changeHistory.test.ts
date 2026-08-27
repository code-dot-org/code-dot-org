import {describe, expect, it} from 'vitest';

import type {
  CourseModel,
  CurriculumChange,
  WidgetDescriptor,
} from '@code-dot-org/authoring';

import {changesForCourse, summarizeChange} from '../changeHistory';

let seq = 0;
const stamp = () => ({
  seq: ++seq,
  at: '2026-08-26T00:00:00.000Z',
  actor: 'author' as const,
});

describe('changesForCourse', () => {
  it('scopes createUnit/createLesson/insertExperience to the course, most recent first', () => {
    seq = 0;
    const changes: CurriculumChange[] = [
      {
        ...stamp(),
        op: 'createCourse',
        course: {id: 'course-a', displayName: 'A', origin: 'draft'},
      },
      {
        ...stamp(),
        op: 'createUnit',
        courseId: 'course-a',
        unit: {id: 'unit-a', displayName: 'Unit A', origin: 'draft'},
      },
      {
        ...stamp(),
        op: 'createLesson',
        unitId: 'unit-a',
        lesson: {id: 'lesson-a', displayName: 'Lesson A', origin: 'draft'},
      },
      {
        ...stamp(),
        op: 'insertExperience',
        lessonId: 'lesson-a',
        position: 0,
        experience: {
          id: 'exp-a',
          origin: 'draft',
          kind: 'content',
          markdown: 'hi',
        },
      },
      // A second, unrelated course — must not leak into course-a's history.
      {
        ...stamp(),
        op: 'createCourse',
        course: {id: 'course-b', displayName: 'B', origin: 'draft'},
      },
    ];

    const result = changesForCourse(changes, [], 'course-a');
    expect(result.map(c => c.op)).toEqual([
      'insertExperience',
      'createLesson',
      'createUnit',
      'createCourse',
    ]);
    expect(changesForCourse(changes, [], 'course-b').map(c => c.op)).toEqual([
      'createCourse',
    ]);
  });

  it('scopes a change against an imported lesson via the live tree, not the log', () => {
    // Regression: an imported (levelbuilder) course/unit/lesson is seeded
    // straight into the snapshot at boot — it never appears as a
    // createCourse/createUnit/createLesson change — so a change targeting
    // one (the overwhelmingly common case: attaching a level into an
    // imported course) has no log entry to chain off. Only the live tree
    // can resolve it.
    seq = 0;
    const importedCourse: CourseModel = {
      id: 'coursed-2024',
      displayName: 'CS Fundamentals: Course D',
      origin: 'levelbuilder',
      units: [
        {
          id: 'coursed-2024',
          displayName: 'CS Fundamentals: Course D',
          origin: 'levelbuilder',
          lessons: [
            {
              id: 'lb:coursed-2024:If/Else with Bee',
              displayName: 'If/Else with Bee',
              origin: 'levelbuilder',
              experiences: [],
            },
          ],
        },
      ],
    };
    const changes: CurriculumChange[] = [
      {
        ...stamp(),
        op: 'attachExistingLevel',
        lessonId: 'lb:coursed-2024:If/Else with Bee',
        levelKey: 'courseD_bee_conditionalsVid1_2020',
        position: 1,
      },
    ];

    expect(
      changesForCourse(changes, [importedCourse], 'coursed-2024').map(
        c => c.op,
      ),
    ).toEqual(['attachExistingLevel']);
  });

  it('keeps scoping a removed object to its course (log-replay survives removal)', () => {
    seq = 0;
    const changes: CurriculumChange[] = [
      {
        ...stamp(),
        op: 'createCourse',
        course: {id: 'course-a', displayName: 'A', origin: 'draft'},
      },
      {
        ...stamp(),
        op: 'createUnit',
        courseId: 'course-a',
        unit: {id: 'unit-a', displayName: 'Unit A', origin: 'draft'},
      },
      {
        ...stamp(),
        op: 'createLesson',
        unitId: 'unit-a',
        lesson: {id: 'lesson-a', displayName: 'Lesson A', origin: 'draft'},
      },
      {
        ...stamp(),
        op: 'insertExperience',
        lessonId: 'lesson-a',
        position: 0,
        experience: {
          id: 'exp-a',
          origin: 'draft',
          kind: 'content',
          markdown: 'hi',
        },
      },
      {
        ...stamp(),
        op: 'removeExperience',
        lessonId: 'lesson-a',
        experienceId: 'exp-a',
      },
    ];

    expect(changesForCourse(changes, [], 'course-a').map(c => c.op)).toEqual([
      'removeExperience',
      'insertExperience',
      'createLesson',
      'createUnit',
      'createCourse',
    ]);
  });

  it('resolves a widget-kind createWidget/updateWidgetMetadata via the experience that placed it', () => {
    seq = 0;
    const widget: WidgetDescriptor = {
      id: 'widget-1',
      toolName: 'present_sorter',
      title: 'Sorter',
      description: 'Sort samples.',
      inputSchema: {type: 'object'},
      resourceUri: 'ui://widgets/widget-1.html',
      visibility: ['model', 'app'],
      network: 'none',
    };
    const changes: CurriculumChange[] = [
      {
        ...stamp(),
        op: 'createCourse',
        course: {id: 'course-a', displayName: 'A', origin: 'draft'},
      },
      {
        ...stamp(),
        op: 'createUnit',
        courseId: 'course-a',
        unit: {id: 'unit-a', displayName: 'Unit A', origin: 'draft'},
      },
      {
        ...stamp(),
        op: 'createLesson',
        unitId: 'unit-a',
        lesson: {id: 'lesson-a', displayName: 'Lesson A', origin: 'draft'},
      },
      {...stamp(), op: 'createWidget', descriptor: widget},
      {
        ...stamp(),
        op: 'insertExperience',
        lessonId: 'lesson-a',
        position: 0,
        experience: {
          id: 'exp-widget',
          origin: 'draft',
          kind: 'widget',
          widgetId: 'widget-1',
          toolName: 'present_sorter',
        },
      },
      {
        ...stamp(),
        op: 'updateWidgetMetadata',
        widgetId: 'widget-1',
        patch: {title: 'Sorter v2'},
      },
    ];

    expect(changesForCourse(changes, [], 'course-a').map(c => c.op)).toEqual(
      expect.arrayContaining(['createWidget', 'updateWidgetMetadata']),
    );
  });
});

describe('summarizeChange', () => {
  const courses: CourseModel[] = [];

  it('summarizes attachExistingLevel by lesson name', () => {
    const change: CurriculumChange = {
      seq: 1,
      at: '2026-08-26T00:00:00.000Z',
      actor: 'author',
      op: 'attachExistingLevel',
      lessonId: 'lesson-a',
      levelKey: 'Oceans_FishVTrash_2024',
      position: 0,
    };
    expect(summarizeChange(change, courses)).toContain(
      'Oceans_FishVTrash_2024',
    );
  });

  it('summarizes overrideLevelInstructions', () => {
    const change: CurriculumChange = {
      seq: 1,
      at: '2026-08-26T00:00:00.000Z',
      actor: 'agent',
      op: 'overrideLevelInstructions',
      experienceId: 'lb:some_maze_level',
      patch: {shortInstructions: 'x'},
    };
    expect(summarizeChange(change, courses)).toMatch(/instructions/i);
  });
});
