// What the chosen trait is for, on the tooltip of any block that names one.
//
// A dropdown option cannot carry a tooltip of its own, and a trait's name says
// little on its own: "Slows", "Carries", "Aimed". So the block's tooltip says
// what the block does, as it always did, and then what the trait it holds
// does, from that trait's `define trait` description (ruleMeta,
// `TraitMeta.description`).
//
// A function rather than a string, so it is read when the pointer arrives:
// the field changes, and the rules in play change under it, and neither needs
// telling.

import type {Block} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {traitOfValue} from '../traitOptions';

export const TRAIT_TOOLTIP_EXTENSION = 'world_trait_tooltip';

/** The block's own tooltip, then the chosen trait's description, if any. */
export function traitTooltipText(own: string, value: unknown): string {
  const trait =
    typeof value === 'string' && value ? traitOfValue(value) : undefined;
  if (!trait?.description) {
    return own;
  }
  const said = `${trait.name}: ${trait.description}`;
  return own ? `${own}\n\n${said}` : said;
}

/** A tooltip as Blockly holds one — words, a function, or another's — read. */
function tipText(tip: Block['tooltip']): string {
  if (typeof tip === 'function') {
    return tipText(tip());
  }
  if (typeof tip === 'string') {
    return tip;
  }
  return tip ? tipText(tip.tooltip) : '';
}

export const traitTooltipExtension: Extension = defineExtension(
  TRAIT_TOOLTIP_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      const own = block.tooltip;
      block.setTooltip(() =>
        traitTooltipText(tipText(own), block.getFieldValue('TRAIT')),
      );
    },
  },
);
