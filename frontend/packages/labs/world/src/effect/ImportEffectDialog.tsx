// The stock-effect picker, opened by the `(import…)` row on an effect dropdown.
//
// It lists the library in its teaching order (see stock/index.ts) and copies
// the chosen one into the project. What a learner needs to choose well is the
// same thing the library was written to provide: a name, a sentence saying what
// the effect does, and the knobs it offers.

import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import styles from './importEffectDialog.module.css';
import {translate} from './localization';
import {STOCK_EFFECTS, type StockEffect} from './stock';

export interface ImportEffectDialogProps {
  /** Chosen — copy this into the project. */
  onImport: (effect: StockEffect) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
}

export const ImportEffectDialog = ({
  onImport,
  onCancel,
}: ImportEffectDialogProps) => {
  // Picking a row selects it; `Import` is what commits. A click that copies a
  // file into the project the moment it lands is a decision made by the mouse,
  // and reading the next row down is how somebody decides they wanted that one.
  const [chosen, setChosen] = useState<StockEffect | null>(null);

  return (
    <Dialog
      // A picker, not an alert: `Dialog` declares `role="alertdialog"`, which
      // announces something that needs answering now. The prop spread lands
      // after it, so this is the role that reaches the DOM.
      role="dialog"
      title={translate('Add an effect')}
      description={translate(
        'Pick one to copy into your project. You can open it afterwards and change anything you like.',
      )}
      onClose={onCancel}
      closeLabel={translate('Close')}
      primaryButtonProps={{
        children: translate('Import'),
        disabled: chosen === null,
        onClick: () => chosen && onImport(chosen),
      }}
      secondaryButtonProps={{
        children: translate('Cancel'),
        onClick: onCancel,
      }}
      customContent={
        /* In the library's order, which is the order they teach in: the first
           is the one to read if you have never seen a shader. */
        <ul className={styles.list}>
          {STOCK_EFFECTS.map(effect => (
            <li key={effect.id}>
              <Button
                className={styles.effect}
                // The design system's own colors, so a row reads as the same
                // kind of thing as every other button on the site — and its
                // selected state is the one the system already has a look for.
                variant={chosen?.id === effect.id ? 'contained' : 'outlined'}
                color="secondary"
                size="small"
                fullWidth
                aria-pressed={chosen?.id === effect.id}
                onClick={() => setChosen(effect)}
                onDoubleClick={() => onImport(effect)}
              >
                <Typography component="span" variant="strong" color="inherit">
                  {effect.document.name}
                </Typography>
                <Typography component="span" variant="body4" color="inherit">
                  {effect.document.description}
                </Typography>
                {effect.document.parameters.length > 0 && (
                  // The knobs, named. Two effects can do similar things and
                  // differ entirely in what they let you control.
                  <Typography component="span" variant="body4" color="inherit">
                    {translate('Knobs: {names}', {
                      names: effect.document.parameters
                        .map(parameter => parameter.name)
                        .join(', '),
                    })}
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

export default ImportEffectDialog;
