// The toolbox, drawn like the rest of the lab's navigation.
//
// A category list is a thing you navigate: you click a name and the pane
// beside it changes. The lab already has two of those — the file browser and
// the file tabs (`labs/codebridge`) — and the toolbox looked like neither.
// Blockly's own styling is a grey strip, a browser-default font at 16px, no
// hover, and a selected row painted the renderer's blue.
//
// SO THIS IS CSS AND NOT A CUSTOM TOOLBOX CLASS. Blockly renders the toolbox
// as ordinary DOM with stable class names, and `Blockly.Css.register` puts a
// stylesheet in front of it — which is the whole of what "match the design
// system" means here, because the design system's COMPONENTS are React and
// this is not. What is shared is the tokens and the type scale, which is the
// same bargain `FieldMarkdown` struck for prose on a block.
//
// Elected rather than applied: it is a plugin, so a lab that wants Blockly's
// own toolbox keeps it by not listing this one (`BlocklyFileEditor`).
//
// The DOM it styles, which is Blockly's and worth writing down because the
// names are the whole contract:
//
//   .blocklyToolbox                      the strip
//     .blocklyToolboxCategoryGroup       role=tree
//       .blocklyToolboxCategoryContainer role=treeitem
//         .blocklyToolboxCategory        the row that is clicked
//           .blocklyTreeRowContentContainer
//             .blocklyToolboxCategoryIcon    16x16, empty in this lab
//             .blocklyToolboxCategoryLabel   the words
//
// THREE RULES CARRY `!important`, and the list is exact because it is the
// list of things Blockly writes as an INLINE style — which specificity, the
// ordinary way to win, cannot beat:
//
//   • the strip's background, from the theme's `componentStyles`;
//   • the selected row's background, written when the row is chosen;
//   • the empty icon's `display: inline-block`.
//
// Hover is NOT one of them and is not marked: an unselected row carries only
// `padding-left` and `pointer-events` inline, so an ordinary rule wins. A
// fourth mark appearing here means somebody is fighting a stylesheet rather
// than an attribute, and should check which before reaching for it.

import {Blockly} from '@code-dot-org/blockly';
import {PluginType, type Plugin} from '@code-dot-org/blockly/plugins';

/**
 * Registered once, and it has to be.
 *
 * A global plugin's `initialize` is called every time the registry is handed
 * the plugin list, which is once per workspace — and `Blockly.Css.register`
 * appends to a stylesheet that is injected on first use, so calling it twice
 * either duplicates the text or arrives after the injection and does nothing.
 */
let registered = false;

const TOOLBOX_CSS = `
/* The strip. Its background is the file browser's, because it is the same
 * kind of surface: a panel of names beside the thing they open. */
.blocklyToolbox {
  padding-block: 4px;
  font-family: var(--font-family-main, inherit);
  background-color: var(--background-neutral-secondary, #f0f0f0) !important;
}

/* A row, with the file browser's geometry — the same inset, the same corner,
 * the same 14px. 'min-height' rather than 'height': a category whose name
 * wraps should grow rather than clip. */
.blocklyToolbox .blocklyToolboxCategory {
  min-height: 24px;
  box-sizing: border-box;
  margin-inline: 0.375rem;
  margin-bottom: 2px;
  padding-block: 0.125rem;
  padding-inline: 4px;
  border-radius: var(--border-radius, 4px);
  color: var(--text-neutral-primary, #1a1a1a);
  transition: all 0.2s ease-in-out;
}

/* The family is set HERE and not only on the strip. Blockly styles the label
 * directly, so a family left to inherit from the container loses to it and the
 * words came out in the browser's default sans rather than the lab's. */
.blocklyToolbox .blocklyToolboxCategoryLabel {
  font-family: var(--font-family-main, inherit);
  font-size: 14px;
  line-height: 1.5;
  color: inherit;
}

/* Hover, but not on the row already chosen — the same exception the file tabs
 * make, since a hover tint over the selected fill reads as a third state. */
.blocklyToolbox .blocklyToolboxCategory:hover:not(.blocklyToolboxSelected) {
  background-color: var(--background-neutral-tertiary, #e4e4e4);
}

/* Selected: the file tabs' treatment, which is what the lab already means by
 * "this is the one you are looking at". Blockly paints this inline in the
 * renderer's blue, hence the mark. */
.blocklyToolbox .blocklyToolboxSelected {
  background-color: var(--background-brand-teal-primary, #0090a0) !important;
  color: var(--text-neutral-white-fixed, #fff);
  font-weight: 600;
}

.blocklyToolbox .blocklyToolboxSelected .blocklyToolboxCategoryLabel {
  color: var(--text-neutral-white-fixed, #fff);
}

/* Inside the row, so the ring follows the rounded corner rather than the
 * strip's edge. */
.blocklyToolbox .blocklyToolboxCategory:focus-visible {
  outline: var(--borders-brand-teal-primary, #0090a0) solid 2px;
  outline-offset: -2px;
}

/* This lab gives its categories no icons, so the 16px box Blockly leaves for
 * one is 16px of nothing in front of every name. A category that grows an
 * icon should take the space back. */
.blocklyToolbox .blocklyToolboxCategoryIcon:empty {
  display: none !important;
}
`;

/**
 * Draw the toolbox with the design system's tokens.
 *
 * A global plugin: it registers a stylesheet before Blockly is injected and
 * owns nothing per workspace, so there is nothing to tear down.
 */
export const DesignSystemToolboxPlugin: Plugin = {
  type: PluginType.Global,
  initialize: () => {
    if (registered) {
      return;
    }
    registered = true;
    Blockly.Css.register(TOOLBOX_CSS);
  },
};
