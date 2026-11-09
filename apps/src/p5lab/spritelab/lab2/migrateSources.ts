// Migrations for project sources saved by an earlier build of this lab.
//
// DELETE THIS FILE once no live project predates the renames below. Nothing
// but the shape of already-saved JSON depends on it: sources are rewritten in
// the current shape on the next save, so each migration only has to survive
// until the projects it covers have been opened once.

import {JsonBlockConfig} from '@cdo/apps/blockly/types';

import {
  LEGACY_WHEN_RUN_BLOCK_TYPE,
  WHEN_RUN_BLOCK_TYPE,
} from './blockly/blockDefinitions/whenRun';
import {forEachSavedBlock} from './savedBlocks';
import {Scene, SerializedAnimationList} from './types';
import {isLegacyWorld, trimLegacyWorld} from './world';

// when_run -> spritelab2_whenRun (2026-08-29): the lab's own hat block.
const RENAMED_BLOCK_TYPES: {[type: string]: string} = {
  [LEGACY_WHEN_RUN_BLOCK_TYPE]: WHEN_RUN_BLOCK_TYPE,
};

// Blocks the lab no longer defines (2026-11): a saved one would load as a
// disabled unknown block and take the blocks stacked under it with it, so
// it is cut out and whatever followed it takes its place.
const REMOVED_BLOCK_TYPES = new Set(['spritelab2_goToExternalScene']);

interface BlockSlot {
  block?: JsonBlockConfig;
  shadow?: JsonBlockConfig;
}

// Cuts removed blocks out of the slot and of everything the block it holds
// contains, in place. Returns whether anything changed.
function dropRemovedBlocks(slot: BlockSlot | undefined): boolean {
  let changed = false;
  while (slot?.block && REMOVED_BLOCK_TYPES.has(slot.block.type)) {
    slot.block = slot.block.next?.block;
    changed = true;
  }
  const block = slot?.block;
  if (!block) {
    return changed;
  }
  Object.values(block.inputs ?? {}).forEach(input => {
    changed = dropRemovedBlocks(input) || changed;
  });
  return dropRemovedBlocks(block.next) || changed;
}

// Renames block types throughout a serialized workspace and cuts out the
// removed ones, in place. Returns whether anything changed.
export function migrateBlockTypes(source: unknown): boolean {
  let changed = false;
  forEachSavedBlock(source, block => {
    const renamed = RENAMED_BLOCK_TYPES[block.type];
    if (renamed) {
      block.type = renamed;
      changed = true;
    }
  });
  const tops = (source as {blocks?: {blocks?: JsonBlockConfig[]}} | undefined)
    ?.blocks?.blocks;
  if (tops) {
    for (let i = tops.length - 1; i >= 0; i--) {
      const top = tops[i];
      const slot: BlockSlot = {block: top};
      if (!dropRemovedBlocks(slot)) {
        continue;
      }
      changed = true;
      if (slot.block) {
        // What followed a removed top block keeps the stack's place.
        tops[i] = {...slot.block, x: top.x, y: top.y};
      } else {
        tops.splice(i, 1);
      }
    }
  }
  return changed;
}

// Until 2026-11 a world was saved as a 30 by 30 grid of which only the
// top-left 10 by 10 was used. Such a grid is cut back to that corner.
function migrateWorld(scene: Scene): boolean {
  if (!isLegacyWorld(scene.world)) {
    return false;
  }
  scene.world = trimLegacyWorld(scene.world);
  return true;
}

/** Applied to a project's scenes on load, in place. */
export function migrateScenes(scenes: Scene[]): boolean {
  return scenes
    .map(scene => [migrateBlockTypes(scene.source), migrateWorld(scene)])
    .flat()
    .some(Boolean);
}

// generation.itemType -> generation.imageType (2026-08-17).
interface LegacyGenerationMetadata {
  itemType?: string;
  imageType?: string;
}

// Applied to the animation list on load, in place: the caller already holds a
// clone. Returns whether anything changed, so a caller can tell a migrated
// project from an untouched one.
export function migrateAnimationList(
  animations?: SerializedAnimationList
): boolean {
  let changed = false;
  for (const props of Object.values(animations?.propsByKey || {})) {
    const generation = props.generation as
      | (typeof props.generation & LegacyGenerationMetadata)
      | undefined;
    if (generation?.itemType && !generation.imageType) {
      generation.imageType =
        generation.itemType as (typeof generation)['imageType'];
      delete generation.itemType;
      changed = true;
    }
  }
  return changed;
}
