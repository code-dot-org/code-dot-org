// Asking whoever owns a piece of state to put a place on screen.
//
// A place may need a view shown, a placement selected or a drawer opened
// before its target exists (`places`). None of that is `pointAt`'s to do:
// the view is the world editor's state, the selection the map stage's, the
// toolbox Blockly's. Each registers an answer while it is mounted and takes
// it back when it goes, the way the lab's other seams work
// (`blockly/libraryImport`, `blockly/openModule`).
//
// NOBODY ANSWERING IS ORDINARY. The target may be on screen already, and if
// it is not, the words are still said. An answer may also REFUSE — the map's
// script view answers no reveal, since a reveal never leaves a script a
// learner has open (specs/SHOW_ME_PLAN.md).

import type {Reveal} from './places';

/**
 * Do what a reveal asks. May answer with words to add to what is announced —
 * the drawer a block was found in — or `false` to say it would not.
 */
export type Revealer<K extends Reveal['kind']> = (
  reveal: Extract<Reveal, {kind: K}>,
) => string | boolean | void;

const revealers: {[K in Reveal['kind']]?: Revealer<K>} = {};

/** Register the answer for one kind of reveal, or take it back with `null`. */
export function setRevealer<K extends Reveal['kind']>(
  kind: K,
  revealer: Revealer<K> | null,
): void {
  if (revealer) {
    revealers[kind] = revealer as never;
  } else {
    delete revealers[kind];
  }
}

/** Ask for one reveal. Nothing registered answers `undefined`. */
export function reveal(step: Reveal): string | boolean | void {
  const revealer = revealers[step.kind] as Revealer<Reveal['kind']> | undefined;
  return revealer?.(step as never);
}
