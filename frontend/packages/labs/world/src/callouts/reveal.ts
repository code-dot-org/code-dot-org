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
export type RevealAnswer = string | boolean | void;

export type Revealer<K extends Reveal['kind']> = (
  reveal: Extract<Reveal, {kind: K}>,
) => RevealAnswer | Promise<RevealAnswer>;

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

/**
 * Ask for one reveal. Nothing registered answers `undefined`.
 *
 * An answer may be a PROMISE: what has to happen may take time an owner
 * knows about and the caller does not — a Blockly workspace is injected
 * after the editor that holds it has mounted, so the toolbox waits for its
 * own workspace rather than making `pointAt` guess a delay.
 */
export function reveal(step: Reveal): RevealAnswer | Promise<RevealAnswer> {
  const revealer = revealers[step.kind] as Revealer<Reveal['kind']> | undefined;
  return revealer?.(step as never);
}

/**
 * Wait for something to exist, or give up.
 *
 * For a revealer whose own thing arrives late — a Blockly workspace, which
 * is injected a tick or two after the editor mounts. Polled rather than
 * subscribed to: what is waited for is somebody else's ref, and a poll that
 * gives up is the whole of what is wanted.
 */
export async function waitFor<T>(
  look: () => T | null | undefined,
  {tries = 40, every = 25}: {tries?: number; every?: number} = {},
): Promise<T | undefined> {
  for (let n = 0; n < tries; n++) {
    const found = look();
    if (found) {
      return found;
    }
    await new Promise(resolve => setTimeout(resolve, every));
  }
  return look() ?? undefined;
}
