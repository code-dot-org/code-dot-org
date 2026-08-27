import {describe, expect, it} from 'vitest';

import type {CurriculumChange} from '@code-dot-org/authoring';

import {buildRevertChangeBody} from '../revert';
import {findUndoTarget, isRedoable} from '../undoRedo';

const stamp = {at: '2026-08-27T00:00:00.000Z', actor: 'author'} as const;

describe('findUndoTarget', () => {
  it('returns undefined for an empty log', () => {
    expect(findUndoTarget([])).toBeUndefined();
  });

  it('returns undefined when nothing in the log is revertible', () => {
    const change: CurriculumChange = {
      ...stamp,
      seq: 1,
      op: 'updateContent',
      experienceId: 'lb:x',
      patch: {title: 'x'},
    };
    expect(findUndoTarget([change])).toBeUndefined();
  });

  it('skips trailing non-revertible ops to find the newest revertible one', () => {
    const revertible: CurriculumChange = {
      ...stamp,
      seq: 1,
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'new'},
      previous: {shortInstructions: 'old'},
    };
    const nonRevertible: CurriculumChange = {
      ...stamp,
      seq: 2,
      op: 'updateContent',
      experienceId: 'lb:x',
      patch: {title: 'renamed'},
    };
    const target = findUndoTarget([revertible, nonRevertible]);
    expect(target?.change).toBe(revertible);
    expect(target?.revertBody).toEqual({
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'old'},
    });
  });

  it('picks the most recent revertible entry, not the first', () => {
    const older: CurriculumChange = {
      ...stamp,
      seq: 1,
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'v1'},
      previous: {shortInstructions: 'v0'},
    };
    const newer: CurriculumChange = {
      ...stamp,
      seq: 2,
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'v2'},
      previous: {shortInstructions: 'v1'},
    };
    expect(findUndoTarget([older, newer])?.change).toBe(newer);
  });
});

describe('isRedoable', () => {
  it.each(['overrideLevelInstructions', 'overrideLevelDefinition'] as const)(
    '%s is redoable — the server re-captures `previous` on every apply',
    op => {
      const change = {
        ...stamp,
        seq: 1,
        op,
        experienceId: 'lb:x',
        patch: {},
      } as unknown as CurriculumChange;
      expect(isRedoable(change)).toBe(true);
    },
  );

  it.each(['insertExperience', 'createLevel', 'attachExistingLevel'] as const)(
    '%s is not redoable — its revert (removeExperience) retains nothing to replay',
    op => {
      const change = {...stamp, seq: 1, op} as unknown as CurriculumChange;
      expect(isRedoable(change)).toBe(false);
    },
  );
});

describe('undo/redo round-trip per op type', () => {
  it('overrideLevelInstructions: reverting the revert restores the pre-undo patch', () => {
    const original: CurriculumChange = {
      ...stamp,
      seq: 1,
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'Reworded.'},
      previous: {shortInstructions: 'Original.'},
    };
    const undoBody = buildRevertChangeBody(original);
    if (undoBody?.op !== 'overrideLevelInstructions') {
      throw new Error('expected an overrideLevelInstructions revert body');
    }
    expect(undoBody.patch).toEqual({shortInstructions: 'Original.'});

    // The server applies undoBody and captures ITS OWN `previous` from
    // whatever was current just before that apply — i.e. original.patch
    // (AuthoringState.capturePreviousInstructions). Simulate that capture to
    // verify Redo (buildRevertChangeBody of the revert) reproduces the
    // pre-undo edit exactly.
    const revertChange: CurriculumChange = {
      ...stamp,
      seq: 2,
      op: 'overrideLevelInstructions',
      experienceId: undoBody.experienceId,
      patch: undoBody.patch,
      previous: original.patch,
    };
    expect(buildRevertChangeBody(revertChange)).toEqual({
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'Reworded.'},
    });
  });

  it('overrideLevelDefinition: same round-trip, including a null (delete-key) previous', () => {
    const original: CurriculumChange = {
      ...stamp,
      seq: 1,
      op: 'overrideLevelDefinition',
      experienceId: 'lb:x',
      patch: {startDirection: '2'},
      previous: {startDirection: null},
    };
    const undoBody = buildRevertChangeBody(original);
    if (undoBody?.op !== 'overrideLevelDefinition') {
      throw new Error('expected an overrideLevelDefinition revert body');
    }
    const revertChange: CurriculumChange = {
      ...stamp,
      seq: 2,
      op: 'overrideLevelDefinition',
      experienceId: undoBody.experienceId,
      patch: undoBody.patch,
      previous: original.patch,
    };
    expect(buildRevertChangeBody(revertChange)).toEqual({
      op: 'overrideLevelDefinition',
      experienceId: 'lb:x',
      patch: {startDirection: '2'},
    });
  });

  it.each([
    [
      'insertExperience',
      {
        op: 'insertExperience',
        lessonId: 'lesson-1',
        position: 0,
        experience: {
          id: 'draft-exp-1',
          origin: 'draft',
          kind: 'content',
          markdown: 'hi',
        },
      },
    ],
    [
      'createLevel',
      {
        op: 'createLevel',
        lessonId: 'lesson-1',
        position: 0,
        level: {
          id: 'draft-exp-2',
          origin: 'draft',
          kind: 'existingLevel',
          levelKey: 'draft:draft-level-2',
          levelType: 'Maze',
          runtime: 'labhost',
          labKey: 'maze',
          levelNumericId: 9,
        },
      },
    ],
    [
      'attachExistingLevel',
      {op: 'attachExistingLevel', lessonId: 'lesson-1', levelKey: 'x', position: 0},
    ],
  ] as const)(
    '%s: Undo works once, but its removeExperience revert offers no Redo',
    (_label, body) => {
      const original: CurriculumChange = {...stamp, seq: 1, ...body};
      expect(isRedoable(original)).toBe(false);
      const undoBody = buildRevertChangeBody(original)!;
      const revertChange: CurriculumChange = {...stamp, seq: 2, ...undoBody};
      expect(buildRevertChangeBody(revertChange)).toBeUndefined();
    },
  );
});
