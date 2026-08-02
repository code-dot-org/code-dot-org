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

/**
 * A `FieldButton` that is only its icon.
 *
 * `FieldButton` prints its value beside the icon, and for an empty value prints
 * a non-breaking space instead — which is text, and takes text's width: the eye
 * ended up a space-width right of the middle of its own button. There is nothing
 * to say here that the icon does not, so it says nothing.
 */
class IconButton extends FieldButton {
  override getDisplayText_(): string {
    return '';
  }

  /**
   * Size the button to the icon it actually draws.
   *
   * Blockly measures a field's text with the BLOCK's font (a canvas
   * measurement, for speed), and the icon is a FontAwesome character in a
   * `<tspan>` — a character the block's font does not have. The guess came back
   * narrower than the glyph, so the button was drawn too small for its own icon
   * and the eye hung over the right edge. `getComputedTextLength` asks the
   * rendered text how wide it is instead; the rest mirrors Blockly's own
   * `updateSize_` exactly.
   */
  override updateSize_(margin?: number): void {
    const constants = this.getConstants();
    const pad =
      margin ??
      (this.borderRect_ ? (constants?.FIELD_BORDER_RECT_X_PADDING ?? 0) : 0);
    const width = this.textElement_?.getComputedTextLength() ?? 0;
    const height = this.borderRect_
      ? Math.max(
          constants?.FIELD_TEXT_HEIGHT ?? 0,
          constants?.FIELD_BORDER_RECT_HEIGHT ?? 0,
        )
      : (constants?.FIELD_TEXT_HEIGHT ?? 0);
    this.size_ = new Blockly.utils.Size(pad * 2 + width, height);
    this.positionTextElement_(pad, width);
    this.positionBorderRect_();
  }

  /**
   * Measure again once the icon font has arrived.
   *
   * A first render can happen before FontAwesome has loaded, and then the
   * measurement above is of the fallback glyph — a button sized for a character
   * that is about to be replaced by a different one.
   */
  override initView(): void {
    super.initView();
    void document.fonts?.ready.then(() => {
      if (this.getSourceBlock()) {
        this.forceRerender();
      }
    });
  }
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
      new IconButton({
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
      block.setOnChange(event => {
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
