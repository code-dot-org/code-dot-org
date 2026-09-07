// The sparkles on `define actor` and on `define world`: give this thing
// something it does not have yet.
//
// The third of the buttons that ride on a block — the eye opens the file a
// block comes from, the mortarboard opens the lesson it was met in, and this
// one opens the enhancement shelf for the actor whose file is on screen
// (specs/ENHANCEMENTS.md). It shares every mechanical detail with the two of
// them: added and removed rather than shown and hidden, not serialized, and
// opened after the click rather than during it.
//
// IT IS ON THE DEFINITION, which is where a thing is itself rather than a
// reference to itself. Enhancing is done TO something, and the row menu in the
// tab bar was the first place to say so; this is the nearer one — a learner
// looking at an actor's blocks and wanting it to have health is already
// pointing at the actor.
//
// AND ON THE WORLD, because not every enhancement is an actor's. A camera that
// follows an actor is defined in a world and looked through by a world; the
// actor appears in it as a value. The shelf shows what suits whichever was
// clicked (`actors/enhance/enhancements`).
//
// IT KNOWS WHICH ACTOR EITHER WAY. An actor with a file of its own is named by
// that file, which the workspace was told when it opened; an actor a WORLD
// defines for itself has no file, and is named by the world plus this block —
// the same address `add actor` and `any ⟨kind⟩` use for one
// (`blockly/localActors`). The enhancement takes both
// (specs/ENHANCEMENTS.md), so the button is built for both.
//
// What it is NOT built on is a workspace that is neither — a `.rule`, a
// flyout preview — where there is no actor for it to be about.
//
// IT IS NOT OFFERED ON A READ-ONLY WORKSPACE, and that is where it parts
// company with the eye and the cap. Those two READ — a version being previewed
// can still be looked into. This one writes.

import type {Block, BlockSvg, Input, WorkspaceSvg} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';
import {FieldButton} from '@code-dot-org/blockly/fields/fieldButton';

import {requestActorEnhance} from '../../actors/enhance/actorEnhance';
import type {EnhanceTarget} from '../../actors/enhance/enhancements';
import {editingActorModule, editingFileModule} from '../editingRule';
import {definesWorld} from '../localActors';

import {glyphIcon} from './glyphIcon';
import {addOnChange} from './onChange';

export const ENHANCE_BUTTON_EXTENSION = 'world_enhance_button';

/** The field's name on the block — how it is found again to remove it. */
const FIELD_NAME = 'ENHANCE';

/**
 * FontAwesome's sparkles, drawn as an SVG glyph like the eye beside it.
 *
 * `sparkles` (f890): three four-pointed twinkles and no wand. The wand was the
 * first thing tried and it is the wrong picture twice over — `wand-sparkles`
 * is already the EFFECT file's icon (`config.ts`), and two wands a glyph apart
 * meaning two different things is worse than one plain one. What is being said
 * here is "something appears", not "something is cast".
 *
 * PRO ONLY, which is why there are two of them. A free build has no f890 and
 * would draw an empty box; `burst` (e4dc) is Free's nearest twinkle, an
 * eight-pointed star with drawn-out points, and `freeIconShims` stands the
 * same pair in for the menu icon so both places agree. See `glyphIcon` on why
 * the substitution has to be made by the caller here.
 */
const SPARKLES = '';
const SPARKLES_FREE = '';

/** What a block would have to be for the button to mean anything. */
export interface EnhanceContext {
  /** The `.actor` this workspace is editing, if it is editing one. */
  actorModule?: string;
  /** The file it is editing, whatever kind — the world, for a world's actor. */
  fileModule?: string;
  /** Whether that file defines a world, which is what makes this block local. */
  world: boolean;
  /** This `define actor` block's own id, which names a world-local actor. */
  blockId: string;
  /** Which definition this block IS — the button rides on both. */
  defines: 'actor' | 'world';
  /** What the block calls the actor, which is what the dialog's title says. */
  name: string;
  /** Whether the block is a preview in a flyout rather than in the file. */
  flyout: boolean;
  /** Whether the workspace can be edited at all. */
  readOnly: boolean;
}

/**
 * Which actor this `define actor` is about, or none — in which case no button.
 *
 * Exported for its test, as `rulesButton`'s wording is: the rest of this
 * module needs a workspace with the whole palette registered to say anything,
 * and what can be wrong on its own is which blocks are offered the button and
 * what they would be pointed at.
 */
export function enhanceTarget(
  context: EnhanceContext,
): EnhanceTarget | undefined {
  if (context.flyout || context.readOnly) {
    return undefined;
  }
  if (context.defines === 'world') {
    // The world itself, named by its file: what a world enhancement writes
    // into is the world, and there is one per file.
    return context.fileModule
      ? {kind: 'world', path: context.fileModule, name: context.name}
      : undefined;
  }
  if (context.actorModule) {
    return {kind: 'actor', path: context.actorModule, name: context.name};
  }
  if (context.world && context.fileModule) {
    return {
      kind: 'actor',
      path: context.fileModule,
      block: context.blockId,
      name: context.name,
    };
  }
  return undefined;
}

/** What this workspace and block are, in the terms the decision is made in. */
function contextOf(block: Block): EnhanceContext {
  const workspace = block.workspace as WorkspaceSvg | undefined;
  return {
    actorModule: editingActorModule(block),
    fileModule: editingFileModule(block),
    world: definesWorld(workspace),
    blockId: block.id,
    defines: block.type === 'world_world' ? 'world' : 'actor',
    // Read at click time as well as here: the field is editable, and the name
    // on screen is the one the learner means.
    name: String(block.getFieldValue('NAME') ?? '').trim(),
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
  const wanted = Boolean(enhanceTarget(contextOf(block)));
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
        const target = enhanceTarget(contextOf(block));
        if (!target) {
          return;
        }
        // After this click is finished with, not during it. An enhancement
        // rewrites the file and the lab re-seeds this workspace from it
        // (SourcesContext), which is a reload underneath a Blockly gesture that
        // has not finished — the same reason the eye opens its file on a
        // timeout.
        setTimeout(
          () =>
            requestActorEnhance({...target, name: target.name || target.path}),
          0,
        );
      },
      icon: glyphIcon(SPARKLES, SPARKLES_FREE),
    }),
    FIELD_NAME,
  );
  const field = block.getField(FIELD_NAME);
  field?.setTooltip('Give this something it does not have yet');
  // NOT saved, and not editable — see the note on the eye
  // (extensions/openSourceButton), which cost two Blockly warnings to work out.
  if (field) {
    field.SERIALIZABLE = false;
    field.EDITABLE = false;
  }
  (block as BlockSvg).render?.();
}

/**
 * Keep the button in step with what the workspace is editing.
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
