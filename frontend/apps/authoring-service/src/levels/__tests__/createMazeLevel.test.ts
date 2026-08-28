import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {applyChange} from '@code-dot-org/authoring';

import type {CourseModel} from '../../authoring/model.js';
import {AuthoringState} from '../../state/AuthoringState.js';
import {EMPTY_SNAPSHOT, SessionStore} from '../../store/SessionStore.js';
import {createMazeLevel} from '../createMazeLevel.js';
import {buildBlankMazeLevelDefinition} from '../mazeLevel.js';

let root: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'authoring-session-'));
});

afterEach(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

function emptyLessonState(): {state: AuthoringState; store: SessionStore} {
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
            experiences: [],
          },
        ],
      },
    ],
  };
  const store = new SessionStore(root);
  const state = new AuthoringState({
    store,
    applyChange,
    snapshot: {...EMPTY_SNAPSHOT, courses: [course]},
    changes: [],
  });
  return {state, store};
}

describe('createMazeLevel', () => {
  it('inserts a new existingLevel experience and registers its levelProperties', () => {
    const {state, store} = emptyLessonState();
    const result = createMazeLevel(state, store, {
      lessonId: 'lesson-1',
      position: 0,
      title: 'My new level',
      definition: buildBlankMazeLevelDefinition({skin: 'bee'}),
      actor: 'author',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const lesson = state.getSnapshot().courses[0].units[0].lessons[0];
    expect(lesson.experiences).toHaveLength(1);
    expect(lesson.experiences[0]).toMatchObject({
      id: result.experienceId,
      kind: 'existingLevel',
      levelKey: `draft:${result.levelId}`,
      title: 'My new level',
      levelNumericId: result.levelNumericId,
    });

    const properties = state.getLevelProperties(String(result.levelNumericId));
    expect(properties?.appName).toBe('maze');
    expect(properties?.skin).toBe('bee');
  });

  it('rejects an unsolvable definition without allocating an id or touching the lesson', () => {
    const {state, store} = emptyLessonState();
    const before = state.nextLevelNumericId();

    const result = createMazeLevel(state, store, {
      lessonId: 'lesson-1',
      position: 0,
      title: 'Broken level',
      definition: {
        ...buildBlankMazeLevelDefinition({}),
        // No block moves Pegman from start to finish.
        solution: [{type: 'turnLeft'}],
      },
      actor: 'author',
    });

    expect(result.ok).toBe(false);
    const lesson = state.getSnapshot().courses[0].units[0].lessons[0];
    expect(lesson.experiences).toHaveLength(0);
    expect(state.nextLevelNumericId()).toBe(before);
  });
});
