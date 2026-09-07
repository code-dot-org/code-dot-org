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

import {Box, Button, Typography} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {MainInstructionsContent} from '@code-dot-org/lab/instructions';

import {STOCK_ACTORS} from '../actors/stock';
import {STOCK_ANIMATIONS, STOCK_SPRITES} from '../appearance/stock';
import {FOLDER_MENUS} from '../files/folderMenus';
import {STOCK_RULES} from '../rules/stock';

import {BlockPreview, blockForRule, type PreviewBlock} from './BlockPreview';
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
        // Labelled, because there are two lists in this pane and a reader
        // arriving at one should be told which — and because "what it needs"
        // and "what it gives" is the whole shape of a tile.
        <section aria-label="Needs">
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
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    className={styles.need}
                    onClick={() => onGoTo(id)}
                    startIcon={
                      // The BUTTON is the same neutral outlined button in
                      // every row; the state is on the icon, and its color
                      // comes from the theme's palette by name rather than
                      // from a green and a red typed in here.
                      <Box component="span" sx={{color: NEED_TONES[need]}}>
                        <FontAwesomeV6Icon
                          iconName={NEED_ICONS[need]}
                          iconStyle="solid"
                          className={styles.needIcon}
                        />
                      </Box>
                    }
                  >
                    <span className={styles.needTitle}>
                      {TILES_BY_ID.get(id)?.title ?? id}
                    </span>
                    <span className={styles.needState}>
                      {STATE_WORDS[need]}
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-label="Unlocks">
        <Typography
          variant="overline2"
          component="h3"
          className={styles.heading}
        >
          Unlocks
        </Typography>
        {/* THE DRAWN ONES LAST. A block takes a line and a picture; an actor
            or an animation takes half a line. Mixed, the words that have no
            picture are stranded between two blocks and read as captions for
            them — so the list says everything it can say in a phrase first,
            and then shows the shapes. */}
        <ul className={styles.list}>
          {[...tile.unlocks]
            .sort(
              (one, other) =>
                Number(previewBlock(one) !== undefined) -
                Number(previewBlock(other) !== undefined),
            )
            .map(unlock => {
              // The block itself, where there is one to draw — see
              // `./BlockPreview`. "The Jumping rule" is not a thing anybody has
              // seen; a shape with words on it in a color is the only
              // description of a block that anybody reads.
              const preview = previewBlock(unlock);
              // A DRAWN one says everything the words did and more, so the
              // words go: "the world_do_Jumping_MakeJumpAction block" beside a
              // picture of that block is a caption nobody needs, and the
              // bullet beside it is a marker for a list item that is a
              // picture. What the words were carrying — the description — is
              // on the preview as a tooltip.
              const drawn = preview !== undefined && !unlock.proposed;
              return (
                <li key={unlockLabel(unlock)} className={styles.unlock}>
                  {drawn ? (
                    <BlockPreview block={preview} />
                  ) : (
                    <Typography variant="body2" component="span">
                      {/* The FILE BROWSER'S OWN ICON for that kind, not a
                          bullet and not a word. A rule here wears the same
                          mark a rule wears in the menus, so "you get the
                          Gravity rule" and the row you will go and open are
                          recognisably the same thing — and the icon says
                          which kind it is in less room than "the … rule"
                          took. */}
                      <FontAwesomeV6Icon
                        iconName={unlockIcon(unlock)}
                        iconStyle="solid"
                        className={styles.unlockIcon}
                      />
                      {unlockName(unlock)}
                      {unlock.proposed && (
                        <span className={styles.muted}> — not built yet</span>
                      )}
                    </Typography>
                  )}
                </li>
              );
            })}
        </ul>
      </section>

      <div className={styles.actions}>
        {/* An anchor, not a button that navigates. Starting a lesson leaves the
            project you have open, so it should behave like leaving: the browser
            can warn about unsaved work, and the link can be opened in a tab.
            The lesson has a CHANNEL OF ITS OWN — it never replaces the sources
            of the project you came from (specs/PROGRESSION_UI.md). */}
        {properties && state !== 'shut' && (
          // MUI's Button, as a link. Starting a lesson leaves the project you
          // have open, so it should behave like leaving — but it should LOOK
          // like every other primary action in the lab, and a hand-styled
          // anchor cannot promise that.
          <Button variant="contained" href={lessonHref(tile)}>
            {state === 'done' ? 'Do it again' : 'Start'}
          </Button>
        )}
        {/* The real thing, when this lesson is the one open and somebody has
            written its script (../runtime/checks). Marking it done by hand
            stays beside it: a check is evidence, not a gate, and a learner who
            has plainly done the lesson should not be argued with by a probe. */}
        {checkable && (
          <Button
            variant="contained"
            disabled={checker.state.status === 'running'}
            onClick={() => void checker.run(tile.id)}
          >
            {checker.state.status === 'running' ? 'Checking…' : 'Check my work'}
          </Button>
        )}
        <Button
          variant="outlined"
          color="secondary"
          disabled={state === 'shut'}
          onClick={() => onComplete(tile.id)}
        >
          {state === 'done' ? 'Done' : 'Mark as done'}
        </Button>
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

/**
 * Which of the theme's colors the mark on a needed lesson wears.
 *
 * Named out of the palette rather than written as a green and a red: the theme
 * has an opinion about both, it is the same opinion every other icon in the
 * lab holds, and it is the one that changes with the theme. Ready is the
 * ordinary case and gets the quiet one.
 */
const NEED_TONES: Record<TileState, string> = {
  done: 'success.main',
  open: 'text.disabled',
  shut: 'error.main',
};

const STATE_WORDS: Record<TileState, string> = {
  done: 'done',
  open: 'ready to start',
  shut: 'locked',
};

/**
 * The block to draw for an unlock, if there is one worth drawing.
 *
 * A block unlock names its own type. A RULE mints a dozen, so `blockForRule`
 * picks the one that says what the rule lets you do. Everything else — an
 * actor, a picture, an editor — is not a block and gets no picture here.
 */
const previewBlock = (unlock: Unlock): PreviewBlock | undefined => {
  if (unlock.kind === 'block') {
    return {type: unlock.type};
  }
  return unlock.kind === 'rule' ? blockForRule(unlock.id) : undefined;
};

/**
 * The icon for an unlock, taken from the file browser's own list.
 *
 * Read from `FOLDER_MENUS` rather than written out here, so the mark a rule
 * wears in this list is the mark a rule wears everywhere — and stays that way
 * the day somebody changes it. The two kinds that are not files pick the
 * closest thing there is: a drawer of blocks, and the editor a lesson opens.
 */
const iconFor = (folder: string): string =>
  FOLDER_MENUS.find(menu => menu.folder === folder)?.icon ?? 'file';

const unlockIcon = (unlock: Unlock): string => {
  switch (unlock.kind) {
    case 'rule':
      return iconFor('rules');
    case 'actor':
      return iconFor('actors');
    case 'template':
      return iconFor('worlds');
    case 'asset':
      // A picture or a strip of them — which it is, is a fact about the
      // library rather than about the unlock, so this asks the library.
      return STOCK_ANIMATIONS.some(one => one.id === unlock.id)
        ? iconFor('animations')
        : iconFor('sprites');
    case 'editor':
      return iconFor('maps');
    case 'category':
      return 'shapes';
    default:
      return 'file';
  }
};

/**
 * What to CALL an unlock: the name the library gives it.
 *
 * "Ground" rather than "the ground actor" — the icon has already said which
 * kind it is, and the id is a file stem rather than a name anybody chose.
 */
const unlockName = (unlock: Unlock): string => {
  switch (unlock.kind) {
    case 'rule':
      return STOCK_RULES.find(one => one.id === unlock.id)?.name ?? unlock.id;
    case 'actor':
      return STOCK_ACTORS.find(one => one.id === unlock.id)?.name ?? unlock.id;
    case 'asset':
      return (
        STOCK_ANIMATIONS.find(one => one.id === unlock.id)?.name ??
        STOCK_SPRITES.find(one => one.id === unlock.id)?.name ??
        unlock.id
      );
    case 'category':
      // "Loops Toolbox" rather than "Loops": a drawer's name on its own reads
      // as a topic, and what a lesson gives you is the drawer.
      return `${unlock.name} Toolbox`;
    case 'block':
      return unlock.type;
    default:
      return unlock.id;
  }
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
