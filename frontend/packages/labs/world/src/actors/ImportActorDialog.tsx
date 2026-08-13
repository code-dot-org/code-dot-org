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

import styles from './importActorDialog.module.css';
import {actorRequirements} from './importStockActor';
import {STOCK_ACTORS, type StockActor} from './stock';

export interface ImportActorDialogProps {
  /** Chosen — copy this into the project. */
  onImport: (actor: StockActor) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
}

export const ImportActorDialog = ({
  onImport,
  onCancel,
}: ImportActorDialogProps) => {
  const [chosen, setChosen] = useState<StockActor | null>(null);

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
        disabled: chosen === null,
        onClick: () => chosen && onImport(chosen),
      }}
      secondaryButtonProps={{children: 'Cancel', onClick: onCancel}}
      customContent={
        <ul className={styles.list}>
          {STOCK_ACTORS.map(actor => (
            <li key={actor.id}>
              <Button
                className={styles.actor}
                variant={chosen?.id === actor.id ? 'contained' : 'outlined'}
                color="secondary"
                size="small"
                fullWidth
                aria-pressed={chosen?.id === actor.id}
                onClick={() => setChosen(actor)}
                onDoubleClick={() => onImport(actor)}
              >
                <Typography component="span" variant="label2" color="inherit">
                  {actor.name}
                </Typography>
                <Typography component="span" variant="body4" color="inherit">
                  {actor.description}
                </Typography>
                {actorRequirements(actor).length > 0 && (
                  // What else lands in `rules/`. An actor is written against
                  // mechanics — a Label against Text, a Button against Text and
                  // the Mouse — and they come with it, so the dialog says so
                  // rather than leaving a learner to wonder where the extra
                  // files came from.
                  <Typography component="span" variant="body4" color="inherit">
                    Also adds:{' '}
                    {actorRequirements(actor)
                      .map(rule => rule.ability)
                      .join(', ')}
                  </Typography>
                )}
              </Button>
            </li>
          ))}
        </ul>
      }
    />
  );
};

export default ImportActorDialog;
