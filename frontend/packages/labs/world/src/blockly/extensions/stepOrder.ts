// `define step`'s anchor dropdown (`STEP`) is only meaningful when the step is
// ordered before/after another step — when the ORDER dropdown is "unordered"
// there is nothing to anchor to, and showing it just confuses. This extension
// hides the `ANCHOR` input (which holds `STEP`) whenever ORDER is `free`, and
// keeps it in sync as the learner changes the dropdown.

import type {Block} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

export const STEP_ORDER_EXTENSION = 'world_step_order';

/** Whether an ORDER value anchors the step (so the STEP dropdown is relevant). */
const isAnchored = (order: string | null): boolean =>
  order === 'before' || order === 'after';

export const stepOrderExtension: Extension = defineExtension(
  STEP_ORDER_EXTENSION,
  {
    extension() {
      const block = this as Block;
      const sync = (): void => {
        block
          .getInput('ANCHOR')
          ?.setVisible(isAnchored(block.getFieldValue('ORDER')));
        // Reflow so the hidden row leaves no gap (no-op before first render).
        (block as {queueRender?: () => void}).queueRender?.();
      };
      // Re-sync when ORDER changes — deferred, since reflowing the block mid
      // field-validation is unsafe (the params mutator hit the same hazard).
      block.getField('ORDER')?.setValidator((value: string) => {
        setTimeout(sync, 0);
        return value;
      });
      sync();
    },
  },
);
