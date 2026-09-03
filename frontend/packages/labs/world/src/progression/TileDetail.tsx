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

import {Typography} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {MainInstructionsContent} from '@code-dot-org/lab/instructions';

import {lessonHref} from './lessonRoute';
import {levelPropertiesFor} from './lessons';
import styles from './progressionDialog.module.css';
import {region} from './regions';
import type {Tile, TileId, TileState, Unlock} from './types';
import {useCheck} from './useCheck';

import {TILES_BY_ID} from './index';

export interface TileDetailProps {
  tile: Tile;
  state: TileState;
  stateOf: (id: TileId) => TileState;
  /** Jump the map to another tile — used by the prerequisite list. */
  onGoTo: (id: TileId) => void;
  /** Mark it done by hand — the fallback for a lesson with no check written. */
  onComplete: (id: TileId) => void;
  /**
   * Whether the project the lab has loaded IS this lesson.
   *
   * A check measures the open project, so it can only be offered here — "Check
   * my work" on some other tile would measure whatever is on screen and
   * complete the wrong lesson.
   */
  isOpenLesson?: boolean;
}

export const TileDetail = ({
  tile,
  state,
  stateOf,
  onGoTo,
  onComplete,
  isOpenLesson = false,
}: TileDetailProps) => {
  const properties = levelPropertiesFor(tile.id);
  const instructions = properties?.longInstructions ?? previewMarkdown(tile);
  const checker = useCheck();
  const checkable = isOpenLesson && checker.canCheck(tile.id);

  return (
    <div className={styles.detail}>
      {/* Typography rather than a `<p>` with a pixel size on it: the type
          comes from the theme, and this pane sits beside the instructions
          panel, which is rendered by the lab's own renderer. */}
      <Typography
        variant="overline2"
        component="p"
        className={styles.breadcrumb}
      >
        {region(tile.region).name} · {STATE_WORDS[state]}
      </Typography>
      {/* A written lesson opens with its own heading, because it has to: the
          instructions panel a learner spends the lesson in shows the markdown
          and nothing else. So the pane supplies a title only when the lesson
          does not, and there is exactly one either way. */}
      {!properties && (
        <Typography variant="h6" component="h2" className={styles.title}>
          {tile.title}
        </Typography>
      )}

      <MainInstructionsContent instructionsText={instructions} />

      {!properties && (
        <Typography variant="body2" className={styles.pending}>
          This lesson is designed but not written yet — what you are reading is
          the design.
        </Typography>
      )}

      {tile.requires.length > 0 && (
        <section>
          <Typography
            variant="overline2"
            component="h3"
            className={styles.heading}
          >
            Needs
          </Typography>
          {/* BUTTONS, not bullets with a link in them. Every one of these goes
              somewhere — that is the whole of what this list is for — and a
              row that is a target you press says so, where a bullet with a
              word underlined in it makes you look for the part that works.
              Locked ones are buttons too: "why can I not start this" is
              answered by going and looking at what it needs, which is exactly
              the tile a locked row leads to. */}
          <ul className={styles.needs}>
            {tile.requires.map(id => {
              const need = stateOf(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`${styles.need} ${styles[`need_${need}`]}`}
                    onClick={() => onGoTo(id)}
                  >
                    <FontAwesomeV6Icon
                      iconName={NEED_ICONS[need]}
                      iconStyle="solid"
                      className={styles.needIcon}
                    />
                    <span className={styles.needTitle}>
                      {TILES_BY_ID.get(id)?.title ?? id}
                    </span>
                    <span className={styles.needState}>
                      {STATE_WORDS[need]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <Typography
          variant="overline2"
          component="h3"
          className={styles.heading}
        >
          Unlocks
        </Typography>
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
        {/* The real thing, when this lesson is the one open and somebody has
            written its script (../runtime/checks). Marking it done by hand
            stays beside it: a check is evidence, not a gate, and a learner who
            has plainly done the lesson should not be argued with by a probe. */}
        {checkable && (
          <button
            type="button"
            className={styles.primary}
            disabled={checker.state.status === 'running'}
            onClick={() => void checker.run(tile.id)}
          >
            {checker.state.status === 'running' ? 'Checking…' : 'Check my work'}
          </button>
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
          <Typography variant="body2" className={styles.muted}>
            Finish what it needs, above, to open this.
          </Typography>
        )}
      </div>
      {/* Said out loud, because a check's result is the whole reason somebody
          pressed the button and the button itself does not change. */}
      <Typography
        variant="body2"
        component="p"
        role="status"
        aria-label="Check result"
        className={styles.verdict}
      >
        {checker.state.status === 'passed' && 'That works. Lesson done.'}
        {checker.state.status === 'failed' &&
          `Not yet: the check looked for — ${tile.check.says}${
            checker.state.because
              ? ` The world said: ${checker.state.because}`
              : ''
          }`}
      </Typography>
    </div>
  );
};

/**
 * The mark on a needed lesson's row, beside the word that says the same thing.
 *
 * A tick for done, a padlock for locked, and an empty circle for one that is
 * ready — which is deliberately the quiet one, because "ready to start" is the
 * ordinary case and the two either side of it are the news.
 */
const NEED_ICONS: Record<TileState, string> = {
  done: 'circle-check',
  open: 'circle',
  shut: 'lock',
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
