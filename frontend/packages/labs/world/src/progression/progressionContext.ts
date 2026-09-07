// The progression a component can reach, and nothing that renders.
//
// Split from the provider (./ProgressionProvider) for one reason: the provider
// renders the modal, the modal reads the context, and a module that did both
// would be a cycle. What is here is the shape and the hook, which everything
// can depend on.

import {createContext, useContext} from 'react';

import type {TileId, TileState, UnlockTarget} from './types';

export interface Progression {
  /** What this learner has finished. */
  completed: ReadonlySet<TileId>;
  /** Whether a tile is done, open, or shut. */
  stateOf: (id: TileId) => TileState;
  /** Open the map, optionally on a particular tile. */
  openTree: (focus?: TileId) => void;
  closeTree: () => void;
  /** Whether the map is open — for a button that wants to say so. */
  isOpen: boolean;
  /** Mark a tile done. Milestone 4 gives this a check to be called from. */
  complete: (id: TileId) => void;
  /** The tile that taught a thing, for the link back to it (./LessonLink). */
  grantedBy: (unlock: UnlockTarget) => TileId | undefined;
  /**
   * Whether the stock libraries are limited to what has been unlocked
   * (./shelf). Off unless the level says otherwise.
   */
  gated: boolean;
  /** The lesson this project IS, when it is one (./lessonRoute). */
  openLesson: TileId | undefined;
  /**
   * Whether the shelf holds a thing — which is only a question worth asking
   * when `gated`. Answers true for everything otherwise, so a caller can ask
   * unconditionally and get the ungated lab's behavior for free.
   */
  holds: (unlock: UnlockTarget) => boolean;
}

export const ProgressionContext = createContext<Progression | undefined>(
  undefined,
);

/**
 * The progression if there is one, and nothing if there is not.
 *
 * For components that may render outside the lab — an import dialog opened in
 * its own test, the headless generator's world — where "there are no lessons
 * here" is a normal answer and not a bug.
 */
export const useMaybeProgression = (): Progression | undefined =>
  useContext(ProgressionContext);

/**
 * The progression, or an error.
 *
 * Throwing rather than handing back a dormant object: a button that silently
 * does nothing because it was rendered outside the provider is a bug that looks
 * like a design decision.
 */
export const useProgression = (): Progression => {
  const value = useContext(ProgressionContext);
  if (!value) {
    throw new Error('useProgression outside a ProgressionProvider');
  }
  return value;
};
