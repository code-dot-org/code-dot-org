// The toolbox, drawn like the rest of the lab's navigation.
//
// A category list is a thing you navigate: you click a name and the pane
// beside it changes. The lab already has two of those — the file browser and
// the file tabs (`labs/codebridge`) — and the toolbox looked like neither.
// Blockly's own styling is a gray strip, a browser-default font at 16px, no
// hover, and a selected row painted the renderer's blue.
//
// SO THIS IS CSS AND NOT A CUSTOM TOOLBOX CLASS. Blockly renders the toolbox
// as ordinary DOM with stable class names, and `Blockly.Css.register` puts a
// stylesheet in front of it — which is the whole of what "match the design
// system" means here, because the design system's COMPONENTS are React and
// this is not. What is shared is the tokens and the type scale, which is the
// same bargain `FieldMarkdown` struck for prose on a block.
//
// The stylesheet is registered when this module is LOADED rather than when the
// plugin below is elected, because Blockly's CSS buffer closes at the first
// injection and this lab injects an offscreen workspace at startup. The reason
// is written out where the call is.
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
// THREE RULES CARRY `!important`, and each one beats a style Blockly writes as
// an ATTRIBUTE, which specificity — the ordinary way to win — cannot touch:
//
//   • the strip's background, from the theme's `componentStyles`;
//   • the selected row's background, written when the row is chosen;
//   • the empty icon's `display: inline-block`.
//
// Blockly writes a FOURTH inline style and this deliberately does not fight
// it: the row's start padding is the nesting indent, and overriding it would
// flatten a sub-category into its parent. The horizontal inset is put on the
// row's content container instead, which nothing writes to. That distinction
// is the rule to follow here — a mark is for a value Blockly owns and we are
// replacing, not for one we are only trying to sit beside.
//
// Hover is not marked either: an unselected row carries no background of its
// own, so an ordinary rule already wins.
//
// AND ONE THING HERE IS NOT CSS: the heading that divides the fixed categories
// from the rules. Blockly's toolbox has categories and separators and nothing
// else — a `label` is a FLYOUT item, and there is no toolbox-level equivalent
// — so a heading has to be a toolbox item of its own, registered under
// `registry.Type.TOOLBOX_ITEM`. That is a documented extension point and the
// class is small; the alternative was a separator wearing a word through a
// `::before`, which puts a piece of the interface's text in a stylesheet where
// nothing can translate it.

import {Blockly} from '@code-dot-org/blockly';
import {PluginType, type Plugin} from '@code-dot-org/blockly/plugins';

/**
 * Registered once, and it has to be.
 *
 * A global plugin's `initialize` is called every time the registry is handed
 * the plugin list, which is once per workspace, and registering the same
 * toolbox item twice under one name throws.
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
  border-radius: var(--border-radius, 4px);
  color: var(--text-neutral-primary, #1a1a1a);
  transition: all 0.2s ease-in-out;
}

/* THE HORIZONTAL INSET GOES INSIDE THE ROW, not on it.
 *
 * Blockly writes the row's start padding inline — 'nestedPadding * level', on
 * 'padding-left' or, in RTL, 'padding-right' — which is the indent that shows
 * a sub-category. It is 0px for every category in this lab because they are
 * all top level, and a 'padding-inline' on the row therefore lost its start
 * side to it: the words sat flush against the pill's edge with 4px on the
 * other side only.
 *
 * Padding the CONTENT container instead leaves that indent alone, so nesting
 * still works if a category ever grows children, and needs no '!important'
 * because nothing writes this element's style. The fill is still drawn on the
 * row, so the pill spans the strip and only the words move. */
.blocklyToolbox .blocklyTreeRowContentContainer {
  padding-inline: 10px;
}

/* …and the inset is said in ONE place. Blockly gives the label 3px of its
 * own, which would make the real number 13 and the next person's arithmetic
 * wrong. */
.blocklyToolbox .blocklyToolboxCategoryLabel {
  padding-inline: 0;
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

/* The heading over the rules. Quieter than a category and not clickable:
 * smaller, upper-case, in the secondary text color, with a rule above it
 * standing in for the space a group break would otherwise need. */
.worldToolboxHeading {
  padding: 14px 10px 4px;
  margin-top: 6px;
  border-top: 1px solid var(--borders-neutral-secondary, #ccc);
  font-family: var(--font-family-main, inherit);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-neutral-secondary, #676767);
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
  /* NOT INTERACTIVE, and this line is what makes that true rather than
   * intended. The toolbox is a focusable tree: a click anywhere inside it that
   * is not handled focuses the tree, and the tree falls through to its first
   * focusable node — so clicking the word "Rules" selected Actor and opened
   * its drawer. Refusing pointer events lets the click land on the strip
   * behind, which does nothing, which is what a heading should do. */
  pointer-events: none;
}

/* …and nothing above the first one, which happens when everything before it
 * has been filtered out (see toolboxFilter). A rule with nothing over it
 * reads as a stray line. */
.blocklyToolboxCategoryGroup > .worldToolboxHeading:first-child {
  border-top: none;
  margin-top: 0;
}
`;

/** The `kind` a heading row declares, and what the item is registered as. */
export const TOOLBOX_HEADING = 'world_heading';

/**
 * One heading, as the toolbox array carries it.
 *
 * `icon` is a FontAwesome name, and the point of it is that a learner should
 * only ever have to learn one picture per kind of thing. The scroll over the
 * rules is the scroll on a `.rule` file's tab and in the Rules menu; the masks
 * over the actors are an `.actor`'s. Taken from `worldConfig.fileIcons` at the
 * call site rather than written here, so the two cannot drift apart.
 */
export const toolboxHeading = (text: string, icon?: string) => ({
  kind: TOOLBOX_HEADING,
  name: text,
  icon,
});

/**
 * A row of words in the toolbox that is not a category.
 *
 * EXTENDS `ToolboxItem`, which is Blockly's base for an item that is NOT
 * selectable — `ToolboxSeparator` is the other one, and this is that class with
 * words in it. The first attempt implemented `IToolboxItem` by hand and left
 * out `getClickTarget`, which the toolbox calls on every item it builds: the
 * whole workspace failed to render with `getClickTarget is not a function`, and
 * nothing in the type check said so.
 *
 * `canBeFocused` is false for the same reason the separator's is. A heading is
 * not a stop on the way through the list, and a focus ring on one is a promise
 * that pressing Enter will do something.
 */
class ToolboxHeading extends Blockly.ToolboxItem {
  private element: HTMLDivElement | null = null;

  override init(): void {
    const definition = this.toolboxItemDef_ as {
      name?: string;
      icon?: string;
    } | null;
    const element = document.createElement('div');
    element.className = 'worldToolboxHeading';
    // The icon first, as an `<i>` — the same element and the same class the
    // design system's icon component renders, so the FREE shims reach it
    // (`freeIconShims`). `aria-hidden`, because the word beside it says the
    // same thing and a screen reader should not hear it twice.
    if (definition?.icon) {
      const glyph = document.createElement('i');
      glyph.className = `fa-solid fa-${definition.icon}`;
      glyph.setAttribute('aria-hidden', 'true');
      element.appendChild(glyph);
    }
    element.appendChild(document.createTextNode(definition?.name ?? ''));
    // Announced as decoration rather than as one more item in the tree. The
    // group is `role=tree`, and a div inside one with no role at all is a node
    // a screen reader has to name and cannot.
    element.setAttribute('role', 'presentation');
    this.element = element;
  }

  override getDiv(): HTMLDivElement | null {
    return this.element;
  }

  /** Nothing to click. The toolbox asks every item, and null is a real answer. */
  override getClickTarget(): Element | null {
    return null;
  }

  override isSelectable(): boolean {
    return false;
  }

  override isCollapsible(): boolean {
    return false;
  }

  /** Not a stop on the way through the list. */
  canBeFocused(): boolean {
    return false;
  }

  override dispose(): void {
    this.element?.remove();
    this.element = null;
  }
}

// AT IMPORT, AND NOT FROM THE PLUGIN BELOW.
//
// `Blockly.Css.register` appends to a buffer that Blockly turns into a single
// `<style id="blockly-common-style">` the FIRST time it injects a workspace
// into a given document, and never looks at again. Anything registered after
// that first injection is text nobody reads.
//
// The plugin's `initialize` runs when a workspace that lists it is built, which
// is when a `.rule` / `.actor` / `.world` file is opened — and by then the
// lab has already injected a workspace: `BlocklyGenerator` mounts an offscreen
// one for code generation as soon as the lab loads, whatever file the learner
// happens to be looking at. Open the lab on a Blockly file and the two arrive
// close enough together that the styling landed; open it on the map editor,
// then click through to a rule, and the toolbox came up in Blockly's own gray.
//
// So the registration happens when this module is loaded, which `config.ts`
// does at app load through `BlocklyFileEditor` — before anything can inject.
// The plugin still elects the HEADING, which is a registry entry and has no
// such deadline.
Blockly.Css.register(TOOLBOX_CSS);

/**
 * Draw the toolbox with the design system's tokens.
 *
 * A global plugin: it registers the heading item and owns nothing per
 * workspace, so there is nothing to tear down. The stylesheet is not its to
 * register — see above.
 */
export const DesignSystemToolboxPlugin: Plugin = {
  type: PluginType.Global,
  initialize: () => {
    if (registered) {
      return;
    }
    registered = true;
    // `true` to overwrite: a second lab electing this plugin in the same page
    // would otherwise throw on the duplicate name, and the class is the same
    // class.
    Blockly.registry.register(
      Blockly.registry.Type.TOOLBOX_ITEM,
      TOOLBOX_HEADING,
      ToolboxHeading,
      true,
    );
  },
};
