// The block an actor's own block is written under, on its member page.
//
// specs/ACTOR_BLOCKS_PLAN.md, step 6. The page's workspace holds one stack:
// this, drawn as the block being made, and its implementation hung below it.
// It is the block a caller sees, less the `on ⟨actor⟩` a call takes at its
// end: inside the implementation the actor is `this actor`.
//
// EACH VALUE'S SOCKET HOLDS ITS GETTER, fixed there. Pressing one drags out
// a new getter for that value, as a flyout gives up a block; the one in the
// socket stays. Blockly offers no drop into an input held by a block that
// cannot be moved, so nothing else is plugged in by dragging.
//
// THE GETTERS ARE NEVER THE FILE'S. The page turns this block back into the
// actor's `define block` row (`memberEdits.withMemberDocument`), taking its
// parts and what hangs below it and nothing from its inputs. They are made
// silently, so making them is no edit and no step to undo.
//
// NOT MADE WHILE LOADING. A workspace the editor saves and loads back (a font
// arriving, a locale changed) brings the getters with it, and the serializer
// plugs them in after `loadExtraState`; a getter made there first would be
// knocked out of its socket and left on the workspace. So the editor fills
// the sockets once the page has loaded, and again when the page hands over
// new parts (`fill_`).

import * as Blockly from 'blockly/core';

import {
  defineBlock,
  defineExtension,
  defineMutator,
} from '@code-dot-org/blockly';

import {settledParts} from './designParts';
import {bindParams, type BlockPart} from './extensions/blockDesigner';
import {addOnChange} from './extensions/onChange';
import {beginGetterDrag} from './fields/dragGetterOut';
import {MEMBER_HEAD, memberValueSocket} from './pageHeads';
import {paramFlavour} from './typedVariables';

const MEMBER_HEAD_MUTATOR = 'world_member_head_mutator';

interface Head {
  parts_: BlockPart[];
  saveExtraState(): {parts: BlockPart[]};
  loadExtraState(state: {parts?: BlockPart[]}): void;
  rebuild_(): void;
  fill_(): void;
}

type HeadBlock = Blockly.BlockSvg & Head;

const head: Head & ThisType<HeadBlock> = {
  parts_: [] as BlockPart[],

  saveExtraState() {
    return {parts: (this.parts_ ?? []).map(part => ({...part}))};
  },

  loadExtraState(state) {
    this.parts_ = (state.parts ?? []).map(part => ({...part}));
    this.rebuild_();
  },

  rebuild_() {
    // Variables with events on: a value renamed renames its variable, and
    // the body's getters follow by the events that fires. Not in the
    // compiler's workspace, which holds every block's body at once, and two
    // blocks may each have a value called `row`.
    if (!(this.workspace as {isRuleGenerator?: boolean}).isRuleGenerator) {
      bindParams(this.workspace.getVariableMap(), this.parts_);
    }
    Blockly.Events.disable();
    try {
      for (const input of [...this.inputList]) {
        input.connection?.targetBlock()?.dispose(false);
        this.removeInput(input.name);
      }
      let words: string[] = [];
      const take = (input: Blockly.Input) => {
        for (const word of words) {
          input.appendField(word);
        }
        words = [];
      };
      let values = 0;
      for (const part of settledParts(this.parts_)) {
        if (part.kind === 'label') {
          words.push(part.text);
        } else if (part.kind === 'row') {
          take(this.appendEndRowInput());
        } else {
          take(this.appendValueInput(memberValueSocket(values)));
          values += 1;
        }
      }
      if (words.length) {
        take(this.appendDummyInput());
      }
      this.setInputsInline(true);
    } finally {
      Blockly.Events.enable();
    }
  },

  fill_() {
    Blockly.Events.disable();
    try {
      const params = this.parts_.filter(part => part.kind === 'param');
      params.forEach((part, at) => {
        const connection = this.getInput(memberValueSocket(at))?.connection;
        if (!connection || connection.targetBlock() || !part.var) {
          return;
        }
        const flavour = paramFlavour(part.type);
        const getter = this.workspace.newBlock(flavour.getterType);
        getter.setFieldValue(part.var, 'VAR');
        getter.setMovable(false);
        getter.setDeletable(false);
        getter.setEditable(false);
        if (this.rendered) {
          (getter as Blockly.BlockSvg).initSvg();
        }
        connection.connect(getter.outputConnection!);
      });
    } finally {
      Blockly.Events.enable();
    }
    if (this.rendered) {
      this.render();
    }
  },
};

const memberHeadMutator = defineMutator(MEMBER_HEAD_MUTATOR, {...head});

/** The fixed getter a press landed on, if it landed on one. */
function getterUnder(block: HeadBlock, target: EventTarget | null) {
  for (const input of block.inputList) {
    const getter = input.connection?.targetBlock() as Blockly.BlockSvg | null;
    if (getter && target instanceof Node) {
      if (getter.getSvgRoot().contains(target)) {
        return getter;
      }
    }
  }
  return null;
}

/**
 * Fixed in place, and the getters' presses taken. A head is only ever made
 * on the member page, so nothing about it is the file's to save.
 */
const memberHeadExtension = defineExtension(`${MEMBER_HEAD}_init`, {
  extension() {
    const block = this as unknown as HeadBlock;
    block.parts_ ??= [];
    block.setMovable(false);
    block.setDeletable(false);
    block.hat = 'cap';
    // Before the getter's own listener: a capture on the head's group is the
    // only place a press on a block that cannot move can be taken.
    if (block instanceof Blockly.BlockSvg) {
      block.getSvgRoot().addEventListener(
        'pointerdown',
        event => {
          const getter = getterUnder(block, event.target);
          if (!getter || block.workspace.isReadOnly()) {
            return;
          }
          event.stopPropagation();
          event.preventDefault();
          beginGetterDrag({
            workspace: block.workspace,
            variableId: getter.getFieldValue('VAR') as string,
            getterType: getter.type,
            event,
          });
        },
        true,
      );
    }
    // A block dropped into a socket goes back out: only the getter is read
    // there, and nothing reads what replaced it.
    addOnChange(block, event => {
      if (event.type !== Blockly.Events.BLOCK_MOVE) {
        return;
      }
      for (const input of block.inputList) {
        const held = input.connection?.targetBlock();
        if (held?.isMovable()) {
          held.unplug();
          (held as Blockly.BlockSvg).bumpNeighbours?.();
        }
      }
    });
  },
});

export const memberHead = defineBlock({
  type: MEMBER_HEAD,
  message0: '',
  args0: [],
  nextStatement: true,
  mutator: memberHeadMutator,
  extensions: [memberHeadExtension],
  style: 'default',
  tooltip: 'The block being made. What it does goes underneath.',
  generator: {
    javascript: () => '',
  },
});
