// Which layer a placed actor is drawn in (specs/VIEWPORT.md).
//
// A layer OWNS ITS CONTENTS: `define layer` has a `do` mouth, and a placement
// inside it is placed in it. The layer of a block is therefore its ancestor —
// a fact you can see without scrolling — rather than ambient state a preceding
// block set. That is deliberate: this project guards ambient context rather
// than trusting it (`worldContext`, `runtimeWorld`, and `world_actor_kind`,
// which compiles to two different things depending on its parent), and
// containment says the same thing with nothing to guard.
//
// `within layer` is the reopener, for the one case containment cannot reach:
// adding to a layer declared somewhere else. Innermost wins when they nest.
//
// Layers are referred to by the id of the block that DEFINES them, like a
// world's own actors (`localActors`) and unlike rules, whose names are their
// references and which needed `renameRule` + `renameMemberReferences` to carry
// a rename through. A layer's name is a label; renaming it breaks nothing.

import type {Blockly} from '@code-dot-org/blockly';

import {DEFAULT_LAYER_ID} from '../engine/core/Layer';

import {liveDropdown} from './moduleOptions';

/** Marks a dropdown value as naming a layer defined in this workspace. */
const PREFIX = 'layer:';

export const DEFINE_LAYER = 'world_define_layer';
export const WITHIN_LAYER = 'world_within_layer';

/** The blocks that PLACE actors, and so have to land in some layer. */
export const PLACING_BLOCKS: readonly string[] = [
  'world_add_actor',
  'world_load_map',
  'world_create_in_map',
];

/** What a LAYER dropdown stores for a layer defined in this workspace. */
export const layerValue = (blockId: string): string => `${PREFIX}${blockId}`;

/** The defining block's id, or undefined if this value names no layer. */
export const layerBlockId = (value: string): string | undefined =>
  value.startsWith(PREFIX) ? value.slice(PREFIX.length) : undefined;

/**
 * The engine-side id for a layer defined by a block.
 *
 * Derived from the block id rather than the name, for the reason above, and
 * prefixed so it can never collide with {@link DEFAULT_LAYER_ID}.
 */
export const layerId = (blockId: string): string =>
  `layer_${blockId.replaceAll(/[^A-Za-z0-9_]/g, '')}`;

const workspaceOf = (field?: Blockly.Field): Blockly.Workspace | undefined => {
  const workspace = field?.getSourceBlock()?.workspace as
    | (Blockly.WorkspaceSvg & {targetWorkspace?: Blockly.Workspace})
    | undefined;
  // A field in a flyout belongs to the flyout's workspace — the block there is
  // a preview of one you might drag out — so ask the workspace it would land in.
  return workspace?.isFlyout ? workspace.targetWorkspace : workspace;
};

/** Every layer defined in this workspace, in the order the blocks are in. */
export const layersIn = (
  workspace: Blockly.Workspace | undefined,
): Array<{blockId: string; name: string}> =>
  (workspace?.getAllBlocks(true) ?? [])
    .filter(block => block.type === DEFINE_LAYER)
    .map(block => ({
      blockId: block.id,
      name: String(block.getFieldValue('NAME') ?? ''),
    }));

/** The `[label, value]` rows a LAYER dropdown offers. */
export const layerOptions = (
  field?: Blockly.FieldDropdown,
): Array<[string, string]> => {
  const rows = layersIn(workspaceOf(field)).map(
    ({blockId, name}) =>
      [name || 'Layer', layerValue(blockId)] as [string, string],
  );
  // A dropdown with no options cannot be built, and a world with no `define
  // layer` still has the default — which is the honest thing to offer.
  return rows.length ? rows : [['the main layer', DEFAULT_LAYER_ID]];
};

/**
 * The layer a block places into: its nearest layer ancestor, or the default.
 *
 * Never "no layer". A scene graph with two kinds of actor in it — those in a
 * layer and those in none — would make every question about layers have to
 * invent an answer for the second kind, forever (core/Layer).
 */
export const layerOf = (block: Blockly.Block): string => {
  // SURROUND parent, not parent. In Blockly a block chained BELOW another is
  // that block's child — `getParent()` on a statement returns the statement
  // above it in the same stack. Walking that chain put every block written
  // after a `define layer` into it, however plainly it sat outside the `do`
  // mouth. `getSurroundParent` skips the siblings above and answers with what
  // actually encloses the block, which is the question containment asks.
  //
  // Only `layerOf` wants this. `inBuilderContext` and `inWorldContext` walk
  // ordinary parents on purpose: `define world` has no `do` mouth — its body
  // chains below it — so for those, being next-connected IS being inside.
  //
  // Optional calls, like `actorTarget`'s `getInputTargetBlock?.`: a generator is
  // also run against a plain object in tests, and a block with no parent chain
  // is a block in no layer, which is the default.
  for (
    let parent = block.getSurroundParent?.() ?? null;
    parent;
    parent = parent.getSurroundParent?.() ?? null
  ) {
    if (parent.type === DEFINE_LAYER) {
      return layerId(parent.id);
    }
    if (parent.type === WITHIN_LAYER) {
      const value = String(parent.getFieldValue('LAYER') ?? '');
      const blockId = layerBlockId(value);
      // A `within layer` naming a definition that has since been deleted places
      // into the default rather than into nothing.
      return blockId && parent.workspace.getBlockById(blockId)
        ? layerId(blockId)
        : DEFAULT_LAYER_ID;
    }
  }
  return DEFAULT_LAYER_ID;
};

/**
 * The runtime layer id a LAYER dropdown's value names.
 *
 * Two shapes reach this: a `layer:<blockId>` chosen from the list, and the bare
 * default that {@link layerOptions} offers when a workspace declares no layers.
 * A value naming a definition that has since been deleted resolves to the
 * default, exactly as {@link layerOf} does for a `within layer` — the value
 * outlives the block it names, and answering "no layer" is not an option.
 */
export const layerIdFromValue = (
  block: Blockly.Block,
  value: string,
): string => {
  const blockId = layerBlockId(value);
  // `undefined` means the value is not a layer reference at all — the bare
  // default. An EMPTY id means it is one, naming nothing, which is the deleted
  // case and must not be mistaken for the bare default.
  if (blockId === undefined) {
    return value || DEFAULT_LAYER_ID;
  }
  return blockId && block.workspace?.getBlockById?.(blockId)
    ? layerId(blockId)
    : DEFAULT_LAYER_ID;
};

/** Whether this subtree places anything, not counting nested layers' contents. */
const placesDirectly = (block: Blockly.Block): boolean => {
  if (PLACING_BLOCKS.includes(block.type)) {
    return true;
  }
  if (block.type === DEFINE_LAYER || block.type === WITHIN_LAYER) {
    return false; // its contents belong to that layer, not to this position
  }
  // Optional calls for the same reason `layerOf` uses them: a generator is also
  // run against a plain object in tests, where a block has no children.
  const next = block.getNextBlock?.() ?? null;
  return (block.getChildren?.(false) ?? []).some(
    child => child !== next && placesDirectly(child),
  );
};

/**
 * How a layer responds to the camera drawing it.
 *
 * Two things, and they are genuinely two: a FACTOR, which is how much of the
 * camera's motion the layer takes, and FIXED, which is not a factor at all.
 * `(0, 0)` and fixed look identical until a camera has a zoom — a layer at zero
 * still zooms, a fixed one does not — so the choice is a word and never a
 * number a learner might type by accident.
 *
 * An earlier draft offered five presets instead ("far behind", "in front", …).
 * They were dropped: the factor was made a vector precisely so per-axis control
 * existed, and a closed list of five took it away again. Vertical parallax, a
 * top-down game, a climbing game — none of them were sayable. A preset is a
 * good DEFAULT and a bad vocabulary.
 */
export const LAYER_MOTION_OPTIONS: Array<[string, string]> = [
  ['moves with the camera', 'moves'],
  ['is fixed to the screen', 'fixed'],
];

/**
 * The factor a layer starts with: all of the camera's motion, both axes.
 *
 * The value that makes a new layer behave like the game — which is what a
 * learner adding their first layer almost always means.
 */
export const DEFAULT_PARALLAX = {x: 1, y: 1};

/**
 * One entry of a world's layer stack, as `defineLayer` takes it.
 *
 * An id and nothing else. How a layer responds to the camera is set by a block
 * in its body (`world_layer_motion`), not declared here — it is read every
 * frame and builds nothing, so it is a value rather than part of the structure.
 */
export interface LayerPlanEntry {
  id: string;
}

/**
 * The layers a world declares, in stack order — the argument order for the
 * hoisted `defineLayer` calls.
 *
 * DECLARATION ORDER IS DEPTH, and the default appears WHERE THE FIRST UNPLACED
 * PLACEMENT DOES. That is what makes a Sky declared above it draw behind and an
 * Interface declared below it draw in front, which is the arrangement anyone
 * will want first. Pinning the default to the bottom instead would put every
 * declared layer above it — backwards for a sky — and demanding explicit
 * placement once any layer exists would be a mode switch that breaks every
 * placement already written.
 *
 * Hoisted rather than emitted in place because `defineLayer` must precede the
 * first placement: the first placement builds the World, and a layer cannot be
 * spliced into one that exists (`WorldBuilder.requireUnbuilt`).
 */
export const layerPlan = (worldBlock: Blockly.Block): LayerPlanEntry[] => {
  const plan: LayerPlanEntry[] = [];
  let defaulted = false;
  for (
    let block: Blockly.Block | null = worldBlock.getNextBlock?.() ?? null;
    block;
    block = block.getNextBlock?.() ?? null
  ) {
    if (block.type === DEFINE_LAYER) {
      plan.push({id: layerId(block.id)});
      continue;
    }
    if (!defaulted && placesDirectly(block)) {
      plan.push({id: DEFAULT_LAYER_ID});
      defaulted = true;
    }
  }
  return plan;
};

/**
 * The LAYER dropdown, kept live.
 *
 * Its options come from the workspace's own `define layer` blocks, so a layer
 * added, renamed or deleted is reflected without the block being rebuilt — the
 * same treatment every project-derived dropdown gets (`moduleOptions`).
 */
export const layerOptionsExtension = liveDropdown(
  'world_layer_options',
  'LAYER',
  layerOptions,
);
