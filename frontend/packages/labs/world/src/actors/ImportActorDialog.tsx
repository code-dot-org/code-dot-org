// The stock-actor picker, opened by the `(import…)` row on an ACTOR dropdown.
//
// `ImportRuleDialog` with one noun changed, and that is the point: importing a
// Label is the same act as importing a mechanic, because a Label IS an ordinary
// actor (specs/UI_ACTORS.md). A learner who has met one dialog has met both.
//
// NOTHING IS MASKED. Every word here is the stock library's — product copy
// written in this repository, which is what the page's translation is for. The
// rules panel fences off its rows because those are the learner's own file
// names; nothing on this dialog is theirs yet.

import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import {LessonLink} from '../progression/LessonLink';
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
        <ul className={styles.list}>
          {STOCK_ACTORS.map(actor => (
            <li key={actor.id} className={styles.row}>
              <Button
                className={styles.actor}
                disabled={!held(actor)}
                variant={chosen?.id === actor.id ? 'contained' : 'outlined'}
                color="secondary"
                size="small"
                fullWidth
                aria-pressed={chosen?.id === actor.id}
                onClick={() => setChosen(actor)}
                onDoubleClick={() => onImport(actor)}
              >
                {actorDemoUrl(actor.id) ? (
                  // What it DOES, for an actor whose worth is a behavior: a
                  // Platformer Player standing still is a sprite, and the
                  // walking, falling and jumping it brings with it is the
                  // whole of what a learner is choosing (specs/RULE_DEMOS.md).
                  //
                  // The same strip and the same CSS as a rule's demo, down to
                  // the custom properties — one recording animated by
                  // `steps()`, whose first cell is the still every row shows
                  // until it is looked at.
                  <span
                    className={
                      chosen?.id === actor.id
                        ? `${styles.demo} ${styles.playing}`
                        : styles.demo
                    }
                    style={
                      {
                        '--demo': `url(${actorDemoUrl(actor.id)})`,
                        '--frames': actorDemoFrames(actor.id),
                        '--demo-width': `${ACTOR_DEMO_SIZE.width}px`,
                        '--demo-height': `${ACTOR_DEMO_SIZE.height}px`,
                      } as React.CSSProperties
                    }
                    // Decoration beside a row that says what it is in words.
                    aria-hidden="true"
                  />
                ) : (
                  /* What it LOOKS like, for the ones that do nothing on their
                     own. A learner choosing between a Label, a Button and a
                     Speech Box is choosing between three pictures, and three
                     sentences about text is not that choice
                     (`preview/ActorPreview`). */
                  <ActorPreview actor={actor} />
                )}
                <span className={styles.words}>
                  <Typography component="span" variant="label2" color="inherit">
                    {actor.name}
                  </Typography>
                  <Typography component="span" variant="body4" color="inherit">
                    {actor.description}
                  </Typography>
                  {brings(actor).length > 0 && (
                    // What else lands in the project. An actor is written against
                    // mechanics and pictures — a Label against Text, a Coin
                    // against Collection and an animation — and they come with
                    // it, so the dialog says so rather than leaving a learner to
                    // wonder where the extra files came from.
                    //
                    // Abilities and picture names in one list, because from here
                    // they are one thing: what this adds that is not the actor.
                    // Which folder each lands in is not a question anybody is
                    // asking before they have clicked Import.
                    <Typography
                      component="span"
                      variant="body4"
                      color="inherit"
                    >
                      Also adds: {brings(actor).join(', ')}
                    </Typography>
                  )}
                </span>
              </Button>
              {/* Outside the Button — see the same note in ImportRuleDialog. */}
              {(chosen?.id === actor.id || !held(actor)) && (
                <LessonLink
                  className={styles.lesson}
                  unlock={{kind: 'actor', id: actor.id}}
                  locked={!held(actor)}
                  onNavigate={onCancel}
                />
              )}
            </li>
          ))}
        </ul>
      }
    />
  );
};

export default ImportActorDialog;
