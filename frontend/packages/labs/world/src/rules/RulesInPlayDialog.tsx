// The rules a world runs, and the two things you can do about them.
//
// Opened from the world block (blockly/extensions/rulesButton), and it exists
// because holding a rule is what puts it in play (blockly/projectModules).
// That is the right rule and an invisible one: there is no longer a row per
// mechanic on the world block to read, and a level that hides the file browser
// leaves no other way to see `rules/` at all.
//
// So this is the file browser for one folder, and the answer to one question.
// It lists what is in play, and offers exactly what a learner can do about it:
// add one, or take one away.
//
// REMOVING DELETES THE FILE, because that is what "not in play" now means.
// There is no third state where a project holds a rule and does not run it —
// that state was the `use rule` row, and it is gone. So the confirm is not
// ceremony: a rule is where a learner's mechanics live, they may have edited
// it, and the undo for this is the version history.
//
// TWO KINDS OF RULE CANNOT GO, and the panel says which rather than letting the
// click through and reporting the wreckage afterwards:
//
//   - a BASE rule (blockly/foundation). Space and Appearance are the engine's,
//     there is no file to delete, and a world without a way to be somewhere is
//     not a world.
//   - a rule ANOTHER rule requires. Gravity is written against motion's step
//     and collision's traits; deleting the one underneath leaves the one on top
//     naming a rule the project has not got, which fails at COMPILE time with
//     nothing on screen to connect it to this moment. Delete the dependent
//     first and this one frees itself.
//
// NOTHING HERE IS TRANSLATED BY HAND. The words are written into the DOM as
// they are, and LocalizeJS translates them where it finds them — which is what
// it is for, and which keeps the English in the file readable as English. The
// effect editor's `translate` is not the pattern to copy: it exists because
// that editor sits inside a `data-notranslate` container (its React Flow canvas
// would be mangled), so it has to do for itself what the page does for
// everybody else.
//
// What IS marked is the dynamic half — a file name, a rule's name, a list of
// them. Those are the learner's words and the project's, not phrases anybody
// should be translating, so they wear `data-notranslate` where they interpolate
// into a sentence that is.

import {Button, Typography} from '@mui/material';
import {useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {BASE_RULES} from '../blockly/foundation';

import {
  filesUsing,
  heldRules,
  rulesRequiring,
  type HeldRule,
} from './removeRule';
import styles from './rulesInPlayDialog.module.css';

export interface RulesInPlayDialogProps {
  /** The project, which is where the answer lives. */
  source: MultiFileSource;
  /** Add one — opens the stock picker. */
  onAdd: () => void;
  /** Take one away, file and all. */
  onRemove: (rule: HeldRule) => void;
  /** Dismissed. */
  onClose: () => void;
  /**
   * Whether the learner may change anything.
   *
   * A level can hand out a project to read rather than to edit, and the panel
   * is worth opening either way — "what is this world made of" is the question
   * it answers, and that question has an answer in a read-only project too.
   */
  editable?: boolean;
}

export const RulesInPlayDialog = ({
  source,
  onAdd,
  onRemove,
  onClose,
  editable = true,
}: RulesInPlayDialogProps) => {
  // Which row is asking to be sure. One at a time, and cleared by any answer:
  // the question is about a specific rule and reads as noise anywhere else.
  const [confirming, setConfirming] = useState<string | null>(null);
  const rules = heldRules(source);

  return (
    <Dialog
      // A panel, not an alert: `Dialog` declares `role="alertdialog"`, which
      // announces something that needs answering now. The prop spread lands
      // after it, so this is the role that reaches the DOM.
      role="dialog"
      title="Rules in play"
      description="Every rule in your project runs in every world. Add one to give your world a new mechanic; remove one to take it out."
      onClose={onClose}
      closeLabel="Close"
      primaryButtonProps={{
        children: 'Add a rule…',
        disabled: !editable,
        onClick: onAdd,
      }}
      secondaryButtonProps={{
        children: 'Done',
        onClick: onClose,
      }}
      customContent={
        <ul className={styles.list}>
          {/* The engine's own, first and always: they are what everything else
              is built on, and a panel that started at "Has Gravity" would read
              as though being somewhere were a mechanic too. */}
          {BASE_RULES.map(rule => (
            <li key={rule.name} className={`${styles.rule} ${styles.base}`}>
              <span className={styles.what}>
                <Typography component="span" variant="label2">
                  {rule.ability}
                </Typography>
                <Typography component="span" variant="body4">
                  Built in — every world has it.
                </Typography>
              </span>
            </li>
          ))}
          {rules.length === 0 && (
            <li>
              <Typography
                className={styles.empty}
                variant="body2"
                color="textSecondary"
              >
                Your project has no rules of its own yet, so nothing moves,
                falls or collides. Add one to get started.
              </Typography>
            </li>
          )}
          {rules.map(rule => {
            const needed = rulesRequiring(source, rule);
            const used = filesUsing(source, rule);
            return (
              <li key={rule.path} className={styles.rule}>
                <span className={styles.what}>
                  {/* The ability leads, as it does in the picker: this panel
                      answers "what does this world have?", and the rule's own
                      name is what its toolbox category says.

                      `label2` and not `strong`, which is what every one of
                      these lists used to say. `strong` is a MODIFIER variant —
                      it sets a weight and nothing else, no family and no size —
                      so standalone it renders bold in whatever font it happens
                      to inherit, which beside a Blockly workspace is not the
                      design system's. `label2` is the 14px/600 step above the
                      `body4` lines under it, and it is what a label is for. */}
                  <Typography component="span" variant="label2">
                    {rule.ability ?? rule.name}
                  </Typography>
                  <Typography component="span" variant="body4">
                    {/* A file name is the learner's, not a phrase: masked so
                        the DOM engine leaves it alone (see the module note). */}
                    <span data-notranslate>{rule.fileName}</span>
                  </Typography>
                  {rule.provides.length > 0 && (
                    // The traits, named — a rule reaches actors through them,
                    // so this is what would stop being electable.
                    <Typography component="span" variant="body4">
                      Gives actors:{' '}
                      <span data-notranslate>{rule.provides.join(', ')}</span>
                    </Typography>
                  )}
                  {needed.length > 0 && (
                    // Why the button beside it is dead. Said in the row rather
                    // than on the click, so a learner reads the shape of their
                    // own project rather than bumping into it.
                    <Typography
                      className={styles.warning}
                      component="span"
                      variant="body4"
                      color="textSecondary"
                    >
                      Required by{' '}
                      <span data-notranslate>{needed.join(', ')}</span>.
                    </Typography>
                  )}
                  {confirming === rule.path && used.length > 0 && (
                    // The other way a rule holds something up: an actor that
                    // elected one of its traits. Not a block — a learner taking
                    // gravity out of their game means it, and the actors are
                    // theirs to fix — but said before the click, because the
                    // failure is a compile error naming a file they were not
                    // looking at.
                    <Typography
                      className={styles.warning}
                      component="span"
                      variant="body4"
                      color="error"
                    >
                      {/* "Used by", not "{names} uses" — the list may be one
                          file or five, and a sentence whose verb has to agree
                          with it is a sentence that will read wrong half the
                          time. */}
                      Used by <span data-notranslate>{used.join(', ')}</span>.
                      Deleting it stops the project running until you edit those
                      too.
                    </Typography>
                  )}
                </span>
                {editable &&
                  (confirming === rule.path ? (
                    <span className={styles.decide}>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => {
                          setConfirming(null);
                          onRemove(rule);
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => setConfirming(null)}
                      >
                        Cancel
                      </Button>
                    </span>
                  ) : (
                    <span className={styles.decide}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        disabled={needed.length > 0}
                        onClick={() => setConfirming(rule.path)}
                      >
                        Remove
                      </Button>
                    </span>
                  ))}
              </li>
            );
          })}
        </ul>
      }
    />
  );
};

export default RulesInPlayDialog;
