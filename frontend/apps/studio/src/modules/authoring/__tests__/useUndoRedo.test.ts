import {act, renderHook, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {CourseModel, CurriculumChange} from '@code-dot-org/authoring';

import {authoringApi} from '../api';
import {useUndoRedo} from '../useUndoRedo';

vi.mock('../api', () => ({authoringApi: {applyChange: vi.fn()}}));

const stamp = {at: '2026-08-27T00:00:00.000Z', actor: 'author'} as const;
const courses: CourseModel[] = [];

const applyChange = vi.mocked(authoringApi.applyChange);

describe('useUndoRedo', () => {
  beforeEach(() => {
    applyChange.mockReset();
  });

  it('has nothing to undo or redo against an empty log', () => {
    const {result} = renderHook(() => useUndoRedo([], courses));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('undo applies the compensating change and offers redo for a redoable op', async () => {
    const original: CurriculumChange = {
      ...stamp,
      seq: 1,
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'new'},
      previous: {shortInstructions: 'old'},
    };
    const revertChange: CurriculumChange = {
      ...stamp,
      seq: 2,
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'old'},
      previous: {shortInstructions: 'new'},
    };
    applyChange.mockResolvedValue({version: 2, change: revertChange});

    const {result, rerender} = renderHook(
      ({changes}: {changes: CurriculumChange[]}) => useUndoRedo(changes, courses),
      {initialProps: {changes: [original] as CurriculumChange[]}},
    );
    expect(result.current.canUndo).toBe(true);
    expect(result.current.undoLabel).toMatch(/instructions/i);
    expect(result.current.canRedo).toBe(false);

    act(() => result.current.undo());
    await waitFor(() => expect(result.current.busy).toBe(false));

    expect(applyChange).toHaveBeenCalledWith({
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'old'},
    });
    // The log has grown by exactly the one revert entry the server reported
    // back — this is what makes Redo available.
    rerender({changes: [original, revertChange]});
    expect(result.current.canRedo).toBe(true);
    expect(result.current.redoLabel).toMatch(/instructions/i);

    act(() => result.current.redo());
    await waitFor(() => expect(result.current.busy).toBe(false));
    expect(applyChange).toHaveBeenLastCalledWith({
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'new'},
    });
  });

  it('does not offer redo once the log grows for any other reason', async () => {
    const original: CurriculumChange = {
      ...stamp,
      seq: 1,
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'new'},
      previous: {shortInstructions: 'old'},
    };
    const revertChange: CurriculumChange = {
      ...stamp,
      seq: 2,
      op: 'overrideLevelInstructions',
      experienceId: 'lb:x',
      patch: {shortInstructions: 'old'},
      previous: {shortInstructions: 'new'},
    };
    applyChange.mockResolvedValue({version: 2, change: revertChange});

    const {result, rerender} = renderHook(
      ({changes}: {changes: CurriculumChange[]}) => useUndoRedo(changes, courses),
      {initialProps: {changes: [original] as CurriculumChange[]}},
    );
    act(() => result.current.undo());
    await waitFor(() => expect(result.current.busy).toBe(false));

    const somethingElse: CurriculumChange = {
      ...stamp,
      seq: 3,
      op: 'updateContent',
      experienceId: 'lb:y',
      patch: {title: 'unrelated'},
    };
    rerender({changes: [original, revertChange, somethingElse]});
    expect(result.current.canRedo).toBe(false);
  });

  it('does not offer redo after undoing a non-redoable op', async () => {
    const original: CurriculumChange = {
      ...stamp,
      seq: 1,
      op: 'insertExperience',
      lessonId: 'lesson-1',
      position: 0,
      experience: {id: 'draft-exp-1', origin: 'draft', kind: 'content', markdown: 'hi'},
    };
    const revertChange: CurriculumChange = {
      ...stamp,
      seq: 2,
      op: 'removeExperience',
      lessonId: 'lesson-1',
      experienceId: 'draft-exp-1',
    };
    applyChange.mockResolvedValue({version: 2, change: revertChange});

    const {result, rerender} = renderHook(
      ({changes}: {changes: CurriculumChange[]}) => useUndoRedo(changes, courses),
      {initialProps: {changes: [original] as CurriculumChange[]}},
    );
    act(() => result.current.undo());
    await waitFor(() => expect(result.current.busy).toBe(false));

    rerender({changes: [original, revertChange]});
    expect(result.current.canRedo).toBe(false);
  });

  it('surfaces a failed undo (e.g. the moved-experience edge) as an error, not a crash', async () => {
    const original: CurriculumChange = {
      ...stamp,
      seq: 1,
      op: 'insertExperience',
      lessonId: 'lesson-1',
      position: 0,
      experience: {id: 'draft-exp-1', origin: 'draft', kind: 'content', markdown: 'hi'},
    };
    applyChange.mockRejectedValue(new Error('Experience not found: draft-exp-1'));

    const {result} = renderHook(() => useUndoRedo([original], courses));
    act(() => result.current.undo());
    await waitFor(() => expect(result.current.busy).toBe(false));
    expect(result.current.error).toBe('Experience not found: draft-exp-1');
  });
});
