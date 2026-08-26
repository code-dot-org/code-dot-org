import {describe, expect, it} from 'vitest';

import {applyChange, type AuthoringState} from '../apply';
import type {
  ContentExperience,
  CourseModel,
  ExistingLevelExperience,
} from '../types';

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function content(id: string, markdown = 'hello'): ContentExperience {
  return {id, origin: 'draft', kind: 'content', markdown};
}

function baseState(): AuthoringState {
  const course: CourseModel = {
    id: 'course-1',
    displayName: 'Course One',
    origin: 'draft',
    units: [
      {
        id: 'unit-1',
        displayName: 'Unit One',
        origin: 'draft',
        lessons: [
          {
            id: 'lesson-1',
            displayName: 'Lesson One',
            origin: 'draft',
            experiences: [content('exp-1'), content('exp-2')],
          },
          {
            id: 'lesson-2',
            displayName: 'Lesson Two',
            origin: 'draft',
            experiences: [],
          },
        ],
      },
    ],
  };
  return {courses: [course], widgets: []};
}

function frozenBaseState(): AuthoringState {
  return deepFreeze(baseState());
}

describe('applyChange', () => {
  it('inserts an experience at a clamped position', () => {
    const state = frozenBaseState();
    const next = applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'author',
      op: 'insertExperience',
      lessonId: 'lesson-1',
      experience: content('exp-new'),
      position: 100, // out of bounds — clamps to the end
    });
    const lesson = next.courses[0].units[0].lessons[0];
    expect(lesson.experiences.map(e => e.id)).toEqual([
      'exp-1',
      'exp-2',
      'exp-new',
    ]);
  });

  it('removes an experience', () => {
    const state = frozenBaseState();
    const next = applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'author',
      op: 'removeExperience',
      lessonId: 'lesson-1',
      experienceId: 'exp-1',
    });
    const lesson = next.courses[0].units[0].lessons[0];
    expect(lesson.experiences.map(e => e.id)).toEqual(['exp-2']);
  });

  it('removes a course', () => {
    const state = frozenBaseState();
    const next = applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'author',
      op: 'removeCourse',
      courseId: 'course-1',
    });
    expect(next.courses).toEqual([]);
  });

  it('removing a course leaves other courses and all widgets untouched', () => {
    const state = deepFreeze({
      courses: [...baseState().courses, {...baseState().courses[0], id: 'course-2'}],
      widgets: [
        {
          id: 'widget-1',
          toolName: 'thing',
          title: 'Thing',
          description: 'a widget',
          inputSchema: {},
          resourceUri: 'ui://widgets/widget-1.html',
          visibility: ['model' as const, 'app' as const],
          network: 'none' as const,
        },
      ],
    });
    const next = applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'author',
      op: 'removeCourse',
      courseId: 'course-1',
    });
    expect(next.courses.map(c => c.id)).toEqual(['course-2']);
    // A removed course's widgets are orphaned in the store, not deleted —
    // the op only ever touches `courses`.
    expect(next.widgets).toEqual(state.widgets);
  });

  it('throws a clear error for an unknown course id on removeCourse', () => {
    const state = frozenBaseState();
    expect(() =>
      applyChange(state, {
        seq: 1,
        at: 'now',
        actor: 'author',
        op: 'removeCourse',
        courseId: 'no-such-course',
      }),
    ).toThrow(/no-such-course/);
  });

  it('moves an experience within the same lesson', () => {
    const state = frozenBaseState();
    const next = applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'author',
      op: 'moveExperience',
      lessonId: 'lesson-1',
      experienceId: 'exp-1',
      toPosition: 1,
    });
    const lesson = next.courses[0].units[0].lessons[0];
    expect(lesson.experiences.map(e => e.id)).toEqual(['exp-2', 'exp-1']);
  });

  it('moves an experience across lessons', () => {
    const state = frozenBaseState();
    const next = applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'author',
      op: 'moveExperience',
      lessonId: 'lesson-1',
      experienceId: 'exp-1',
      toPosition: 0,
      toLessonId: 'lesson-2',
    });
    const [lessonOne, lessonTwo] = next.courses[0].units[0].lessons;
    expect(lessonOne.experiences.map(e => e.id)).toEqual(['exp-2']);
    expect(lessonTwo.experiences.map(e => e.id)).toEqual(['exp-1']);
  });

  it('updates content markdown and title', () => {
    const state = frozenBaseState();
    const next = applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'author',
      op: 'updateContent',
      experienceId: 'exp-1',
      patch: {title: 'New title', markdown: 'updated'},
    });
    const experience = next.courses[0].units[0].lessons[0]
      .experiences[0] as ContentExperience;
    expect(experience.title).toBe('New title');
    expect(experience.markdown).toBe('updated');
  });

  it('creates a lesson at a clamped position', () => {
    const state = frozenBaseState();
    const next = applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'author',
      op: 'createLesson',
      unitId: 'unit-1',
      lesson: {
        id: 'lesson-new',
        displayName: 'New Lesson',
        origin: 'draft',
      },
      position: 0,
    });
    const lessons = next.courses[0].units[0].lessons;
    expect(lessons.map(l => l.id)).toEqual([
      'lesson-new',
      'lesson-1',
      'lesson-2',
    ]);
    expect(lessons[0].experiences).toEqual([]);
  });

  it('attaches a resolved existing level', () => {
    const state = frozenBaseState();
    const resolved: ExistingLevelExperience = {
      id: 'lb:Oceans_FishVTrash_2024',
      origin: 'levelbuilder',
      kind: 'existingLevel',
      levelKey: 'Oceans_FishVTrash_2024',
      levelType: 'Fish',
      runtime: 'labhost',
      labKey: 'oceans',
      levelNumericId: 9000001,
    };
    const next = applyChange(
      state,
      {
        seq: 1,
        at: 'now',
        actor: 'agent',
        op: 'attachExistingLevel',
        lessonId: 'lesson-2',
        levelKey: 'Oceans_FishVTrash_2024',
        position: 0,
      },
      () => resolved,
    );
    const lesson = next.courses[0].units[0].lessons[1];
    expect(lesson.experiences).toEqual([resolved]);
  });

  it('attaches an unresolvable existing level as opaque/unsupported', () => {
    const state = frozenBaseState();
    const next = applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'agent',
      op: 'attachExistingLevel',
      lessonId: 'lesson-2',
      levelKey: 'Some_Unknown_Level',
      position: 0,
    });
    const experience = next.courses[0].units[0].lessons[1]
      .experiences[0] as ExistingLevelExperience;
    expect(experience.levelKey).toBe('Some_Unknown_Level');
    expect(experience.runtime).toBe('unsupported');
    expect(experience.data).toEqual({
      type: 'opaque',
      levelType: 'unknown',
      properties: {},
    });
  });

  it('throws a clear error for an unknown lesson id', () => {
    const state = frozenBaseState();
    expect(() =>
      applyChange(state, {
        seq: 1,
        at: 'now',
        actor: 'author',
        op: 'removeExperience',
        lessonId: 'no-such-lesson',
        experienceId: 'exp-1',
      }),
    ).toThrow(/no-such-lesson/);
  });

  it('throws a clear error for an unknown experience id', () => {
    const state = frozenBaseState();
    expect(() =>
      applyChange(state, {
        seq: 1,
        at: 'now',
        actor: 'author',
        op: 'updateContent',
        experienceId: 'no-such-experience',
        patch: {markdown: 'x'},
      }),
    ).toThrow(/no-such-experience/);
  });

  it('does not mutate the input state', () => {
    const state = frozenBaseState();
    const snapshotBefore = JSON.stringify(state);
    applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'author',
      op: 'insertExperience',
      lessonId: 'lesson-1',
      experience: content('exp-new'),
      position: 0,
    });
    expect(JSON.stringify(state)).toBe(snapshotBefore);
  });

  it('leaves unrelated siblings referentially unchanged', () => {
    const state = frozenBaseState();
    const next = applyChange(state, {
      seq: 1,
      at: 'now',
      actor: 'author',
      op: 'updateContent',
      experienceId: 'exp-1',
      patch: {title: 'changed'},
    });
    expect(next.courses[0].units[0].lessons[1]).toBe(
      state.courses[0].units[0].lessons[1],
    );
  });
});
