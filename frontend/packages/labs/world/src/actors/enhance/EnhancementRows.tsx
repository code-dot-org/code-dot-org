// The shelf's ROWS, which two surfaces show and only one of them is a dialog.
//
// A row is a name, a sentence, what it will land in the project, whether this
// actor can take it, and — for the one that needs one — a question with the
// answers under it. All of that is the same wherever it is read; what differs
// is the frame and what a press MEANS.
//
// `EnhanceActorDialog` is the one-shot: choose a row, press Enhance, done. It
// is reached from an actor's own menu and from the wand on its `define actor`,
// and both are about an actor that already exists — "give this one more thing".
//
// The Actor Creator's third step is the other: rows pressed one after another
// while an actor is built up, since walking in and out of a dialog once per
// ability would make a Crawler three round trips
// (specs/ACTOR_CREATION_WIZARD.md).
//
// THE CHOSEN ROW IS THE CALLER'S STATE, not this component's. Both frames need
// it for their own button — one to enable Enhance, one to enable Add — and a
// component that kept it privately would have to announce every change of it
// anyway, which is the same thing said twice.

import {Button, Typography} from '@mui/material';

import type {MultiFileSource} from '@code-dot-org/core/api';

import styles from './enhancementRows.module.css';
import {
  enhancementsFor,
  type Enhancement,
  type EnhanceTarget,
} from './enhancements';

export interface EnhancementRowsProps {
  /** The project as it stands — read, to say what is already done. */
  source: MultiFileSource;
  /** The thing this is about, chosen before these were shown. */
  target: EnhanceTarget;
  /** Which row is chosen, and the answer to its question if it asks one. */
  chosen: Enhancement | null;
  answer?: string;
  onChoose: (enhancement: Enhancement) => void;
  onAnswer: (value: string) => void;
}

/**
 * Why this thing cannot take that enhancement, if it cannot.
 *
 * Two reasons and they read the same way on the row: the enhancement refuses
 * this actor, or the actor already has it. Exported because both frames gate
 * their own button on the same question.
 */
export const refusalOf = (
  enhancement: Enhancement,
  source: MultiFileSource,
  target: EnhanceTarget,
  answer?: string,
): string | undefined =>
  enhancement.refuse?.(target) ??
  (enhancement.applied(source, target, answer)
    ? 'Already has this.'
    : undefined);

export const EnhancementRows = ({
  source,
  target,
  chosen,
  answer,
  onChoose,
  onAnswer,
}: EnhancementRowsProps) => {
  const offered = enhancementsFor(target);
  const why = (enhancement: Enhancement) =>
    refusalOf(
      enhancement,
      source,
      target,
      enhancement === chosen ? answer : undefined,
    );

  return (
    <ul className={styles.list}>
      {offered.length === 0 && (
        // The wording every empty list in this lab uses.
        <li>
          <Typography component="span" variant="body4">
            (nothing to add to this yet)
          </Typography>
        </li>
      )}
      {offered.map(enhancement => {
        const refusal = why(enhancement);
        return (
          <li key={enhancement.id}>
            <Button
              className={styles.enhancement}
              variant={chosen?.id === enhancement.id ? 'contained' : 'outlined'}
              color="secondary"
              size="small"
              fullWidth
              disabled={Boolean(refusal)}
              aria-pressed={chosen?.id === enhancement.id}
              onClick={() => onChoose(enhancement)}
            >
              <Typography component="span" variant="label2" color="inherit">
                {enhancement.name}
              </Typography>
              <Typography component="span" variant="body4" color="inherit">
                {enhancement.description}
              </Typography>
              {/* What lands in the project. The same promise the import
                  dialogs make, and it matters more here: this one writes into
                  files the learner already has. */}
              <Typography component="span" variant="body4" color="inherit">
                Also adds: {enhancement.brings.join(', ')}
              </Typography>
              {refusal && (
                <Typography component="span" variant="body4" color="inherit">
                  {refusal}
                </Typography>
              )}
            </Button>
            {chosen?.id === enhancement.id && enhancement.asks && (
              // The enhancement's own question. Outside the Button — a button
              // inside a button is not a control any browser or reader can
              // make sense of.
              <div className={styles.answers}>
                <Typography component="span" variant="body4">
                  {enhancement.asks.label}:
                </Typography>
                {enhancement.asks.options(source, target).length === 0 && (
                  <Typography component="span" variant="body4">
                    (no actors yet)
                  </Typography>
                )}
                {enhancement.asks.options(source, target).map(choice => (
                  <Button
                    key={choice.value}
                    variant={answer === choice.value ? 'contained' : 'outlined'}
                    color="secondary"
                    size="small"
                    aria-pressed={answer === choice.value}
                    onClick={() => onAnswer(choice.value)}
                  >
                    <Typography
                      component="span"
                      variant="body4"
                      color="inherit"
                    >
                      {choice.name}
                    </Typography>
                  </Button>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default EnhancementRows;
