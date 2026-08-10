// The eye on a `use rule` / `use trait` block: open the file that defines it.
//
// A block that names a rule is a block that names a FILE, when the rule is the
// project's own — and until now the only route from one to the other was
// knowing that rules live under `rules/` and guessing which file. The button
// removes the guess. It appears on the right of the block, after the dropdown,
// and only when there is something to open (see `openModule`): a built-in rule's
// implementation is engine code the project does not have, and a level can turn
// the whole affordance off.
//
// It is added and removed rather than shown and hidden, because a hidden field
// still occupies its row: Blockly lays a block out from the fields it has.

import type {Block, BlockSvg, Input} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';
import {FieldButton} from '@code-dot-org/blockly/fields/fieldButton';

import {translate} from '../../effect/localization';
import {canOpenModule, openModule} from '../openModule';
import {refFromValue, refModule, ruleLocation} from '../ruleRegistry';

import {addOnChange} from './onChange';

export const OPEN_SOURCE_BUTTON_EXTENSION = 'world_open_source_button';

/** The field's name on the block — how it is found again to remove it. */
const FIELD_NAME = 'OPEN_SOURCE';

/** FontAwesome's eye, drawn as an SVG glyph the way CDO's own fields do it. */
const EYE = '';

/**
 * The module a `use rule` / `use trait` block names, if it names one.
 *
 * `use rule` holds a rule's NAME, which the registry resolves to the module the
 * rule currently lives in — or, for a hand-written `.js` rule, the module path
 * itself, since a `.js` rule declares no name to be looked up by. `use trait`
 * holds `<RuleName>#<Export>`, which resolves the same way.
 */
export function moduleNamedBy(block: Block): string | undefined {
  const rule = block.getFieldValue('RULE');
  if (typeof rule === 'string' && rule) {
    const located = ruleLocation(rule);
    if (located) {
      return located.source === 'project' ? located.modulePath : undefined;
    }
    // Not a name the registry knows: a `.js` rule, named by its module.
    return rule.includes('/') ? rule : undefined;
  }
  const trait = block.getFieldValue('TRAIT');
  return typeof trait === 'string' && trait
    ? refModule(refFromValue(trait))
    : undefined;
}

/** The eye glyph, as the `<tspan>` `FieldButton` draws inside itself. */
function eyeIcon(): SVGElement {
  const icon = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'tspan',
  ) as SVGElement;
  // The lab injects FontAwesome 6 (`@code-dot-org/fonts`); the block is SVG, so
  // the icon is a glyph in that font rather than an `<i>` element.
  icon.style.fontFamily = '"Font Awesome 6 Pro", "FontAwesome"';
  icon.textContent = EYE;
  return icon;
}

/** The input the button rides on: the last one, after the dropdown. */
function lastInput(block: Block): Input | undefined {
  return block.inputList[block.inputList.length - 1];
}

/** Add or remove the button so it matches what the block currently names. */
function syncButton(block: Block): void {
  const wanted = canOpenModule(moduleNamedBy(block));
  const present = block.getField(FIELD_NAME) !== null;
  if (wanted === present) {
    return;
  }
  const input = lastInput(block);
  if (!input) {
    return;
  }
  if (wanted) {
    input.appendField(
      new FieldButton({
        value: '',
        onClick: () => {
          const modulePath = moduleNamedBy(block);
          if (!modulePath) {
            return;
          }
          // After this click is finished with, not during it. Opening a file
          // swaps the editor — this workspace is disposed — and Blockly is
          // still inside its own gesture and focus handling for the press
          // ("Attempted to focus unregistered node" if it comes back to a
          // workspace that has gone).
          setTimeout(() => openModule(modulePath), 0);
        },
        icon: eyeIcon(),
        // A read-only workspace can still be read — that is all this does.
        allowReadOnlyClick: true,
      }),
      FIELD_NAME,
    );
    const field = block.getField(FIELD_NAME);
    field?.setTooltip(translate('Open the file this comes from'));
    // NOT saved. `FieldButton` sets `SERIALIZABLE = true`, so the eye was
    // written into every file that had one — and read back into blocks that do
    // not, since the button is added and removed by context rather than being
    // part of the block. Blockly then said so, once per block, on every load:
    //   Ignoring non-existant field OPEN_SOURCE in block world_use_rule
    //
    // BOTH flags. Blockly serializes an EDITABLE field whether or not it is
    // marked serializable, warning as it goes ("Detected an editable field that
    // was not serializable … Proceeding with serialization anyway") — so
    // clearing one flag alone trades one warning for another and still writes
    // the field. A button is not editable in the sense the flag means: it has
    // no value a learner sets. Its click runs through `onMouseDown_` and
    // `allowReadOnlyClick`, neither of which consults `EDITABLE`.
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
 * Keep the open button in step with the block's dropdown.
 *
 * Per block instance, because whether there is a file to open is a fact about
 * the value this block holds — "Has Gravity" has one, "Has Space" does not.
 */
export const openSourceButtonExtension: Extension = defineExtension(
  OPEN_SOURCE_BUTTON_EXTENSION,
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
