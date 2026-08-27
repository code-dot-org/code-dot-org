// The detail pane: a tile's LEVEL PROPERTIES, presented.
//
// The rule specs/PROGRESSION_UI.md is strict about — what this pane shows is
// the lesson's own properties, not a second description of them written by
// hand. So the instructions render through `MainInstructionsContent`, the same
// component the Instructions tab and the bubble preview use, which is what
// makes a lesson read identically here and in the panel.
//
// Most tiles have no lesson written yet (`Tile.lesson`). Rather than showing
// nothing, the pane composes the markdown a lesson WOULD open with out of the
// tile's own `teaches` and `task` and renders that through the same component —
// so the path is live and exercised from the first tile, and the day a lesson
// is authored its own instructions take that place with nothing else changing.

import {MainInstructionsContent} from '@code-dot-org/lab/instructions';

import {lessonHref} from './lessonRoute';
import {levelPropertiesFor} from './lessons';
import styles from './progressionDialog.module.css';
import {region} from './regions';
import type {Tile, TileId, TileState, Unlock} from './types';

import {TILES_BY_ID} from './index';

export interface TileDetailProps {
  tile: Tile;
  state: TileState;
  stateOf: (id: TileId) => TileState;
  /** Jump the map to another tile — used by the prerequisite list. */
  onGoTo: (id: TileId) => void;
  /** Milestone 4 replaces this with a check that watches the running game. */
  onComplete: (id: TileId) => void;
}

export const TileDetail = ({
  tile,
  state,
  stateOf,
  onGoTo,
  onComplete,
}: TileDetailProps) => {
  const properties = levelPropertiesFor(tile.id);
  const instructions = properties?.longInstructions ?? previewMarkdown(tile);

  return (
    <div className={styles.detail}>
      <p className={styles.breadcrumb}>
        {region(tile.region).name} · {STATE_WORDS[state]}
      </p>
      {/* A written lesson opens with its own heading, because it has to: the
          instructions panel a learner spends the lesson in shows the markdown
          and nothing else. So the pane supplies a title only when the lesson
          does not, and there is exactly one either way. */}
      {!properties && <h2 className={styles.title}>{tile.title}</h2>}

      <MainInstructionsContent instructionsText={instructions} />

      {!properties && (
        <p className={styles.pending}>
          This lesson is designed but not written yet — what you are reading is
          the design.
        </p>
      )}

      {tile.requires.length > 0 && (
        <section>
          <h3 className={styles.heading}>Needs</h3>
          <ul className={styles.list}>
            {tile.requires.map(id => (
              <li key={id}>
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => onGoTo(id)}
                >
                  {TILES_BY_ID.get(id)?.title ?? id}
                </button>{' '}
                <span className={styles.muted}>
                  — {STATE_WORDS[stateOf(id)]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className={styles.heading}>Unlocks</h3>
        <ul className={styles.list}>
          {tile.unlocks.map(unlock => (
            <li key={unlockLabel(unlock)}>
              {unlockLabel(unlock)}
              {unlock.proposed && (
                <span className={styles.muted}> — not built yet</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.actions}>
        {/* An anchor, not a button that navigates. Starting a lesson leaves the
            project you have open, so it should behave like leaving: the browser
            can warn about unsaved work, and the link can be opened in a tab.
            The lesson has a CHANNEL OF ITS OWN — it never replaces the sources
            of the project you came from (specs/PROGRESSION_UI.md). */}
        {properties && state !== 'shut' && (
          <a className={styles.primary} href={lessonHref(tile)}>
            {state === 'done' ? 'Do it again' : 'Start'}
          </a>
        )}
        <button
          type="button"
          className={styles.secondary}
          disabled={state === 'shut'}
          onClick={() => onComplete(tile.id)}
        >
          {state === 'done' ? 'Done' : 'Mark as done'}
        </button>
        {state === 'shut' && (
          <p className={styles.muted}>
            Finish what it needs, above, to open this.
          </p>
        )}
      </div>
    </div>
  );
};

const STATE_WORDS: Record<TileState, string> = {
  done: 'done',
  open: 'ready to start',
  shut: 'locked',
};

/** What an unlock is called, in the one line a list item has for it. */
const unlockLabel = (unlock: Unlock): string => {
  switch (unlock.kind) {
    case 'rule':
      return `the ${unlock.id} rule`;
    case 'actor':
      return `the ${unlock.id} actor`;
    case 'block':
      return `the ${unlock.type} block`;
    case 'category':
      return `the ${unlock.name} drawer`;
    case 'asset':
      return `the ${unlock.id} picture`;
    case 'editor':
      return `the ${unlock.id} editor`;
    case 'template':
      return `the ${unlock.id} starting project`;
  }
};

/**
 * What a lesson would open with, from the design of it — for the tiles nobody
 * has written yet, which is most of them.
 *
 * Markdown, and rendered through the real renderer, so this pane is never
 * exercising a different path from the one a written lesson takes.
 */
const previewMarkdown = (tile: Tile): string =>
  `${tile.teaches}\n\n**What you do.** ${tile.task}`;
