// Undo and redo for a Screen or Map editor (specs/SHELL_PLAN.md, step 5).

import {describe, expect, it} from 'vitest';

import {
  EMPTY_HISTORY,
  JOIN_MS,
  MAX_STEPS,
  record,
  redo,
  undo,
  type History,
} from '../editHistory';

/** The writes a, b, c…, far enough apart that each is its own step. */
const wrote = (...files: string[]): History =>
  files
    .slice(1)
    .reduce(
      (history, file, at) => record(history, files[at], file, at * 10_000),
      EMPTY_HISTORY,
    );

describe('the edit history', () => {
  it('undoes each write, and redoes them in order', () => {
    let history = wrote('a', 'b', 'c');
    let step = undo(history, 'c')!;
    expect(step.contents).toBe('b');
    step = undo(step.history, 'b')!;
    expect(step.contents).toBe('a');
    expect(undo(step.history, 'a')).toBeUndefined();

    history = step.history;
    step = redo(history, 'a', 0)!;
    expect(step.contents).toBe('b');
    step = redo(step.history, 'b', 0)!;
    expect(step.contents).toBe('c');
    expect(redo(step.history, 'c', 0)).toBeUndefined();
  });

  it('forgets what was undone once something new is written', () => {
    const back = undo(wrote('a', 'b', 'c'), 'c')!;
    const history = record(back.history, 'b', 'd', 99_000);
    expect(redo(history, 'd', 0)).toBeUndefined();
    expect(undo(history, 'd')!.contents).toBe('b');
  });

  it('makes one step of a gesture, and two of the same gesture apart', () => {
    // Typing 1 then 2 into the width.
    let history = record(EMPTY_HISTORY, '10', '1', 0, 'width');
    history = record(history, '1', '12', 200, 'width');
    expect(history.past).toHaveLength(1);
    expect(undo(history, '12')!.contents).toBe('10');

    // …and typing again much later is another step.
    history = record(history, '12', '13', 200 + JOIN_MS, 'width');
    expect(history.past).toHaveLength(2);
    // …as is another gesture straight after.
    history = record(history, '13', 'x', 200 + JOIN_MS + 1, 'height');
    expect(history.past).toHaveLength(3);
  });

  it('takes no step for a write that changed nothing', () => {
    expect(record(EMPTY_HISTORY, 'a', 'a', 0)).toBe(EMPTY_HISTORY);
  });

  it('keeps the newest steps only', () => {
    let history = EMPTY_HISTORY;
    for (let at = 0; at <= MAX_STEPS; at++) {
      history = record(history, `${at}`, `${at + 1}`, at * 10_000);
    }
    expect(history.past).toHaveLength(MAX_STEPS);
    expect(history.past[0].contents).toBe('1');
  });
});
