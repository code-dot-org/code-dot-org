// The map, in a modal.
//
// `CustomDialog` rather than `Dialog`: the latter is a title, a body and two
// buttons, and this is a map beside a reading pane. `CustomDialog` brings the
// focus trap, `Esc`, the body scroll lock and the close button, which is
// everything a dialog owes and nothing it does not.
//
// The URL carries the selection (`?tree=<tileId>`), so "look at the Puzzle
// region" is a thing somebody can say in a link. Written with `replaceState`
// rather than pushed: moving around a map is not navigation, and a Back button
// that walks back through forty tiles is worse than useless.

import {useCallback, useEffect, useState} from 'react';

import {CustomDialog} from '@code-dot-org/component-library/dialog';

import {TILES} from './catalogue';
import {useProgression} from './progressionContext';
import styles from './progressionDialog.module.css';
import {ProgressionMap} from './ProgressionMap';
import {TileDetail} from './TileDetail';
import type {TileId} from './types';

import {TILES_BY_ID} from './index';

/** The query parameter that says the map is open, and on what. */
export const TREE_PARAM = 'tree';

export interface ProgressionDialogProps {
  initialSelection?: TileId;
}

export const ProgressionDialog = ({
  initialSelection,
}: ProgressionDialogProps) => {
  const {completed, stateOf, closeTree, complete} = useProgression();
  const [selected, setSelected] = useState<TileId | undefined>(
    initialSelection,
  );

  useTreeParam(selected);

  const tile = selected ? TILES_BY_ID.get(selected) : undefined;
  const doneCount = TILES.filter(t => completed.has(t.id)).length;

  return (
    <CustomDialog
      className={styles.dialog}
      onClose={closeTree}
      closeLabel="Close the progression map"
      aria-label="Progression"
    >
      <div className={styles.layout}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Progression</h1>
          <p className={styles.count}>
            {doneCount} of {TILES.length} done
          </p>
        </header>

        <div className={styles.mapPane}>
          <ProgressionMap
            completed={completed}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        <aside className={styles.detailPane}>
          {tile ? (
            <TileDetail
              tile={tile}
              state={stateOf(tile.id)}
              stateOf={stateOf}
              onGoTo={setSelected}
              onComplete={complete}
            />
          ) : (
            <p className={styles.empty}>
              Pick a tile to read what it teaches and what finishing it gives
              you.
            </p>
          )}
        </aside>
      </div>
    </CustomDialog>
  );
};

/**
 * Keep `?tree=<tileId>` in step with the selection, and put it back when the
 * map closes.
 *
 * The parameter is not read here — the provider takes it as `initialSelection`
 * from whoever opened the map, so there is one place that decides what is
 * selected and it is not a URL being watched.
 */
const useTreeParam = (selected: TileId | undefined) => {
  const write = useCallback((value: string | undefined) => {
    if (typeof window === 'undefined') {
      return;
    }
    const url = new URL(window.location.href);
    if (value === undefined) {
      url.searchParams.delete(TREE_PARAM);
    } else {
      url.searchParams.set(TREE_PARAM, value);
    }
    window.history.replaceState(window.history.state, '', url);
  }, []);

  useEffect(() => {
    write(selected ?? '');
    return () => write(undefined);
  }, [selected, write]);
};
