// The stock-actor picker, opened by the `(import…)` row on an ACTOR dropdown.
//
// A GRID of what each actor is, for the reason the project's own actors are one
// (`actors/ActorPickerDialog`): an actor is a thing you can see, and a column of
// nine paragraphs is asking a learner to read their way to a choice they could
// have made by looking. Each tile is the actor doing what it does — a walk, a
// spin, a still for the ones that do nothing on their own — with its name under
// it, and the sentence about the chosen one under the grid, where one of them
// fits and nine do not.
//
// A LOCKED TILE IS A CONTROL, not a hole. In a lab that gates its libraries,
// some of these are earned; the tile shows which lesson earns it and pressing
// it goes there. Refusing the press and saying nothing would be the one thing
// worse than showing the actor at all (specs/PROGRESSION_UI.md).
//
// NOTHING IS MASKED. Every word here is the stock library's — product copy
// written in this repository, which is what the page's translation is for. The
// rules panel fences off its rows because those are the learner's own file
// names; nothing on this dialog is theirs yet.

import {Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {LessonLink, unlockLesson} from '../progression/LessonLink';
import {useMaybeProgression} from '../progression/progressionContext';

import {actorDemoFrames, actorDemoUrl, ACTOR_DEMO_SIZE} from './demos';
import styles from './importActorDialog.module.css';
import {
  actorAnimations,
  actorParents,
  actorRequirements,
  actorSprites,
} from './importStockActor';
import {ActorPreview} from './preview/ActorPreview';
import {STOCK_ACTORS, type StockActor} from './stock';

export interface ImportActorDialogProps {
  /** Chosen — copy this into the project. */
  onImport: (actor: StockActor) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
}

/**
 * Everything an import writes besides the actor, in words a learner reads.
 *
 * A rule is named by its ABILITY ("Collects Things") because that is how the
 * rule library names one; an actor and a picture by their own names. The kind
 * it ACTS LIKE first, because that is the biggest thing arriving — a whole
 * second actor, and one the learner will see in their files.
 */
const brings = (actor: StockActor): string[] => [
  ...actorParents(actor).map(parent => parent.name),
  ...actorRequirements(actor).map(rule => rule.ability),
  ...actorAnimations(actor).map(animation => animation.name),
  ...actorSprites(actor).map(sprite => sprite.name),
];

/** The tile's size, which is the demo strip's — every actor has one shape. */
const TILE_SIZE = {
  '--demo-width': `${ACTOR_DEMO_SIZE.width}px`,
  '--demo-height': `${ACTOR_DEMO_SIZE.height}px`,
} as React.CSSProperties;

export const ImportActorDialog = ({
  onImport,
  onCancel,
}: ImportActorDialogProps) => {
  const [chosen, setChosen] = useState<StockActor | null>(null);
  // See the same lines in ImportRuleDialog: shown either way, locked until the
  // lesson that grants it is done.
  const progression = useMaybeProgression();
  const held = (actor: StockActor) =>
    progression?.holds({kind: 'actor', id: actor.id}) ?? true;

  return (
    <Dialog
      // A picker, not an alert: `Dialog` declares `role="alertdialog"`, which
      // announces something needing an answer now.
      role="dialog"
      title="Add an actor"
      description="Pick one to copy into your project. You can open it afterwards and change anything you like."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: 'Import',
        disabled: chosen === null || !held(chosen),
        onClick: () => chosen && held(chosen) && onImport(chosen),
      }}
      secondaryButtonProps={{children: 'Cancel', onClick: onCancel}}
      customContent={
        <div className={styles.body}>
          <ul className={styles.grid}>
            {STOCK_ACTORS.map(actor => {
              const locked = !held(actor);
              const lesson = unlockLesson(progression, {
                kind: 'actor',
                id: actor.id,
              });
              const picked = chosen?.id === actor.id;
              const demo = actorDemoUrl(actor.id);
              return (
                <li key={actor.id} className={styles.holder}>
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
                        ? `${actor.name} — unlocked by ${lesson.title}`
                        : actor.name
                    }
                    // A locked tile GOES SOMEWHERE. The lesson replaces this
                    // dialog rather than opening over it: two modals at once is
                    // the thing the accessibility checklist says to avoid
                    // rather than manage (`progression/LessonLink`).
                    onClick={() => {
                      if (!locked) {
                        setChosen(actor);
                        return;
                      }
                      if (lesson) {
                        onCancel();
                        lesson.open();
                      }
                    }}
                    onDoubleClick={() => !locked && onImport(actor)}
                  >
                    {demo ? (
                      // What it DOES, for an actor whose worth is a behavior: a
                      // Platformer Player standing still is a sprite, and the
                      // walking, falling and jumping it brings with it is the
                      // whole of what a learner is choosing (specs/RULE_DEMOS.md).
                      //
                      // The same strip and the same CSS as a rule's demo, down
                      // to the custom properties — one recording animated by
                      // `steps()`, whose first cell is the still every tile
                      // shows until it is looked at.
                      <span
                        className={
                          picked
                            ? `${styles.demo} ${styles.playing}`
                            : styles.demo
                        }
                        style={
                          {
                            '--demo': `url(${demo})`,
                            '--frames': actorDemoFrames(actor.id),
                          } as React.CSSProperties
                        }
                        // Decoration beside a name that says what it is.
                        aria-hidden="true"
                      />
                    ) : (
                      /* What it LOOKS like, for the ones that do nothing on
                         their own. A learner choosing between a Label, a Button
                         and a Speech Box is choosing between three pictures, and
                         three sentences about text is not that choice
                         (`preview/ActorPreview`). */
                      <span className={styles.still}>
                        <ActorPreview actor={actor} />
                      </span>
                    )}
                    <Typography
                      component="span"
                      variant="label2"
                      color="inherit"
                      className={styles.name}
                    >
                      {actor.name}
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
                      <FontAwesomeV6Icon iconName="lock" iconStyle="solid" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {/* The sentence about the chosen one, and what else its import
              brings. An actor is written against mechanics and pictures — a
              Label against Text, a Coin against Collection and an animation —
              and they come with it, so the dialog says so rather than leaving a
              learner to wonder where the extra files came from.

              Abilities and picture names in one list, because from here they
              are one thing: what this adds that is not the actor. Which folder
              each lands in is not a question anybody is asking before they have
              clicked Import. */}
          <div className={styles.detail}>
            {chosen ? (
              <>
                <Typography variant="body3">{chosen.description}</Typography>
                {brings(chosen).length > 0 && (
                  <Typography variant="body4">
                    Also adds: {brings(chosen).join(', ')}
                  </Typography>
                )}
                <LessonLink
                  unlock={{kind: 'actor', id: chosen.id}}
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

export default ImportActorDialog;
