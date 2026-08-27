// Who holds the progression, and the one modal it opens.
//
// Everything that can open the map calls `openTree` on the context: the button
// in the resource panel's icon strip, and — once they are wired — the "how this
// works" link on a rule's row in the import dialog, on a rule's toolbox
// category, and beside the `use trait` eye (specs/PROGRESSION_UI.md).
//
// One provider at the lab root, and exactly ONE modal, rendered here. A dialog
// per opener is the bug this shape prevents: two maps on screen, each with its
// own scroll position, and a close button that shuts one of them.
//
// The provider is also where progress lives. In this milestone it lives in
// component state and nowhere else — see specs/PROGRESSION_UI.md, "Where
// progress is stored", which is milestone 4.

import {useEffect, useMemo, useState, type PropsWithChildren} from 'react';

import {ProgressionContext, type Progression} from './progressionContext';
import {ProgressionDialog} from './ProgressionDialog';
import {loadProgress, saveProgress} from './progressStore';
import type {TileId} from './types';

import {TILES_BY_ID, tileState} from './index';

export interface ProgressionProviderProps {
  /**
   * What to start from, INSTEAD of what is stored. For a test or a story; the
   * lab passes nothing and reads the store.
   */
  initiallyCompleted?: readonly TileId[];
}

export const ProgressionProvider = ({
  children,
  initiallyCompleted,
}: PropsWithChildren<ProgressionProviderProps>) => {
  const [completed, setCompleted] = useState<ReadonlySet<TileId>>(() =>
    initiallyCompleted ? new Set(initiallyCompleted) : loadProgress(),
  );
  const [open, setOpen] = useState<{focus?: TileId} | undefined>();

  // Written on every change rather than on close: a learner who finishes a tile
  // and then closes the tab has finished it (./progressStore).
  useEffect(() => {
    if (!initiallyCompleted) {
      saveProgress(completed);
    }
  }, [completed, initiallyCompleted]);

  const value = useMemo<Progression>(
    () => ({
      completed,
      stateOf: (id: TileId) => tileState(completed, id),
      openTree: (focus?: TileId) => setOpen({focus}),
      closeTree: () => setOpen(undefined),
      isOpen: open !== undefined,
      complete: (id: TileId) =>
        setCompleted(previous =>
          previous.has(id) ? previous : new Set([...previous, id]),
        ),
    }),
    [completed, open],
  );

  return (
    <ProgressionContext.Provider value={value}>
      {children}
      {open && (
        <ProgressionDialog
          // A focus the catalogue does not know is treated as no focus rather
          // than as an error: the id may have come off a URL somebody typed, or
          // a link that outlived a catalogue change.
          initialSelection={
            open.focus && TILES_BY_ID.has(open.focus) ? open.focus : undefined
          }
        />
      )}
    </ProgressionContext.Provider>
  );
};
