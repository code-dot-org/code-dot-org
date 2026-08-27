import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {applyChange} from '@code-dot-org/authoring';

import type {CourseModel} from '../../authoring/model.js';
import {EMPTY_SNAPSHOT, SessionStore} from '../../store/SessionStore.js';
import {AuthoringState} from '../AuthoringState.js';

let root: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'authoring-session-'));
});

afterEach(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

function stateWithLevel(): AuthoringState {
  const level = {
    id: 'lb:some_maze_level',
    origin: 'levelbuilder' as const,
    kind: 'existingLevel' as const,
    levelKey: 'some_maze_level',
    levelType: 'Maze',
    runtime: 'labhost' as const,
    labKey: 'maze' as const,
    levelNumericId: 7,
  };
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
            experiences: [level],
          },
        ],
      },
    ],
  };
  const store = new SessionStore(root);
  return new AuthoringState({
    store,
    // The real reducer, not a stand-in — this test exists specifically to
    // exercise the levelProperties side effect layered on top of it.
    applyChange,
    snapshot: {
      ...EMPTY_SNAPSHOT,
      courses: [course],
      levelProperties: {
        '7': {
          id: 7,
          appName: 'maze',
          shortInstructions: 'Original short instructions.',
        },
      },
    },
    changes: [],
  });
}

describe('AuthoringState overrideLevelInstructions', () => {
  it('folds the override onto the served levelProperties entry', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Reworded for 2nd grade.'},
      },
      'author',
    );

    const properties = state.getLevelProperties('7');
    expect(properties?.shortInstructions).toBe('Reworded for 2nd grade.');
    // Fields the override didn't touch survive untouched.
    expect(properties?.appName).toBe('maze');
  });

  it('records the override on the experience in the change log and outline', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {longInstructions: 'Turn left, then walk to the goal.'},
      },
      'agent',
    );

    expect(state.getChanges()).toHaveLength(1);
    expect(state.getChanges()[0]).toMatchObject({
      op: 'overrideLevelInstructions',
      experienceId: 'lb:some_maze_level',
      actor: 'agent',
    });

    const experience = state.getSnapshot().courses[0].units[0].lessons[0]
      .experiences[0] as {instructionsOverride?: unknown};
    expect(experience.instructionsOverride).toEqual({
      longInstructions: 'Turn left, then walk to the goal.',
    });
  });

  it('bumps the version exactly once for one change', () => {
    const state = stateWithLevel();
    const versionBefore = state.version;
    state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'x'},
      },
      'author',
    );
    expect(state.version).toBe(versionBefore + 1);
  });
});

describe('AuthoringState overrideLevelInstructions previous capture', () => {
  it('captures the imported original as `previous` on the first override', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Reworded for 2nd grade.'},
      },
      'author',
    );
    expect(change).toMatchObject({
      previous: {shortInstructions: 'Original short instructions.'},
    });
  });

  it('captures the prior override as `previous` on a second override of the same field', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'First rewrite.'},
      },
      'author',
    );
    const second = state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Second rewrite.'},
      },
      'author',
    );
    expect(second).toMatchObject({
      previous: {shortInstructions: 'First rewrite.'},
    });
  });

  it('captures an empty string, not undefined, for a field that never had a value', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {longInstructions: 'Turn left, then walk to the goal.'},
      },
      'author',
    );
    expect(change).toMatchObject({previous: {longInstructions: ''}});
  });

  it('only captures the fields the patch itself touches', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Reworded.'},
      },
      'author',
    );
    expect(
      (change as {previous?: {longInstructions?: string}}).previous,
    ).not.toHaveProperty('longInstructions');
  });

  it('ignores a client-supplied `previous` and recomputes it authoritatively', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Reworded.'},
        // Simulates a spoofed request body reaching applyCurriculumChange
        // directly — CurriculumChangeBodySchema would strip this in the real
        // POST /api/changes path, but the type itself allows it (it's the
        // same field the server stamps authoritatively below).
        previous: {shortInstructions: 'Attacker-supplied lie.'},
      },
      'author',
    );
    expect(change).toMatchObject({
      previous: {shortInstructions: 'Original short instructions.'},
    });
  });
});
