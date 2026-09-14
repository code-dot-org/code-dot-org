// The shelf as a CHECKLIST, which is what the Actor Creator's third step is.
//
// It was the same rows as the enhancement dialog, pressed one at a time, with
// an `Add this` button under them — and that was two mistakes wearing one
// coat. The first is the one the drawing panel had: a press that is not the
// press you were going to make anyway is a press that gets forgotten, and this
// one had to be made once PER ability. The second is that a button reading
// "Add this" beside a list of twelve says nothing about the fact that you may
// have as many as you like.
//
// So the rows are checkboxes and nothing is applied until `Create`. Checking
// one is the whole act, the list can be read as a list, and what an actor will
// be able to do is visible all at once rather than remembered.
//
// WHAT IT ALREADY HAS IS CHECKED AND LOCKED. Two of step one's three doors
// hand this step an actor that can already do things — a copied Crawler
// patrols — and the honest way to show that is the same tick in the same
// column, not a row greyed out for reasons of its own. The reason is said
// beside it; the tick is not a claim that this step did it.
//
// AND THE DESCRIPTION IS BEHIND A PRESS. Twelve rows of name, sentence and
// "also adds" is a wall, which was the complaint; twelve names is a list you
// can scan. The sentence is still there for the row you are wondering about.

import {Button as MuiButton, Typography} from '@mui/material';
import {useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import type {MultiFileSource} from '@code-dot-org/core/api';

import styles from './enhancementChecklist.module.css';
import {groupsFor, type Enhancement, type EnhanceTarget} from './enhancements';

export interface EnhancementChecklistProps {
  /** The actor as it stands, which is what "already has this" is asked of. */
  source: MultiFileSource;
  target: EnhanceTarget;
  /** The ids ticked so far, in the order they were ticked. */
  picked: readonly string[];
  onPick: (id: string, picked: boolean) => void;
  /** Answers to the questions some of them ask, by enhancement id. */
  answers: Readonly<Record<string, string>>;
  onAnswer: (id: string, value: string) => void;
}

/** Whether this actor already has it — ticked, and not by this step. */
export const alreadyHas = (
  enhancement: Enhancement,
  source: MultiFileSource,
  target: EnhanceTarget,
): boolean => enhancement.applied(source, target);

/**
 * Whether everything ticked has what it needs to be applied.
 *
 * One of these asks a question, and a ticked row with no answer would be an
 * ability quietly dropped at `Create` — which is the thing this whole step was
 * rebuilt to stop.
 */
export const allAnswered = (
  picked: readonly string[],
  answers: Readonly<Record<string, string>>,
  offered: readonly Enhancement[],
): boolean =>
  picked.every(id => {
    const one = offered.find(each => each.id === id);
    return !one?.asks || answers[id] !== undefined;
  });

export const EnhancementChecklist = ({
  source,
  target,
  picked,
  onPick,
  answers,
  onAnswer,
}: EnhancementChecklistProps) => {
  /** Which rows have been opened to read about. Shut is the resting state. */
  const [open, setOpen] = useState<readonly string[]>([]);
  const groups = groupsFor(target);

  if (groups.length === 0) {
    // The wording every empty list in this lab uses.
    return (
      <Typography variant="body4">(nothing to add to this yet)</Typography>
    );
  }

  return (
    <div className={styles.groups}>
      {groups.map(group => (
        <section key={group.name}>
          {/* A HEADING RATHER THAN A FOLD, at ten rows. What a fold buys is
              room, and room is not what is short here — what was short was a
              way to tell one run of rows from the next. Thirty will want the
              fold as well (specs/ACTOR_CREATION_WIZARD.md). */}
          <Typography component="h3" variant="body4" className={styles.heading}>
            {group.name}
          </Typography>
          <ul className={styles.list}>
            {group.members.map(enhancement => {
              const already = alreadyHas(enhancement, source, target);
              const refusal = enhancement.refuse?.(target);
              const locked = already || Boolean(refusal);
              const ticked = already || picked.includes(enhancement.id);
              const showing = open.includes(enhancement.id);
              const panel = `${enhancement.id}-about`;
              return (
                <li key={enhancement.id} className={styles.row}>
                  <div className={styles.line}>
                    <Checkbox
                      name={enhancement.id}
                      label={enhancement.name}
                      checked={ticked}
                      disabled={locked}
                      size="s"
                      className={styles.tick}
                      onChange={event =>
                        onPick(enhancement.id, event.target.checked)
                      }
                    />
                    {already && (
                      <Typography variant="body4" className={styles.note}>
                        already
                      </Typography>
                    )}
                    {refusal && (
                      <Typography variant="body4" className={styles.note}>
                        {refusal}
                      </Typography>
                    )}
                    <MuiButton
                      size="small"
                      color="secondary"
                      className={styles.about}
                      aria-expanded={showing}
                      aria-controls={panel}
                      aria-label={`What ${enhancement.name} does`}
                      onClick={() =>
                        setOpen(was =>
                          showing
                            ? was.filter(id => id !== enhancement.id)
                            : [...was, enhancement.id],
                        )
                      }
                    >
                      <FontAwesomeV6Icon
                        iconName={showing ? 'chevron-up' : 'chevron-down'}
                        iconStyle="solid"
                      />
                    </MuiButton>
                  </div>

                  {showing && (
                    <div id={panel} className={styles.about}>
                      <Typography variant="body4">
                        {enhancement.description}
                      </Typography>
                      {/* What lands in the project. The same promise the import
                    dialogs make, and it matters more here: this one writes
                    into files the learner already has. */}
                      <Typography variant="body4" className={styles.note}>
                        Also adds: {enhancement.brings.join(', ')}
                      </Typography>
                    </div>
                  )}

                  {ticked && !already && enhancement.asks && (
                    <div className={styles.answers}>
                      <Typography variant="body4">
                        {enhancement.asks.label}:
                      </Typography>
                      {enhancement.asks.options(source, target).length === 0 ? (
                        <Typography variant="body4">(no actors yet)</Typography>
                      ) : (
                        <SegmentedButtons
                          size="xs"
                          selectedButtonValue={answers[enhancement.id] ?? ''}
                          onChange={value => onAnswer(enhancement.id, value)}
                          buttons={enhancement.asks
                            .options(source, target)
                            .map(choice => ({
                              value: choice.value,
                              label: choice.name,
                            }))}
                        />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default EnhancementChecklist;
