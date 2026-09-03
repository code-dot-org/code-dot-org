// The mortarboard beside the eye: open the lesson that taught this.
//
// `use trait ⟨Affected by Gravity⟩` is a block a learner met in a lesson, and
// four weeks later it is a phrase on a block with no way back to where it was
// explained. The eye next to it opens the rule's FILE, which answers "how is
// this implemented"; this answers the other question, "what was this for", and
// they are not the same question — a learner stuck on a trait is usually asking
// the second.
//
// Written as a sibling of `openSourceButton` rather than folded into it, and
// the two share every mechanical detail: added and removed rather than shown
// and hidden (a hidden field still takes its row), not serialized (see the note
// there, which cost two Blockly warnings to work out), and opened after the
// click rather than during it.

import type {Block, BlockSvg, Input} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';
import {FieldButton} from '@code-dot-org/blockly/fields/fieldButton';

import {lessonFor, openLesson} from '../../progression/lessonSeam';
import type {UnlockTarget} from '../../progression/types';
import {stockRuleByName} from '../../rules/stock';
import {refFromValue} from '../ruleRegistry';

import {glyphIcon} from './glyphIcon';
import {addOnChange} from './onChange';

export const LESSON_BUTTON_EXTENSION = 'world_lesson_button';

/** The field's name on the block — how it is found again to remove it. */
const FIELD_NAME = 'LESSON';

/**
 * FontAwesome's graduation cap, drawn as an SVG glyph like the eye beside it.
 *
 * `graduation-cap` (f19d). In the FREE package as well as the pro one, which
 * is what makes it safe here — see `glyphIcon` on why naming the family is
 * not enough on its own.
 */
const CAP = '';

/**
 * What this block names, in the terms the progression grants things in.
 *
 * By NAME rather than by file. A tile grants the stock rule `gravity`, and the
 * project's copy of it is whatever the learner called the file — `use rule`
 * holds the rule's declared name, which survives a rename of the file it lives
 * in, and that is the thing to look up.
 */
export function unlockNamedBy(block: Block): UnlockTarget | undefined {
  const named = (ruleName: string | null | undefined) => {
    const stock = ruleName ? stockRuleByName(ruleName) : undefined;
    return stock ? ({kind: 'rule', id: stock.id} as const) : undefined;
  };

  const rule = block.getFieldValue('RULE');
  if (typeof rule === 'string' && rule && !rule.includes('/')) {
    return named(rule);
  }
  const trait = block.getFieldValue('TRAIT');
  if (typeof trait === 'string' && trait) {
    return named(refFromValue(trait).ruleName);
  }
  // `add actor ⟨actors/coin⟩` — an actor is granted by its own id, which is the
  // stem of the file the import wrote.
  const actor = block.getFieldValue('ACTOR');
  if (typeof actor === 'string' && actor.startsWith('actors/')) {
    return {kind: 'actor', id: actor.slice('actors/'.length)};
  }
  return undefined;
}

/** The input the button rides on: the last one, after the dropdown. */
function lastInput(block: Block): Input | undefined {
  return block.inputList[block.inputList.length - 1];
}

/** The tile this block's value was taught by, if any and if one can be opened. */
function tileFor(block: Block): string | undefined {
  const unlock = unlockNamedBy(block);
  return unlock ? lessonFor(unlock) : undefined;
}

/** Add or remove the button so it matches what the block currently names. */
function syncButton(block: Block): void {
  const tile = tileFor(block);
  const present = block.getField(FIELD_NAME) !== null;
  if (Boolean(tile) === present) {
    return;
  }
  const input = lastInput(block);
  if (!input) {
    return;
  }
  if (tile) {
    input.appendField(
      new FieldButton({
        value: '',
        onClick: () => {
          const open = tileFor(block);
          if (open) {
            // After the click, not during it: opening the map takes focus, and
            // Blockly is still inside its own gesture handling for the press.
            setTimeout(() => openLesson(open), 0);
          }
        },
        icon: glyphIcon(CAP),
        allowReadOnlyClick: true,
      }),
      FIELD_NAME,
    );
    const field = block.getField(FIELD_NAME);
    field?.setTooltip('Open the lesson this comes from');
    // Both flags, for the reasons written out beside the eye: a serializable
    // field is written into files that should not have it, and an editable one
    // is serialized anyway with a different warning.
    if (field) {
      field.SERIALIZABLE = false;
      field.EDITABLE = false;
    }
  } else {
    input.removeField(FIELD_NAME);
  }
  (block as BlockSvg).render?.();
}

/**
 * Keep the lesson button in step with the block's dropdown.
 *
 * Per block instance, because whether there is a lesson is a fact about the
 * value this block holds: "Has Gravity" has one, a rule the learner wrote does
 * not.
 */
export const lessonButtonExtension: Extension = defineExtension(
  LESSON_BUTTON_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      syncButton(block);
      addOnChange(block, event => {
        // The value changing is the obvious one; FINISHED_LOADING is the other:
        // a block deserialized before the project's registries were filled asks
        // again once they are.
        const change = event as Blockly.Events.BlockChange;
        const mine =
          event.type === Blockly.Events.BLOCK_CHANGE &&
          change.blockId === block.id &&
          change.element === 'field';
        if (mine || event.type === Blockly.Events.FINISHED_LOADING) {
          syncButton(block);
        }
      });
    },
  },
);
