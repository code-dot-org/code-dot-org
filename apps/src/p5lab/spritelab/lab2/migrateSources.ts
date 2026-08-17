// Migrations for project sources saved by an earlier build of this lab.
//
// DELETE THIS FILE once no live project predates the renames below. Nothing
// but the shape of already-saved JSON depends on it: sources are rewritten in
// the current shape on the next save, so each migration only has to survive
// until the projects it covers have been opened once.

import {SerializedAnimationList} from './types';

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
