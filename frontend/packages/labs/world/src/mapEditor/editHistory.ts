// Undo and redo for a Screen or Map editor: a history of its file's contents
// (specs/SHELL_PLAN.md, step 5).
//
// Each write the editor makes is a step. A run of writes from one gesture is
// one step: a write names its gesture (`group`), and one of the same gesture
// soon after the last joins it, so typing "12" into the width undoes to what
// was there before the 1, not to 1. A drag is one write already; the stage
// writes when it ends.
//
// What the project gains besides the file — an actor or a rule added — is
// not here, and an undo does not take it away (SIMPLE_INTERFACE.md).

/** How soon a write of the same gesture joins the step before it. */
export const JOIN_MS = 1500;

/** The most steps kept; the oldest go first. */
export const MAX_STEPS = 100;

interface Step {
  /** The file as it was before the step. */
  contents: string;
  group?: string;
  at: number;
}

export interface History {
  past: readonly Step[];
  /** The files undone, the next to redo last. */
  future: readonly string[];
}

export const EMPTY_HISTORY: History = {past: [], future: []};

/**
 * The history once the file went from `before` to something else. A write
 * that changed nothing is not a step.
 */
export function record(
  history: History,
  before: string,
  after: string,
  at: number,
  group?: string,
): History {
  if (before === after) {
    return history;
  }
  const last = history.past[history.past.length - 1];
  if (group && last?.group === group && at - last.at < JOIN_MS) {
    // The same gesture: the step still undoes to before it began.
    return {
      past: [...history.past.slice(0, -1), {...last, at}],
      future: [],
    };
  }
  return {
    past: [...history.past, {contents: before, group, at}].slice(-MAX_STEPS),
    future: [],
  };
}

/** The file one step back, and the history after, or nothing to undo. */
export function undo(
  history: History,
  current: string,
): {contents: string; history: History} | undefined {
  const last = history.past[history.past.length - 1];
  if (!last) {
    return undefined;
  }
  return {
    contents: last.contents,
    history: {
      past: history.past.slice(0, -1),
      future: [...history.future, current],
    },
  };
}

/** The file one step forward again, or nothing to redo. */
export function redo(
  history: History,
  current: string,
  at: number,
): {contents: string; history: History} | undefined {
  const next = history.future[history.future.length - 1];
  if (next === undefined) {
    return undefined;
  }
  return {
    contents: next,
    history: {
      past: [...history.past, {contents: current, at}],
      future: history.future.slice(0, -1),
    },
  };
}
