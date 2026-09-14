// The shelf as a CHECKLIST: the Actor Creator's third step, and the enhance
// dialog that opens from an actor's own row or the wand on its block.
//
// It was rows pressed one at a time, with an `Add this` button under them —
// and that was two mistakes wearing one coat. The first is the one the drawing panel had: a press that is not the
// press you were going to make anyway is a press that gets forgotten, and this
// one had to be made once PER ability. The second is that a button reading
// "Add this" beside a list of twelve says nothing about the fact that you may
// have as many as you like.
//
// So the rows are checkboxes and nothing is applied until `Create` — or
// `Enhance`, which is the same press on the other frame. Checking one is the
// whole act, the list can be read as a list, and what an actor will be able to
// do is visible all at once rather than remembered.
//
// THE DIALOG USED TO BE ITS OWN LIST, choosing one row and closing, on the
// argument that "give this one more thing" is a different act from building
// one up. At four rows that was a distinction; at thirty it was the same
// question drawn twice, and the frame that drew it as buttons with the prose
// inline was the one reported as a wall. A learner who wants one thing ticks
// one box.
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
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {MultiFileSource} from '@code-dot-org/core/api';

import styles from './enhancementChecklist.module.css';
import {
  enhancementsFor,
  groupsFor,
  type Enhancement,
  type EnhanceTarget,
  type Picks,
} from './enhancements';

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

/**
 * How many rows a list can hold before it is read by its headings.
 *
 * A JUDGEMENT WITH A REASON RATHER THAN A ROUND NUMBER: twelve is about what
 * fits in the dialog without scrolling, and a list you can see all of is one
 * you scan rather than navigate.
 */
const TIDY = 12;

/** Nothing ticked yet, which is how both frames start. */
export const NO_PICKS: Picks = {picked: [], answers: {}};

/**
 * The picks with one row ticked or unticked.
 *
 * TICKING ANSWERS THE QUESTION TOO, where there is one. The row's dropdown is
 * then a thing to CHANGE rather than a gate between the learner and the
 * ability, and the first option is the likeliest by the order the row offers
 * them. An answer already given is kept: unticking and re-ticking is not a
 * change of mind about who.
 */
export const withPick = (
  picks: Picks,
  id: string,
  on: boolean,
  source: MultiFileSource,
  target: EnhanceTarget,
): Picks => {
  if (!on) {
    return {...picks, picked: picks.picked.filter(each => each !== id)};
  }
  const picked = picks.picked.includes(id)
    ? picks.picked
    : [...picks.picked, id];
  const asks = enhancementsFor(target).find(one => one.id === id)?.asks;
  const first = asks?.options(source, target)[0];
  const answers =
    first && picks.answers[id] === undefined
      ? {...picks.answers, [id]: first.value}
      : picks.answers;
  return {picked, answers};
};

/** The picks with one row's question answered. */
export const withAnswer = (picks: Picks, id: string, value: string): Picks => ({
  ...picks,
  answers: {...picks.answers, [id]: value},
});

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
  {picked, answers}: Picks,
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
  /**
   * Which GROUPS are folded away.
   *
   * SHUT ONLY WHEN THERE IS ENOUGH TO NEED IT, which is the whole reason the
   * fold exists. What a fold buys is room, and room is not short at ten rows —
   * four headings over ten rows reads as a list. At thirty it is five walls,
   * and then the headings are what the list is read BY: a learner looking for
   * something opens the group it would be in.
   *
   * So the resting state is measured rather than chosen. A group that holds
   * something this actor ALREADY has stays open whatever the count: that is
   * the one thing on this step which is a fact rather than an offer, and
   * hiding it behind a press would be hiding the answer to the question the
   * step asks.
   */
  const rows = groups.reduce((count, group) => count + group.members.length, 0);
  const [shut, setShut] = useState<readonly string[]>(() =>
    rows <= TIDY
      ? []
      : groups
          .filter(
            group =>
              !group.members.some(one => alreadyHas(one, source, target)),
          )
          .map(group => group.name),
  );

  if (groups.length === 0) {
    // The wording every empty list in this lab uses.
    return (
      <Typography variant="body4">(nothing to add to this yet)</Typography>
    );
  }

  return (
    <div className={styles.groups}>
      {groups.map(group => {
        const folded = shut.includes(group.name);
        return (
          <section key={group.name}>
            {/* A HEADING RATHER THAN A FOLD, at ten rows. What a fold buys is
              room, and room is not what is short here — what was short was a
              way to tell one run of rows from the next. Thirty will want the
              fold as well (specs/ACTOR_CREATION_WIZARD.md). */}
            <Typography
              component="h3"
              variant="body4"
              className={styles.heading}
            >
              {/* The disclosure pattern: the button is INSIDE the heading, which
                keeps the heading a heading for anything navigating by them and
                still gives the press a name and a state. */}
              <MuiButton
                variant="text"
                color="secondary"
                className={styles.fold}
                aria-expanded={!folded}
                aria-controls={`${group.name}-rows`}
                onClick={() =>
                  setShut(was =>
                    folded
                      ? was.filter(name => name !== group.name)
                      : [...was, group.name],
                  )
                }
              >
                <FontAwesomeV6Icon
                  iconName={folded ? 'chevron-right' : 'chevron-down'}
                  iconStyle="solid"
                  className={styles.foldMark}
                />
                <Typography component="span" variant="body4" color="inherit">
                  {group.name}
                </Typography>
                {/* How many are under it, which is what makes a shut group worth
                  looking at rather than a word with nothing behind it. */}
                <Typography
                  component="span"
                  variant="body4"
                  color="inherit"
                  className={styles.count}
                >
                  {group.members.length}
                </Typography>
              </MuiButton>
            </Typography>
            <ul
              id={`${group.name}-rows`}
              className={styles.list}
              hidden={folded}
            >
              {group.members
                .filter(one => one.offered?.(source, target) ?? true)
                .map(enhancement => {
                  const already = alreadyHas(enhancement, source, target);
                  const refusal = enhancement.refuse?.(source, target);
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
                          className={styles.chevron}
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
                          {enhancement.asks.options(source, target).length ===
                          0 ? (
                            <Typography variant="body4">
                              (no actors yet)
                            </Typography>
                          ) : (
                            // A DROPDOWN RATHER THAN A ROW OF BUTTONS, because
                            // what it lists is the project's actors and a
                            // project may hold thirty. The answer is defaulted
                            // the moment the row is ticked, so this is a thing
                            // to CHANGE rather than a question standing between
                            // the learner and the ability.
                            <SimpleDropdown
                              name={`${enhancement.id}-answer`}
                              size="s"
                              labelText={enhancement.asks.label}
                              selectedValue={answers[enhancement.id] ?? ''}
                              onChange={event =>
                                onAnswer(enhancement.id, event.target.value)
                              }
                              items={enhancement.asks
                                .options(source, target)
                                .map(choice => ({
                                  value: choice.value,
                                  text: choice.name,
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
        );
      })}
    </div>
  );
};

export default EnhancementChecklist;
