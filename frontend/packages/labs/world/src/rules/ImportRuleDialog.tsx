// The stock-rule picker, opened by the `(import…)` row on a `use rule` dropdown.
//
// NOTHING IS MASKED HERE, where the rules panel masks half its rows: every word
// on this dialog is the STOCK library's, which is product copy written in this
// repository, and product copy is exactly what the page's translation is for.
// The panel is about the learner's own project — their file names, their rules
// — and those are theirs, so it fences them off (`data-notranslate`).
//
// A GRID OF WHAT EACH RULE DOES, under the heading of the part of the map it
// comes from. Forty-five rules as a column of sentences was four screens of
// scrolling to answer a question — "what kind of game am I making" — that the
// progression already answers: Motion, Platformer, Arcade, Puzzle. The grouping
// is read off the lessons rather than curated (`stockRuleGroups`), so a rule
// added tomorrow lands in the right place by saying which lesson teaches it.
//
// THE DETAIL IS UNDER THE GRID, for the chosen tile only. The ability fits on a
// tile; the sentence, what else the import drags in and what it gives actors do
// not, and forty-five copies of them is the page nobody scanned.
//
// A LOCKED TILE IS A CONTROL. In a lab that gates its libraries some of these
// are earned, and the tile says which lesson earns it and goes there when
// pressed — the same reading the stock actors have (specs/PROGRESSION_UI.md).
//
// WHAT IS NOT HERE: the two base rules, which do nothing on their own and
// arrive with whatever needs them (`stockRuleGroups.BASE_RULES`). Every tile
// left is a thing somebody has a reason to press, and every one of them has a
// picture of itself working.

import {Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {LessonLink, unlockLesson} from '../progression/LessonLink';
import {useMaybeProgression} from '../progression/progressionContext';

import {demoFrames, demoUrl} from './demos';
import styles from './importRuleDialog.module.css';
import {stockRequirements} from './importStockRule';
import {type StockRule} from './stock';
import {stockRuleGroups} from './stockRuleGroups';

export interface ImportRuleDialogProps {
  /** Chosen — copy this into the project. */
  onImport: (rule: StockRule) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
}

/**
 * How big a demo is drawn HERE, which is not how big it was recorded.
 *
 * Two thirds of the strip's own 192 by 128 (`demos/types.DEMO_SIZE`). The
 * recording is sized for a row that ran the width of a dialog; a grid of
 * forty-five of them at that size is four screens of scrolling, and at this one
 * it is a screen and a half. The strip scales with it — the whole picture is a
 * background sized in these units — so nothing is cropped.
 */
const TILE = {width: 128, height: 85};

const TILE_SIZE = {
  '--demo-width': `${TILE.width}px`,
  '--demo-height': `${TILE.height}px`,
} as React.CSSProperties;

export const ImportRuleDialog = ({
  onImport,
  onCancel,
}: ImportRuleDialogProps) => {
  // Picking a tile selects it; `Import` is what commits. A rule brings the
  // rules it needs with it, so the tile a learner lands on first is rarely the
  // one they meant once they have read what else comes along.
  const [chosen, setChosen] = useState<StockRule | null>(null);
  // What this learner has unlocked, when the level gates the library at all
  // (progression/shelf). Every tile is SHOWN either way: a locked one that says
  // which lesson grants it is a reason to go and do that lesson, and one that
  // has been taken away teaches nothing.
  const progression = useMaybeProgression();
  const held = (rule: StockRule) =>
    progression?.holds({kind: 'rule', id: rule.id}) ?? true;

  return (
    <Dialog
      // A picker, not an alert: `Dialog` declares `role="alertdialog"`, which
      // announces something that needs answering now. The prop spread lands
      // after it, so this is the role that reaches the DOM.
      role="dialog"
      title="Add a rule"
      description="Pick one to copy into your project. You can open it afterwards and change anything you like."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: 'Import',
        disabled: chosen === null || !held(chosen),
        onClick: () => chosen && held(chosen) && onImport(chosen),
      }}
      secondaryButtonProps={{
        children: 'Cancel',
        onClick: onCancel,
      }}
      customContent={
        <div className={styles.body}>
          <div className={styles.shelf}>
            {stockRuleGroups().map(({region, rules}) => (
              <section key={region.id}>
                <Typography variant="overline1" className={styles.region}>
                  {region.name}
                </Typography>
                <ul className={styles.grid}>
                  {rules.map(rule => {
                    const locked = !held(rule);
                    const lesson = unlockLesson(progression, {
                      kind: 'rule',
                      id: rule.id,
                    });
                    const picked = chosen?.id === rule.id;
                    const demo = demoUrl(rule.id);
                    return (
                      <li key={rule.id} className={styles.holder}>
                        <button
                          type="button"
                          className={[
                            styles.tile,
                            picked ? styles.tileChosen : '',
                            locked ? styles.tileLocked : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={TILE_SIZE}
                          aria-pressed={picked}
                          aria-label={
                            locked && lesson
                              ? `${rule.ability} — unlocked by ${lesson.title}`
                              : rule.ability
                          }
                          // A locked tile GOES SOMEWHERE. The lesson replaces
                          // this dialog rather than opening over it: two modals
                          // at once is the thing the accessibility checklist
                          // says to avoid rather than manage.
                          onClick={() => {
                            if (!locked) {
                              setChosen(rule);
                              return;
                            }
                            if (lesson) {
                              onCancel();
                              lesson.open();
                            }
                          }}
                          onDoubleClick={() => !locked && onImport(rule)}
                        >
                          {demo ? (
                            // What the rule DOES, which no sentence on a tile
                            // can say (specs/RULE_DEMOS.md). One strip PNG:
                            // frame one is the still every tile shows, and a
                            // tile being LOOKED at steps through the rest —
                            // hovered, focused or selected.
                            //
                            // Custom properties rather than a class per rule:
                            // the frame count is a fact about the recording, so
                            // it comes from the demo rather than from a
                            // stylesheet that would have to be edited every
                            // time one was re-recorded.
                            <span
                              className={
                                picked
                                  ? `${styles.demo} ${styles.playing}`
                                  : styles.demo
                              }
                              style={
                                {
                                  '--demo': `url(${demo})`,
                                  '--frames': demoFrames(rule.id),
                                } as React.CSSProperties
                              }
                              // Decoration beside a tile that already says what
                              // it is in words: a screen reader gains nothing
                              // from "a box falls".
                              aria-hidden="true"
                            />
                          ) : (
                            // Nothing recorded yet. Every rule the shelf offers
                            // has a demo — the two that cannot have one are not
                            // offered (`stockRuleGroups.BASE_RULES`) — so this
                            // is what a rule added before its demo looks like,
                            // and it reads as a card rather than as a picture
                            // that failed to arrive.
                            <span className={styles.base}>
                              <Typography variant="body4">
                                No picture yet
                              </Typography>
                            </span>
                          )}
                          <Typography
                            component="span"
                            variant="label2"
                            color="inherit"
                            className={styles.ability}
                          >
                            {rule.ability}
                          </Typography>
                          {locked && lesson && (
                            <Typography
                              component="span"
                              variant="body4"
                              className={styles.unlockedBy}
                            >
                              {`Unlocked by ${lesson.title}`}
                            </Typography>
                          )}
                        </button>
                        {locked && (
                          <span className={styles.lock}>
                            <FontAwesomeV6Icon
                              iconName="lock"
                              iconStyle="solid"
                            />
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
          {/* The sentence about the chosen one, what else its import brings,
              and the traits it gives. A mechanic is written against other
              mechanics — gravity against collision and motion — and they come
              with it, so the dialog says so rather than leaving a learner to
              wonder where the extra files came from. */}
          <div className={styles.detail}>
            {chosen ? (
              <>
                <Typography variant="body3">{chosen.description}</Typography>
                {stockRequirements(chosen).length > 0 && (
                  <Typography variant="body4">
                    Also adds:{' '}
                    {stockRequirements(chosen)
                      .map(dep => dep.ability)
                      .join(', ')}
                  </Typography>
                )}
                {chosen.provides.length > 0 && (
                  // The traits, named. A rule reaches actors through its
                  // traits, so this is what a learner will actually put on
                  // something.
                  <Typography variant="body4">
                    Gives actors: {chosen.provides.join(', ')}
                  </Typography>
                )}
                <LessonLink
                  unlock={{kind: 'rule', id: chosen.id}}
                  onNavigate={onCancel}
                />
              </>
            ) : (
              <Typography variant="body4">
                Pick one to see what it does.
              </Typography>
            )}
          </div>
        </div>
      }
    />
  );
};

export default ImportRuleDialog;
