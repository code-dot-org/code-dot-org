// The enhancement shelf: give an actor you already have something it lacks.
//
// ONE QUESTION, because the other one is already answered. Enhancing is done
// TO an actor, so it is asked from that actor's own row — beside Rename and
// Clone, where everything done to one file lives — and the actor's name is in
// the title rather than in a second list to pick from.
//
// IT SAYS WHAT IT WILL TOUCH, because unlike every other library act this one
// EDITS FILES THE LEARNER MADE. An import writes a new file beside theirs; an
// enhancement appends blocks to this actor and to every world. So each row
// lists what lands in the project, and a row that has nothing to do says so —
// an actor that already has it, or one the enhancement refuses.

import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import type {MultiFileSource} from '@code-dot-org/core/api';

import styles from './enhanceActorDialog.module.css';
import {
  ENHANCEMENTS,
  type Enhancement,
  type EnhanceTarget,
} from './enhancements';

export interface EnhanceActorDialogProps {
  /** The project as it stands — read, to say what is already done. */
  source: MultiFileSource;
  /** The actor this is about, chosen before the dialog opened. */
  target: EnhanceTarget;
  /** Chosen — apply this enhancement to that actor. */
  onEnhance: (enhancement: Enhancement) => void;
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

  /** Why this actor cannot take that enhancement, if it cannot. */
  const why = (enhancement: Enhancement): string | undefined =>
    enhancement.refuse?.(target) ??
    (enhancement.applied(source, target) ? 'Already has this.' : undefined);

  return (
    <Dialog
      // A picker, not an alert — see the same note in ImportActorDialog.
      role="dialog"
      title={`Enhance ${target.name}`}
      description="Give it something it does not have yet. This edits the actor's own file, and you can open it afterwards and change anything you like."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: 'Enhance',
        disabled: chosen === null || Boolean(why(chosen)),
        onClick: () => chosen && !why(chosen) && onEnhance(chosen),
      }}
      secondaryButtonProps={{children: 'Cancel', onClick: onCancel}}
      customContent={
        <ul className={styles.list}>
          {ENHANCEMENTS.map(enhancement => {
            const refusal = why(enhancement);
            return (
              <li key={enhancement.id}>
                <Button
                  className={styles.enhancement}
                  variant={
                    chosen?.id === enhancement.id ? 'contained' : 'outlined'
                  }
                  color="secondary"
                  size="small"
                  fullWidth
                  disabled={Boolean(refusal)}
                  aria-pressed={chosen?.id === enhancement.id}
                  onClick={() => setChosen(enhancement)}
                >
                  <Typography component="span" variant="label2" color="inherit">
                    {enhancement.name}
                  </Typography>
                  <Typography component="span" variant="body4" color="inherit">
                    {enhancement.description}
                  </Typography>
                  {/* What lands in the project. The same promise the import
                      dialogs make, and it matters more here: this one writes
                      into files the learner already has. */}
                  <Typography component="span" variant="body4" color="inherit">
                    Also adds: {enhancement.brings.join(', ')}
                  </Typography>
                  {refusal && (
                    <Typography
                      component="span"
                      variant="body4"
                      color="inherit"
                    >
                      {refusal}
                    </Typography>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      }
    />
  );
};

export default EnhanceActorDialog;
