// The warning on a block that names a rule the project has not got.
//
// A dead reference is a thing a project can hold now that removing a rule
// deletes its file (rules/removeRule): delete `rules/gravity.rule` and every
// `use trait Affected by Gravity` in the project is a row pointing at nothing.
//
// The generator's half is to write nothing for such a row, so the project still
// compiles and runs without that trait (domainBlocks, `world_use_trait`). That
// is the right behaviour and, on its own, a silent one — the actor quietly
// stops falling and there is nothing anywhere saying why. This is the other
// half: the block that has stopped meaning anything says so, on its own face,
// where the learner is already looking.
//
// WHY IT NEEDS ITS OWN REFRESH. A block's `onchange` hears about its own
// workspace, and a rule being deleted does not happen there — it happens in a
// dialog, to a file, while this workspace sits untouched. So the editor calls
// `refreshMissingRuleWarnings` when the project changes, and this extension
// covers the other route: a file opened after the deletion, where the block is
// built from JSON and nothing has changed since.

import type {Block} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {
  missingRuleOfBlockType,
  refFromValue,
  refResolves,
} from '../ruleRegistry';

import {addOnChange} from './onChange';

export const MISSING_RULE_EXTENSION = 'world_missing_rule_warning';

/**
 * The rule this block depends on and the project has not got, if any.
 *
 * Two ways to be one, because there are two ways a block names a member. A
 * `use trait` says which trait in a FIELD, so the answer is in the value it
 * holds. Every other member block — a hat, a query, a getter, an action — is a
 * block type minted for one member, so the answer is a fact about the type
 * (`registerMemberBlockType`).
 */
function missingRuleFor(block: Block): string | undefined {
  const trait = block.getFieldValue?.('TRAIT');
  if (typeof trait === 'string' && trait) {
    const ref = refFromValue(trait);
    return refResolves(ref) ? undefined : ref.ruleName;
  }
  return missingRuleOfBlockType(block.type);
}

/** Put the warning on, or take it off. */
function syncWarning(block: Block): void {
  const missing = missingRuleFor(block);
  // Namespaced, so it coexists with the "this block is in the wrong place"
  // warning `traitContext` puts on the same block for a different reason.
  block.setWarningText?.(
    missing
      ? `Your project does not have “${missing}” any more, so this block does nothing. Add it back, or delete this block.`
      : null,
    MISSING_RULE_EXTENSION,
  );
}

/**
 * Re-check every block on a workspace — for when the PROJECT changed.
 *
 * Called by the editor after a file is added or deleted. Deleting a rule is not
 * an event on this workspace, so nothing here would otherwise hear about the
 * moment a block's reference died.
 */
export function refreshMissingRuleWarnings(
  workspace: Blockly.WorkspaceSvg | null | undefined,
): void {
  for (const block of workspace?.getAllBlocks(false) ?? []) {
    syncWarning(block);
  }
}

/** Warn when this block's trait belongs to a rule the project has not got. */
export const missingRuleExtension: Extension = defineExtension(
  MISSING_RULE_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      syncWarning(block);
      addOnChange(block, event => {
        // The value changing is the obvious one; FINISHED_LOADING is the other,
        // and the one that matters most here: a block deserialized before the
        // project's rules were registered would otherwise warn about every
        // trait in the file, all of which are fine.
        const change = event as Blockly.Events.BlockChange;
        const mine =
          event.type === Blockly.Events.BLOCK_CHANGE &&
          change.blockId === block.id &&
          change.element === 'field';
        if (mine || event.type === Blockly.Events.FINISHED_LOADING) {
          syncWarning(block);
        }
      });
    },
  },
);
