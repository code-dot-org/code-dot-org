// The rules a world runs, said on the world block — and a way in to change them.
//
// A world runs every rule the project holds (blockly/projectModules), which is
// the right rule and an invisible one: the block that used to carry a row per
// mechanic now carries nothing, and a level that hides the file browser leaves
// a learner with no way to see the answer at all, let alone change it.
//
// So the block says how many, and opens a panel. Two fields, each doing one
// thing: a LABEL that counts, and a BUTTON that opens. The count is the part
// worth having even when nobody clicks — "7 rules" beside a world is a standing
// invitation to wonder which, and the wondering is the point.
//
// Neither is serialized. What the project holds is not a fact about this
// workspace, and writing it into the file would be a number that could go stale
// the moment another file changed. The same reasoning — and the same pair of
// flags, for the same Blockly reasons — as the eye on `use rule`
// (extensions/openSourceButton).

import type {Block, BlockSvg, Input} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';
import {FieldButton} from '@code-dot-org/blockly/fields/fieldButton';

import {translate} from '../../effect/localization';
import {ruleModuleOptions} from '../moduleOptions';
import {requestRulesConfig} from '../rulesConfig';

import {addOnChange} from './onChange';

export const RULES_BUTTON_EXTENSION = 'world_rules_button';

/** The two fields' names on the block — how they are found again to update. */
const COUNT_FIELD = 'RULES_COUNT';
const BUTTON_FIELD = 'RULES_CONFIG';

/** FontAwesome's sliders, drawn as an SVG glyph the way CDO's own fields do. */
const SLIDERS = '';

/** How many rules the project holds, which is how many are in play. */
const ruleCount = (): number => ruleModuleOptions().length;

/**
 * What the label says. Spelled out, because "1 rules" is a bug on screen.
 *
 * Exported for its test: the rest of this module is a Blockly extension, which
 * needs a workspace with the whole palette registered to say anything at all,
 * and the part that can be wrong on its own is the wording.
 */
export function countText(count: number): string {
  if (count === 0) {
    return translate('no rules');
  }
  return count === 1
    ? translate('1 rule')
    : translate('{count} rules', {count});
}

/** The glyph, as the `<tspan>` `FieldButton` draws inside itself. */
function slidersIcon(): SVGElement {
  const icon = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'tspan',
  ) as SVGElement;
  // The lab injects FontAwesome 6 (`@code-dot-org/fonts`); the block is SVG, so
  // the icon is a glyph in that font rather than an `<i>` element.
  icon.style.fontFamily = '"Font Awesome 6 Pro", "FontAwesome"';
  icon.textContent = SLIDERS;
  return icon;
}

/** The input the fields ride on: the last one, after the name. */
function lastInput(block: Block): Input | undefined {
  return block.inputList[block.inputList.length - 1];
}

/** Put the count and the button on the block, once. */
function addFields(block: Block): void {
  const input = lastInput(block);
  if (!input || block.getField(COUNT_FIELD)) {
    return;
  }
  input.appendField(
    new Blockly.FieldLabel(countText(ruleCount())),
    COUNT_FIELD,
  );
  input.appendField(
    new FieldButton({
      value: '',
      onClick: () => {
        // After this click is finished with, not during it — the panel is a
        // React dialog and Blockly is still inside its own gesture and focus
        // handling for the press (the same care the eye takes).
        setTimeout(() => {
          void requestRulesConfig().then(() => syncCount(block));
        }, 0);
      },
      icon: slidersIcon(),
      // Reading which rules are in play is reading, and a read-only workspace
      // can still be read. The panel decides for itself whether it may CHANGE
      // anything (RulesInPlayDialog).
      allowReadOnlyClick: true,
    }),
    BUTTON_FIELD,
  );
  const button = block.getField(BUTTON_FIELD);
  button?.setTooltip(translate('See the rules this world runs'));
  // NOT saved, and not editable — see the note in `openSourceButton`, which
  // learned both of these the hard way. `FieldLabel` is already neither.
  if (button) {
    button.SERIALIZABLE = false;
    button.EDITABLE = false;
  }
}

/** Bring the count up to date with what the project now holds. */
function syncCount(block: Block): void {
  const field = block.getField(COUNT_FIELD);
  if (!field || block.isDisposed()) {
    return;
  }
  const text = countText(ruleCount());
  if (field.getText() !== text) {
    field.setValue(text);
    (block as BlockSvg).render?.();
  }
}

/**
 * Count the rules on a world block, and offer the panel that changes them.
 *
 * The count is refreshed on FINISHED_LOADING as well as at init, and that is
 * not belt and braces: a block is deserialized before the project's registries
 * are filled, so the first answer is "no rules" for every world ever opened.
 */
export const rulesButtonExtension: Extension = defineExtension(
  RULES_BUTTON_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      addFields(block);
      addOnChange(block, event => {
        if (event.type === Blockly.Events.FINISHED_LOADING) {
          syncCount(block);
        }
      });
    },
  },
);
