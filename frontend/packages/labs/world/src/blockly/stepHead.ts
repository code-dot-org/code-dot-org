// The block a step is written under, on its page (specs/RULE_EDITOR_PLAN.md,
// step 5).
//
// A step is a moment of the frame and what is done in it, so its head says
// the moment — "each frame, during push" — and what it does hangs below.
// Like a member's head it is made only on the page: the page keeps what
// hangs below it as the step's body, a rule's (`rules/ruleSteps`) or an
// actor's (`actors/actorSteps`). Its name and its phase are the page's,
// above the workspace.

import * as Blockly from 'blockly/core';

import {defineBlock, defineExtension} from '@code-dot-org/blockly';

import {STEP_HEAD} from './pageHeads';

/** Fixed in place: the page has one step, and it is this. */
const stepHeadExtension = defineExtension(`${STEP_HEAD}_init`, {
  extension() {
    const block = this as unknown as Blockly.BlockSvg;
    block.setMovable(false);
    block.setDeletable(false);
    block.hat = 'cap';
  },
});

export const stepHead = defineBlock({
  type: STEP_HEAD,
  message0: '%1',
  args0: [{type: 'field_label_serializable', name: 'MOMENT', text: ''}],
  nextStatement: true,
  extensions: [stepHeadExtension],
  style: 'event_blocks',
  tooltip: 'When this step runs. What it does goes underneath.',
  generator: {
    javascript: () => '',
  },
});
