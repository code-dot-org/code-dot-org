// Every placement in the project that wants a picture of its own.
//
// A `create actor in map` block carries its arrangement as a field value, so
// the placements are in the `.world` file's serialization and can be read
// without a workspace (MAPS.md §2). What comes back is one request per DISTINCT
// placement — `placementKey` is content-derived, so nine coins that override
// nothing are one render and three Labels saying three things are three
// (specs/UI_ACTORS.md).

import type {PlacementRequest} from '../runtime/messages';

import {placementKey, type MapPlacement} from './mapPlacements';

/** A block as it appears in a serialized workspace — only what is read here. */
interface Block {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: Block}>;
  next?: {block?: Block};
}

/** Every block in a file, however deeply nested. */
function* walk(block: Block | undefined): Generator<Block> {
  if (!block) {
    return;
  }
  yield block;
  for (const input of Object.values(block.inputs ?? {})) {
    yield* walk(input.block);
  }
  yield* walk(block.next?.block);
}

/**
 * The placements every `create actor in map` in the project holds.
 *
 * A local actor's ACTOR field stores `local:<block id>`, which is not the type
 * a placed one carries — but it is the key the grid draws by too, so the two
 * agree without either of them resolving it.
 */
export function projectPlacements(
  files: Record<string, string>,
): PlacementRequest[] {
  const seen = new Map<string, PlacementRequest>();
  for (const [path, contents] of Object.entries(files)) {
    if (!path.endsWith('.world')) {
      continue;
    }
    let roots: Block[];
    try {
      const parsed = JSON.parse(contents) as {blocks?: {blocks?: Block[]}};
      roots = parsed.blocks?.blocks ?? [];
    } catch {
      continue; // mid-edit, as everywhere else that reads a workspace
    }
    for (const root of roots) {
      for (const block of walk(root)) {
        if (block.type !== 'world_create_in_map') {
          continue;
        }
        const type = block.fields?.ACTOR;
        const placements = block.fields?.PLACEMENTS;
        if (typeof type !== 'string' || !Array.isArray(placements)) {
          continue;
        }
        for (const placement of placements as MapPlacement[]) {
          // No key means the kind's own picture is the answer — nothing
          // overridden, or nothing but where it stands. Asking for that again
          // would be one more render of a picture already in hand.
          const key = placementKey(type, placement.properties);
          if (key && !seen.has(key)) {
            seen.set(key, {
              key,
              type,
              properties: placement.properties ?? {},
            });
          }
        }
      }
    }
  }
  return [...seen.values()];
}
