// The enhancement shelf: give something you already have what it lacks.
//
// WHAT IT IS ABOUT IS ALREADY ANSWERED. Enhancing is done TO a thing, so it is
// asked from that thing — an actor's row beside Rename and Clone, or the wand
// on its `define actor`, or the wand on a `define world` — and the thing's name
// is in the title rather than in a list to pick from. Which is also why the
// shelf shows only what suits it: an actor is offered the actor ones, a world
// the world ones (`enhancementsFor`).
//
// SOMETIMES THERE IS A SECOND QUESTION, and it is the enhancement's rather
// than the shelf's. A camera has to follow SOMEBODY, and which actor that is
// cannot be read off the world it is being added to — so that enhancement
// ASKS, and the answer is picked under the row that raised it. Under, rather
// than beside: the question only exists once the row is chosen.
//
// IT SAYS WHAT IT WILL TOUCH, because unlike every other library act this one
// EDITS FILES THE LEARNER MADE. An import writes a new file beside theirs; an
// enhancement appends blocks to this actor and to every world. So each row
// lists what lands in the project, and a row that has nothing to do says so —
// an actor that already has it, or one the enhancement refuses.

import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {EnhancementRows, refusalOf} from './EnhancementRows';
import {type Enhancement, type EnhanceTarget} from './enhancements';

export interface EnhanceActorDialogProps {
  /** The project as it stands — read, to say what is already done. */
  source: MultiFileSource;
  /** The thing this is about, chosen before the dialog opened. */
  target: EnhanceTarget;
  /** Chosen — apply this enhancement, with the answer to its question. */
  onEnhance: (enhancement: Enhancement, answer?: string) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
}

export const EnhanceActorDialog = ({
  source,
  target,
  onEnhance,
  onCancel,
}: EnhanceActorDialogProps) => {
  const [chosen, setChosen] = useState<Enhancement | null>(null);
  const [answer, setAnswer] = useState<string | undefined>();

  /** Whether there is enough on the screen to act on. */
  const ready = Boolean(
    chosen &&
      !refusalOf(chosen, source, target, answer) &&
      (!chosen.asks || answer !== undefined),
  );

  return (
    <Dialog
      // A picker, not an alert — see the same note in ImportActorDialog.
      role="dialog"
      title={`Enhance ${target.name}`}
      // What it will touch, said in the terms of the thing it is about: an
      // actor enhancement writes into that actor, a world one into the world.
      description={`Give it something it does not have yet. This writes blocks into ${
        target.kind === 'world' ? 'the world' : "the actor's own file"
      }, and you can open them afterwards and change anything you like.`}
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: 'Enhance',
        disabled: !ready,
        onClick: () => ready && chosen && onEnhance(chosen, answer),
      }}
      secondaryButtonProps={{children: 'Cancel', onClick: onCancel}}
      customContent={
        <EnhancementRows
          source={source}
          target={target}
          chosen={chosen}
          answer={answer}
          onChoose={enhancement => {
            setChosen(enhancement);
            setAnswer(undefined);
          }}
          onAnswer={setAnswer}
        />
      }
    />
  );
};

export default EnhanceActorDialog;
