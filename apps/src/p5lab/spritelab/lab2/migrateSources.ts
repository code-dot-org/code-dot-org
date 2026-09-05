// Migrations for project sources saved by an earlier build of this lab.
//
// DELETE THIS FILE once no live project predates the renames below. Nothing
// but the shape of already-saved JSON depends on it: sources are rewritten in
// the current shape on the next save, so each migration only has to survive
// until the projects it covers have been opened once. One extra dependent to
// check before deleting: the toolbox editor's lock-stripping relies on the
// when_run rename — cdoBlockSerializer forces deletable=false onto the
// legacy type on every load, which would re-bake the lock the stripping
// removes.

import {
  LEGACY_WHEN_RUN_BLOCK_TYPE,
  WHEN_RUN_BLOCK_TYPE,
} from './blockly/blockDefinitions/whenRun';
import {forEachSavedBlock} from './scenesApi';
import {Scene, SerializedAnimationList} from './types';

// when_run -> spritelab2_whenRun (2026-08-29): the lab's own hat block.
const RENAMED_BLOCK_TYPES: {[type: string]: string} = {
  [LEGACY_WHEN_RUN_BLOCK_TYPE]: WHEN_RUN_BLOCK_TYPE,
};

// Renames block types throughout a serialized workspace, in place. Returns
// whether anything changed.
export function migrateBlockTypes(source: unknown): boolean {
  let changed = false;
  forEachSavedBlock(source, block => {
    const renamed = RENAMED_BLOCK_TYPES[block.type];
    if (renamed) {
      block.type = renamed;
      changed = true;
    }
  });
  return changed;
}

/** Applied to a project's scenes on load, in place. */
export function migrateScenes(scenes: Scene[]): boolean {
  return scenes.map(scene => migrateBlockTypes(scene.source)).some(Boolean);
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
