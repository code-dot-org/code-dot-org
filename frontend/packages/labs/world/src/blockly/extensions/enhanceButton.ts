// The wand on `define actor`: give this actor something it does not have yet.
//
// The third of the buttons that ride on a block — the eye opens the file a
// block comes from, the mortarboard opens the lesson it was met in, and this
// one opens the enhancement shelf for the actor whose file is on screen
// (specs/ENHANCEMENTS.md). It shares every mechanical detail with the two of
// them: added and removed rather than shown and hidden, not serialized, and
// opened after the click rather than during it.
//
// IT IS ON THE DEFINITION, which is where "this actor" is a thing rather than a
// reference. Enhancing is done TO an actor, and the row menu in the tab bar was
// the first place to say so; this is the second, and the nearer one — a learner
// looking at an actor's blocks and wanting it to have health is already
// pointing at the actor.
//
// ONLY IN AN ACTOR'S OWN FILE. A world's `define actor` defines an actor the
// world keeps to itself, with no file of its own, and every edit an enhancement
// makes lands in a file (`actors/enhance/health`). The workspace knows which
// it is, because the editor told it (`blockly/editingRule`), so the button is
// simply not built where it could not work — the same answer `add actor ⟨as⟩`
// gives to a choice that has nothing to mean.
//
// IT IS NOT OFFERED ON A READ-ONLY WORKSPACE, and that is where it parts
// company with the eye and the cap. Those two READ — a version being previewed
// can still be looked into. This one writes.

import type {Block, BlockSvg, Input, WorkspaceSvg} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';
import {FieldButton} from '@code-dot-org/blockly/fields/fieldButton';

import {requestActorEnhance} from '../../actors/enhance/actorEnhance';
import {editingActorModule} from '../editingRule';

import {addOnChange} from './onChange';

export const ENHANCE_BUTTON_EXTENSION = 'world_enhance_button';

/** The field's name on the block — how it is found again to remove it. */
const FIELD_NAME = 'ENHANCE';

/**
 * FontAwesome's wand, drawn as an SVG glyph like the eye beside it.
 *
 * `wand-magic` (f0d0), which is the icon the file menus already put on
 * `Enhance…` — one act, one picture, wherever it is offered from.
 */
const WAND = '';

/** What a block would have to be for the wand to mean anything. */
export interface EnhanceContext {
  /** The `.actor` this workspace is editing, if it is editing one. */
  module?: string;
  /** Whether the block is a preview in a flyout rather than in the file. */
  flyout: boolean;
  /** Whether the workspace can be edited at all. */
  readOnly: boolean;
}

/**
 * Whether this `define actor` gets a wand.
 *
 * Exported for its test, as `rulesButton`'s wording is: the rest of this
 * module needs a workspace with the whole palette registered to say anything,
 * and what can be wrong on its own is which blocks are offered the button.
 */
export function offersEnhancing(context: EnhanceContext): boolean {
  return Boolean(context.module) && !context.flyout && !context.readOnly;
}

/** The wand glyph, as the `<tspan>` `FieldButton` draws inside itself. */
function wandIcon(): SVGElement {
  const icon = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'tspan',
  ) as SVGElement;
  // The lab injects FontAwesome 6 (`@code-dot-org/fonts`); the block is SVG, so
  // the icon is a glyph in that font rather than an `<i>` element.
  icon.style.fontFamily = '"Font Awesome 6 Pro", "FontAwesome"';
  icon.textContent = WAND;
  return icon;
}

/** What this workspace and block are, in the terms the decision is made in. */
function contextOf(block: Block): EnhanceContext {
  const workspace = block.workspace as WorkspaceSvg | undefined;
  return {
    module: editingActorModule(block),
    flyout: Boolean(workspace?.isFlyout),
    readOnly: Boolean(workspace?.options?.readOnly),
  };
}

/** The input the button rides on: the last one, after the name. */
function lastInput(block: Block): Input | undefined {
  return block.inputList[block.inputList.length - 1];
}

/** Add or remove the button so it matches what this workspace is editing. */
function syncButton(block: Block): void {
  const wanted = offersEnhancing(contextOf(block));
  const present = block.getField(FIELD_NAME) !== null;
  if (wanted === present) {
    return;
  }
  const input = lastInput(block);
  if (!input) {
    return;
  }
  if (!wanted) {
    input.removeField(FIELD_NAME);
    (block as BlockSvg).render?.();
    return;
  }
  input.appendField(
    new FieldButton({
      value: '',
      onClick: () => {
        const module = editingActorModule(block);
        if (!module) {
          return;
        }
        // After this click is finished with, not during it. An enhancement
        // rewrites the file and the lab re-seeds this workspace from it
        // (SourcesContext), which is a reload underneath a Blockly gesture that
        // has not finished — the same reason the eye opens its file on a
        // timeout.
        setTimeout(
          () =>
            requestActorEnhance({
              // The module path, which is what an enhancement patches and what
              // an actor dropdown holds — `actors/player`.
              path: module,
              // What the file calls itself, which is what the dialog's title
              // says. Read at click time: the field is editable, and the name
              // on screen is the one the learner means.
              name: String(block.getFieldValue('NAME') ?? '').trim() || module,
            }),
          0,
        );
      },
      icon: wandIcon(),
    }),
    FIELD_NAME,
  );
  const field = block.getField(FIELD_NAME);
  field?.setTooltip('Give this actor something it does not have yet');
  // NOT saved, and not editable — see the note on the eye
  // (extensions/openSourceButton), which cost two Blockly warnings to work out.
  if (field) {
    field.SERIALIZABLE = false;
    field.EDITABLE = false;
  }
  (block as BlockSvg).render?.();
}

/**
 * Keep the wand in step with what the workspace is editing.
 *
 * Per block instance, like the eye: whether there is anything to enhance is a
 * fact about the workspace this block was loaded into, and a `define actor`
 * dragged out of a flyout is loaded into a different one from the block it was
 * previewed as.
 */
export const enhanceButtonExtension: Extension = defineExtension(
  ENHANCE_BUTTON_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      syncButton(block);
      addOnChange(block, event => {
        // FINISHED_LOADING, because a block deserialized before the editor
        // tagged the workspace with the file it is editing asks again once it
        // has.
        if (event.type === Blockly.Events.FINISHED_LOADING) {
          syncButton(block);
        }
      });
    },
  },
);
