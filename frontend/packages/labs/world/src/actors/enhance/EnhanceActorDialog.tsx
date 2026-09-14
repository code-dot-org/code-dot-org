// The enhancement shelf: give something you already have what it lacks.
//
// WHAT IT IS ABOUT IS ALREADY ANSWERED. Enhancing is done TO a thing, so it is
// asked from that thing — an actor's row beside Rename and Clone, or the wand
// on its `define actor`, or the wand on a `define world` — and the thing's name
// is in the title rather than in a list to pick from. Which is also why the
// shelf shows only what suits it: an actor is offered the actor ones, a world
// the world ones (`groupsFor`).
//
// IT IS THE ACTOR CREATOR'S THIRD STEP IN A FRAME OF ITS OWN. The list, the
// headings, the tick that is the whole act, the question under a row that
// asks one, the row already ticked because the actor already has it — all of
// that is `EnhancementChecklist`, and this adds a title, a sentence about what
// will be touched, and a button. It used to draw its own list and choose ONE
// row, on the argument that "give this one more thing" is a different act
// from building an actor up; at thirty rows that was the same question drawn
// twice, and a learner who wants one thing ticks one box.
//
// IT SAYS WHAT IT WILL TOUCH, because unlike every other library act this one
// EDITS FILES THE LEARNER MADE. An import writes a new file beside theirs; an
// enhancement appends blocks to this actor, or to this world. The sentence
// under the title says so, and each row says what else it brings.
//
// NOTHING IS APPLIED UNTIL `Enhance`. The ticks are held as picks and folded
// over the source on the press (`enhanceWith`), the same fold the wizard
// makes at `Create`, so a row can be unticked for free and what comes out is
// the whole answer at once.

import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {
  allAnswered,
  EnhancementChecklist,
  NO_PICKS,
  withAnswer,
  withPick,
} from './EnhancementChecklist';
import {enhancementsFor, enhanceWith, type EnhanceTarget} from './enhancements';

export interface EnhanceActorDialogProps {
  /** The project as it stands — read, to say what is already done. */
  source: MultiFileSource;
  /** The thing this is about, chosen before the dialog opened. */
  target: EnhanceTarget;
  /** Pressed — the project with every ticked row given to the target. */
  onEnhance: (enhanced: MultiFileSource) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
}

export const EnhanceActorDialog = ({
  source,
  target,
  onEnhance,
  onCancel,
}: EnhanceActorDialogProps) => {
  const [picks, setPicks] = useState(NO_PICKS);

  /** Whether there is enough on the screen to act on. */
  const ready =
    picks.picked.length > 0 && allAnswered(picks, enhancementsFor(target));

  return (
    <Dialog
      // A picker, not an alert — see the same note in ImportActorDialog.
      role="dialog"
      title={`Enhance ${target.name}`}
      // What it will touch, said in the terms of the thing it is about: an
      // actor enhancement writes into that actor, a world one into the world.
      description={`Tick what it should be able to do. This writes blocks into ${
        target.kind === 'world' ? 'the world' : "the actor's own file"
      }, and you can open them afterwards and change anything you like.`}
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: 'Enhance',
        disabled: !ready,
        onClick: () => ready && onEnhance(enhanceWith(source, target, picks)),
      }}
      secondaryButtonProps={{children: 'Cancel', onClick: onCancel}}
      customContent={
        <EnhancementChecklist
          source={source}
          target={target}
          picked={picks.picked}
          onPick={(id, on) =>
            setPicks(was => withPick(was, id, on, source, target))
          }
          answers={picks.answers}
          onAnswer={(id, value) => setPicks(was => withAnswer(was, id, value))}
        />
      }
    />
  );
};

export default EnhanceActorDialog;
