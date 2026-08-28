import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {applyChange} from '@code-dot-org/authoring';

import type {CourseModel} from '../../authoring/model.js';
import {AuthoringState} from '../../state/AuthoringState.js';
import {EMPTY_SNAPSHOT, SessionStore} from '../../store/SessionStore.js';
import {createMazeLevel} from '../createMazeLevel.js';
import {buildBlankMazeLevelDefinition, type MazeLevelDefinition} from '../mazeLevel.js';

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

  describe('debugging levels (startProgram)', () => {
    // A blank template's trivial 1-block solution has no room for a
    // near-miss bug, so these tests build a definition with a slightly
    // longer, deliberately turnable solution.
    function debuggableDefinition(
      overrides: Partial<MazeLevelDefinition> = {},
    ): MazeLevelDefinition {
      return {
        ...buildBlankMazeLevelDefinition({rows: 3, cols: 4}),
        grid: [
          [0, 0, 0, 0],
          [0, 2, 1, 0],
          [0, 1, 3, 0],
          [0, 0, 0, 0],
        ],
        startDirection: 1, // east
        toolbox: ['moveForward', 'turnLeft', 'turnRight', 'repeat'],
        solution: [
          {type: 'moveForward'},
          {type: 'turnRight'},
          {type: 'moveForward'},
        ],
        idealBlockCount: 3,
        ...overrides,
      };
    }

    it('creates a level and returns a debugNarrative for a valid buggy start', () => {
      const {state, store} = emptyLessonState();
      const result = createMazeLevel(state, store, {
        lessonId: 'lesson-1',
        position: 0,
        title: 'Debug: wrong turn',
        definition: debuggableDefinition({
          startProgram: [
            {type: 'moveForward', locked: true},
            {type: 'turnLeft'},
            {type: 'moveForward'},
          ],
        }),
        actor: 'agent',
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.debugNarrative).toMatch(/buggy start verified/);
      expect(result.debugNarrative).toMatch(/solution verified: solves in 3/);

      const properties = state.getLevelProperties(String(result.levelNumericId));
      expect(properties?.startBlocksXml).toContain('deletable="false"');
      expect(properties?.step_mode).toBe('1');
    });

    it('rejects (and creates nothing) when the start program already solves the level', () => {
      const {state, store} = emptyLessonState();
      const before = state.nextLevelNumericId();

      const result = createMazeLevel(state, store, {
        lessonId: 'lesson-1',
        position: 0,
        title: 'Not actually buggy',
        definition: debuggableDefinition({
          startProgram: [
            {type: 'moveForward'},
            {type: 'turnRight'},
            {type: 'moveForward'},
          ],
        }),
        actor: 'agent',
      });

      expect(result).toMatchObject({
        ok: false,
        reason: expect.stringMatching(/already reaches the goal/),
      });
      const lesson = state.getSnapshot().courses[0].units[0].lessons[0];
      expect(lesson.experiences).toHaveLength(0);
      expect(state.nextLevelNumericId()).toBe(before);
    });

    it('carries no debugNarrative for an ordinary (non-debug) level', () => {
      const {state, store} = emptyLessonState();
      const result = createMazeLevel(state, store, {
        lessonId: 'lesson-1',
        position: 0,
        title: 'Ordinary level',
        definition: buildBlankMazeLevelDefinition({}),
        actor: 'agent',
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.debugNarrative).toBeUndefined();
    });
  });
});
