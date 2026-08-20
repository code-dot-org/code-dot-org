// The stock-rule picker, opened by the `(import…)` row on a `use rule` dropdown.
//
// NOTHING IS MASKED HERE, where the rules panel masks half its rows: every word
// on this dialog is the STOCK library's, which is product copy written in this
// repository, and product copy is exactly what the page's translation is for.
// The panel is about the learner's own project — their file names, their rules
// — and those are theirs, so it fences them off (`data-notranslate`).
//
// The same shape as the effect picker, and what a learner needs to choose is
// the same: a name, a sentence on what the rule does, and — the part specific
// to rules — which traits it gives an actor. A rule's traits are how it reaches
// the actors in a world, so "what will I be able to put on things?" is the
// question a name alone cannot answer.
//
// THE DETAIL IS ON THE SELECTED ROW ONLY, and the list grew into that. Every
// row used to carry four lines — the ability, the sentence, what else it drags
// in, and what it gives actors — and twenty-three of those is a page nobody
// scans. What a browsing learner needs is the ability and the sentence; the
// other two answer "what happens if I take this one", which is a question about
// the row they have already landed on.
//
// AND IT IS A TREE, nested by what each rule is written against
// (`stockRuleTree`). Camera Ease is not a peer of Camera — it is a thing you
// add to one — and saying so takes twenty-three entries down to twelve without
// anybody maintaining a taxonomy.

import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import {demoFrames, demoUrl, DEMO_SIZE} from './demos';
import styles from './importRuleDialog.module.css';
import {stockRequirements} from './importStockRule';
import {type StockRule} from './stock';
import {stockRuleRows} from './stockRuleTree';

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
      title="Add a rule"
      description="Pick one to copy into your project. You can open it afterwards and change anything you like."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: 'Import',
        disabled: chosen === null,
        onClick: () => chosen && onImport(chosen),
      }}
      secondaryButtonProps={{
        children: 'Cancel',
        onClick: onCancel,
      }}
      customContent={
        <ul className={styles.list}>
          {stockRuleRows().map(({rule, depth}) => (
            <li
              key={rule.id}
              className={styles.row}
              // Indented by what it is written against, so an add-on reads as
              // one. A depth is a number rather than a class because it is
              // data — a rule three deep is a rule three deep.
              style={{marginInlineStart: `${depth * 1.25}rem`}}
            >
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
                <Typography component="span" variant="label2" color="inherit">
                  {rule.ability}
                </Typography>
                <Typography component="span" variant="body4" color="inherit">
                  {rule.description}
                </Typography>
                {demoUrl(rule.id) && (
                  // What the rule DOES, which no sentence on this row can say
                  // (specs/RULE_DEMOS.md). One strip PNG: frame one is the
                  // still every row shows, and a row that is being LOOKED at
                  // steps through the rest — hovered, focused or selected.
                  //
                  // One asset for both states, rather than a still and a GIF
                  // beside it: two files would be two things to produce, name,
                  // cache and keep in step, and the pair could drift. And a
                  // strip can be HELD, which is what `prefers-reduced-motion`
                  // asks of it and what a GIF has no way to offer.
                  <span
                    className={
                      chosen?.id === rule.id
                        ? `${styles.demo} ${styles.playing}`
                        : styles.demo
                    }
                    // Custom properties rather than a class per rule: the frame
                    // count is a fact about the recording, so it comes from the
                    // demo rather than from a stylesheet that would have to be
                    // edited every time one was re-recorded.
                    style={
                      {
                        '--demo': `url(${demoUrl(rule.id)})`,
                        '--frames': demoFrames(rule.id),
                        '--demo-width': `${DEMO_SIZE.width}px`,
                        '--demo-height': `${DEMO_SIZE.height}px`,
                      } as React.CSSProperties
                    }
                    // Decoration beside a row that already says what it is in
                    // words: a screen reader gains nothing from "a box falls".
                    aria-hidden="true"
                  />
                )}
                {chosen?.id === rule.id &&
                  stockRequirements(rule).length > 0 && (
                    // What else lands in `rules/`. A mechanic is written
                    // against other mechanics — gravity against collision and
                    // motion — and they come with it, so the dialog says so
                    // rather than leaving a learner to wonder where the extra
                    // files came from.
                    <Typography
                      component="span"
                      variant="body4"
                      color="inherit"
                    >
                      Also adds:{' '}
                      {stockRequirements(rule)
                        .map(dep => dep.ability)
                        .join(', ')}
                    </Typography>
                  )}
                {chosen?.id === rule.id && rule.provides.length > 0 && (
                  // The traits, named. A rule reaches actors through its
                  // traits, so this is what a learner will actually put on
                  // something.
                  <Typography component="span" variant="body4" color="inherit">
                    Gives actors: {rule.provides.join(', ')}
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
