// The stock-rule picker, opened by the `(import…)` row on a `use rule` dropdown.
//
// The same shape as the effect picker, and what a learner needs to choose is
// the same: a name, a sentence on what the rule does, and — the part specific
// to rules — which traits it gives an actor. A rule's traits are how it reaches
// the actors in a world, so "what will I be able to put on things?" is the
// question a name alone cannot answer.

import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

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
  // Picking a row selects it; `Import` is what commits. A rule brings the rules
  // it needs with it, so the row a learner lands on first is rarely the one
  // they meant once they have read what else comes along.
  const [chosen, setChosen] = useState<StockRule | null>(null);

  return (
    <Dialog
      // A picker, not an alert: `Dialog` declares `role="alertdialog"`, which
      // announces something that needs answering now. The prop spread lands
      // after it, so this is the role that reaches the DOM.
      role="dialog"
      title={translate('Add a rule')}
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
        <ul className={styles.list}>
          {STOCK_RULES.map(rule => (
            <li key={rule.id}>
              <Button
                className={styles.effect}
                // The design system's own colors, so a row reads as the same
                // kind of thing as every other button on the site — and its
                // selected state is the one the system already has a look for.
                variant={chosen?.id === rule.id ? 'contained' : 'outlined'}
                color="secondary"
                size="small"
                fullWidth
                aria-pressed={chosen?.id === rule.id}
                onClick={() => setChosen(rule)}
                onDoubleClick={() => onImport(rule)}
              >
                {/* The ability leads: this dialog answers "what should this
                  world have?", and the rule's own name is what you will see on
                  its toolbox category once it is in. */}
                <Typography component="span" variant="strong" color="inherit">
                  {rule.ability}
                </Typography>
                <Typography component="span" variant="body4" color="inherit">
                  {rule.description}
                </Typography>
                {stockRequirements(rule).length > 0 && (
                  // What else lands in `rules/`. A mechanic is written against
                  // other mechanics — gravity against collision and motion — and
                  // they come with it, so the dialog says so rather than leaving
                  // a learner to wonder where the extra files came from.
                  <Typography component="span" variant="body4" color="inherit">
                    {translate('Also adds: {names}', {
                      names: stockRequirements(rule)
                        .map(dep => dep.ability)
                        .join(', '),
                    })}
                  </Typography>
                )}
                {rule.provides.length > 0 && (
                  // The traits, named. A rule reaches actors through its traits,
                  // so this is what a learner will actually put on something.
                  <Typography component="span" variant="body4" color="inherit">
                    {translate('Gives actors: {names}', {
                      names: rule.provides.join(', '),
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

export default ImportRuleDialog;
