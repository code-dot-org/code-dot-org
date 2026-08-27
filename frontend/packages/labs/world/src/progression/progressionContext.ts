// The progression a component can reach, and nothing that renders.
//
// Split from the provider (./ProgressionProvider) for one reason: the provider
// renders the modal, the modal reads the context, and a module that did both
// would be a cycle. What is here is the shape and the hook, which everything
// can depend on.

import {createContext, useContext} from 'react';

import type {TileId, TileState} from './types';

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
}

export const ProgressionContext = createContext<Progression | undefined>(
  undefined,
);

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
