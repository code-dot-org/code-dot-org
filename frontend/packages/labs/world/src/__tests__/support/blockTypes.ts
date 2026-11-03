// Every block type a saved workspace names.
//
// A `.rule`, `.actor` or `.world` is a serialized Blockly workspace naming
// block types as strings, and nothing in the type system connects those
// strings to the blocks that define them. Two guards walk files this way and
// ask the palette about what they find: `blockly/__tests__/shippedBlocks` for
// the starter project, `actors/enhance/__tests__/paletteGuard` for what every
// row on the enhancement shelf writes.

import {
  isActorData,
  writeEffect,
  writeValue,
  type ActorData,
} from '../../actors/actorData';
import {isRuleData, ruleBodies} from '../../rules/ruleData';

/** A saved block, as much of one as a walk needs to see. */
interface SavedBlock {
  type?: string;
  inputs?: Record<string, {block?: SavedBlock; shadow?: SavedBlock}>;
  next?: {block?: SavedBlock; shadow?: SavedBlock};
}

/**
 * Every block type a workspace names, in the order they are met.
 *
 * Walks the block tree specifically rather than every `type` key in the JSON:
 * a parameter's type is `type` too (`enum:Engine#Key`, `vector`), and so is a
 * variable's, and neither is a block. Contents that are not a workspace at
 * all — an image, a map — walk as nothing. An actor's data names blocks in
 * its code, its values' setters, its effects and its blocks' bodies; a
 * rule's, in its bodies.
 */
export function typesIn(contents: string): string[] {
  let parsed: {blocks?: {blocks?: SavedBlock[]}};
  try {
    parsed = JSON.parse(contents);
  } catch {
    return [];
  }
  const found: string[] = [];
  const visit = (block: SavedBlock | undefined): void => {
    if (!block) {
      return;
    }
    if (block.type) {
      found.push(block.type);
    }
    for (const input of Object.values(block.inputs ?? {})) {
      visit(input.block);
      visit(input.shadow);
    }
    visit(block.next?.block);
    visit(block.next?.shadow);
  };
  if (isActorData(parsed)) {
    const data: ActorData = parsed;
    [
      ...((data.blocks?.blocks?.blocks ?? []) as SavedBlock[]),
      ...(data.values ?? []).map(writeValue),
      ...(data.effects ?? []).map(writeEffect),
      ...(data.members ?? []).flatMap(one => (one.body ? [one.body] : [])),
    ].forEach(block => visit(block as SavedBlock));
    return found;
  }
  // …and a rule in the bodies of its blocks and steps.
  if (isRuleData(parsed)) {
    ruleBodies(parsed).forEach(block => visit(block as SavedBlock));
    return found;
  }
  (parsed.blocks?.blocks ?? []).forEach(visit);
  return found;
}
