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

import {Typography} from '@mui/material';
import {useCallback, useEffect, useState} from 'react';

import {CustomDialog} from '@code-dot-org/component-library/dialog';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {useAppSelector} from '@code-dot-org/lab/redux';

import {TILES} from './catalogue';
import {lessonChannel} from './lessonRoute';
import {useProgression} from './progressionContext';
import styles from './progressionDialog.module.css';
import {ProgressionList} from './ProgressionList';
import {ProgressionMap} from './ProgressionMap';
import {TileDetail} from './TileDetail';
import type {TileId} from './types';

import {TILES_BY_ID} from './index';

/** The query parameter that says the map is open, and on what. */
export const TREE_PARAM = 'tree';

export interface ProgressionDialogProps {
  initialSelection?: TileId;
}

/** How the catalogue is being read. Both are first class; see ./ProgressionList. */
type View = 'map' | 'list';

export const ProgressionDialog = ({
  initialSelection,
}: ProgressionDialogProps) => {
  const {completed, stateOf, closeTree, complete} = useProgression();
  const [selected, setSelected] = useState<TileId | undefined>(
    initialSelection,
  );
  const [view, setView] = useState<View>('map');
  // WHICH LESSON IS ACTUALLY OPEN. A check measures the project the lab has
  // loaded, so it may only be offered for the tile that project belongs to —
  // otherwise "Check my work" on any tile would measure whatever happened to be
  // on screen and complete the wrong lesson.
  const channel = useAppSelector(state => state.lab.channel?.id);
  const current = TILES.find(t => lessonChannel(t.id) === channel)?.id;
  // What was announced last, for the polite live region below. A completion is
  // an event a keyboard or screen-reader user has no other way to notice: the
  // tile it opened is somewhere else on the map.
  const [announcement, setAnnouncement] = useState('');

  useTreeParam(selected);

  const tile = selected ? TILES_BY_ID.get(selected) : undefined;
  const doneCount = TILES.filter(t => completed.has(t.id)).length;

  const onComplete = (id: TileId) => {
    complete(id);
    const opened = TILES.filter(
      candidate =>
        !completed.has(candidate.id) &&
        candidate.requires.includes(id) &&
        candidate.requires.every(need => need === id || completed.has(need)),
    );
    setAnnouncement(
      `${TILES_BY_ID.get(id)?.title ?? id} marked as done.` +
        (opened.length
          ? ` ${opened.map(next => next.title).join(' and ')} ${
              opened.length === 1 ? 'is' : 'are'
            } now ready to start.`
          : ''),
    );
  };

  return (
    <CustomDialog
      className={styles.dialog}
      onClose={closeTree}
      closeLabel="Close the progression map"
      aria-label="Progression"
    >
      <div className={styles.layout}>
        <header className={styles.header}>
          {/* MUI's Typography, so the type comes from the theme rather than
              from a pixel size typed into a stylesheet — this dialog is the
              lab's, and it should read as the lab's.
              `component` keeps the semantics the heading levels need: an h2,
              not an h1, because this opens over a page that already has one. */}
          <Typography variant="h6" component="h2" className={styles.heading}>
            Progression
          </Typography>
          <Typography
            variant="body2"
            className={styles.count}
            id="dsco-dialog-description"
          >
            {doneCount} of {TILES.length} lessons done. Pick one to read what it
            teaches and what finishing it unlocks.
          </Typography>
          <div className={styles.views}>
            <SegmentedButtons
              size="xs"
              selectedButtonValue={view}
              onChange={(value: string) => setView(value as View)}
              buttons={[
                {
                  value: 'map',
                  label: 'Map',
                  ariaLabel: 'Show the lessons as a map',
                  iconLeft: {iconName: 'diagram-project', iconStyle: 'solid'},
                },
                {
                  value: 'list',
                  label: 'List',
                  ariaLabel: 'Show the lessons as a list',
                  iconLeft: {iconName: 'list', iconStyle: 'solid'},
                },
              ]}
            />
          </div>
        </header>

        <div className={styles.mapPane}>
          {view === 'map' ? (
            <ProgressionMap
              completed={completed}
              selected={selected}
              onSelect={setSelected}
            />
          ) : (
            <ProgressionList
              stateOf={stateOf}
              selected={selected}
              onSelect={setSelected}
            />
          )}
        </div>

        <aside className={styles.detailPane} aria-label="Lesson">
          {tile ? (
            <TileDetail
              tile={tile}
              state={stateOf(tile.id)}
              stateOf={stateOf}
              isOpenLesson={tile.id === current}
              onGoTo={setSelected}
              onComplete={onComplete}
            />
          ) : (
            <Typography variant="body2" className={styles.empty}>
              Pick a lesson to read what it teaches and what finishing it gives
              you.
            </Typography>
          )}
        </aside>

        {/* Polite, and outside the panes, so moving around the map never
            interrupts a reader — only a completion speaks. */}
        <Typography
          variant="body2"
          component="p"
          // `role="status"` rather than a bare `aria-live`: the role IS polite,
          // and it is what makes the label legal — axe rejects `aria-label` on
          // a `<p>` with no role, which is how this was found.
          role="status"
          // Named, because there are two live regions in this dialog — the
          // other is the visible verdict on a check — and a reader arriving at
          // one should be told which.
          aria-label="Progression updates"
          className={styles.announcement}
        >
          {announcement}
        </Typography>
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
