// The stock-rule picker, opened by the `(import…)` row on a `use rule` dropdown.
//
// The same shape as the effect picker, and what a learner needs to choose is
// the same: a name, a sentence on what the rule does, and — the part specific
// to rules — which traits it gives an actor. A rule's traits are how it reaches
// the actors in a world, so "what will I be able to put on things?" is the
// question a name alone cannot answer.

import {Button} from '@mui/material';
import {useCallback} from 'react';

import {CustomDialog} from '@code-dot-org/component-library/dialog';

import {translate} from '../effect/localization';

import styles from './importRuleDialog.module.css';
import {stockRequirements} from './importStockRule';
import {STOCK_RULES, type StockRule} from './stock';

export interface ImportRuleDialogProps {
  /** Chosen — copy this into the project. */
  onImport: (rule: StockRule) => void;
  /** Dismissed without choosing. */
  onCancel: () => void;
}

export const ImportRuleDialog = ({
  onImport,
  onCancel,
}: ImportRuleDialogProps) => {
  const choose = useCallback(
    (rule: StockRule) => () => onImport(rule),
    [onImport],
  );

  return (
    <CustomDialog
      className={styles.dialog}
      onClose={onCancel}
      closeLabel={translate('Close')}
    >
      <h2 className={styles.title}>{translate('Add a rule')}</h2>
      <p className={styles.intro}>
        {translate(
          'Pick one to copy into your project. You can open it afterwards and change anything you like.',
        )}
      </p>
      <ul className={styles.list}>
        {STOCK_RULES.map(rule => (
          <li key={rule.id}>
            <button
              type="button"
              className={styles.effect}
              onClick={choose(rule)}
            >
              {/* The ability leads: this dialog answers "what should this
                  world have?", and the rule's own name is what you will see on
                  its toolbox category once it is in. */}
              <span className={styles.name}>{rule.ability}</span>
              <span className={styles.description}>{rule.description}</span>
              {stockRequirements(rule).length > 0 && (
                // What else lands in `rules/`. A mechanic is written against
                // other mechanics — gravity against collision and motion — and
                // they come with it, so the dialog says so rather than leaving
                // a learner to wonder where the extra files came from.
                <span className={styles.provides}>
                  {translate('Also adds: {names}', {
                    names: stockRequirements(rule)
                      .map(dep => dep.ability)
                      .join(', '),
                  })}
                </span>
              )}
              {rule.provides.length > 0 && (
                // The traits, named. A rule reaches actors through its traits,
                // so this is what a learner will actually put on something.
                <span className={styles.provides}>
                  {translate('Gives actors: {names}', {
                    names: rule.provides.join(', '),
                  })}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Button onClick={onCancel}>{translate('Cancel')}</Button>
      </div>
    </CustomDialog>
  );
};

export default ImportRuleDialog;
