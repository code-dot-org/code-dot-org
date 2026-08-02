// The stock-effect picker, opened by the `(import…)` row on an effect dropdown.
//
// It lists the library in its teaching order (see stock/index.ts) and copies
// the chosen one into the project. What a learner needs to choose well is the
// same thing the library was written to provide: a name, a sentence saying what
// the effect does, and the knobs it offers.

import {Button} from '@mui/material';
import {useCallback} from 'react';

import {CustomDialog} from '@code-dot-org/component-library/dialog';

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
  const choose = useCallback(
    (effect: StockEffect) => () => onImport(effect),
    [onImport],
  );

  return (
    <CustomDialog
      className={styles.dialog}
      onClose={onCancel}
      closeLabel={translate('Close')}
    >
      <h2 className={styles.title}>{translate('Add an effect')}</h2>
      <p className={styles.intro}>
        {translate(
          'Pick one to copy into your project. You can open it afterwards and change anything you like.',
        )}
      </p>
      {/* In the library's order, which is the order they teach in: the first
          is the one to read if you have never seen a shader. */}
      <ul className={styles.list}>
        {STOCK_EFFECTS.map(effect => (
          <li key={effect.id}>
            <button
              type="button"
              className={styles.effect}
              onClick={choose(effect)}
            >
              <span className={styles.name}>{effect.document.name}</span>
              <span className={styles.description}>
                {effect.document.description}
              </span>
              {effect.document.parameters.length > 0 && (
                // The knobs, named. Two effects can do similar things and
                // differ entirely in what they let you control.
                <span className={styles.knobs}>
                  {translate('Knobs: {names}', {
                    names: effect.document.parameters
                      .map(parameter => parameter.name)
                      .join(', '),
                  })}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Button variant="text" color="secondary" onClick={onCancel}>
          {translate('Cancel')}
        </Button>
      </div>
    </CustomDialog>
  );
};

export default ImportEffectDialog;
