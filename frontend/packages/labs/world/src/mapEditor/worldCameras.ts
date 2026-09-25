// The cameras a file declares, read from its blocks without a workspace.
//
// A camera is declared in blocks — `define camera ⟨name⟩ for ⟨…⟩` — in the
// world's own workspace for the world's, and in a Viewport placement's script
// for that Viewport's, where `this actor` is the Viewport
// (specs/SPACE_CAMERAS_PLAN.md). Nothing in the editor said what cameras a
// project had; this is the reader the camera strip lists from, and it is the
// same document walk `worldProperties` does for a world's properties.
//
// READ-ONLY. Adding, removing and renaming a camera are a row spliced into or
// out of a chain, which no writer over these documents does yet (step 9b).

import type {BlocklySerialization} from '@code-dot-org/blockly';

/** A serialized block, as much of one as this walks. */
interface Block {
  type?: string;
  id?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: Block; shadow?: Block}>;
  next?: {block?: Block};
}

/** One declared camera. */
export interface DeclaredCamera {
  /** The block's id, which is what the engine names the camera by. */
  id: string;
  /** What the author called it. */
  name: string;
  /** The traits its `do` mouth elects, as their references (`Rule#Trait`). */
  traits: string[];
}

/**
 * Every block in a workspace, whatever it hangs off.
 *
 * Not only a root's rows: a Viewport's camera sits inside an `on create`
 * hat's mouth, and a world's may sit under `define world` or float. Depth
 * first, in document order, and a shadow is skipped — a shadow is a socket's
 * default, not something an author put there.
 */
function* everyBlock(
  state: BlocklySerialization | undefined,
): Generator<Block> {
  const roots = (state as {blocks?: {blocks?: Block[]}} | undefined)?.blocks
    ?.blocks;
  function* walk(block: Block | undefined): Generator<Block> {
    for (let at = block; at; at = at.next?.block) {
      yield at;
      for (const socket of Object.values(at.inputs ?? {})) {
        yield* walk(socket?.block);
      }
    }
  }
  for (const root of roots ?? []) {
    yield* walk(root);
  }
}

/** Whose a `define camera` says it is: the world's, or `this actor`'s. */
const ownerOf = (block: Block): 'world' | 'this actor' | 'other' => {
  const plugged = block.inputs?.OWNER?.block;
  if (!plugged) {
    return 'world';
  }
  return plugged.type === 'world_this_actor' ? 'this actor' : 'other';
};

const declared = (block: Block): DeclaredCamera => ({
  id: block.id ?? '',
  name: String(block.fields?.NAME ?? 'Camera'),
  traits: [...walkRows(block.inputs?.DO?.block)]
    .filter(row => row.type === 'world_use_trait')
    .map(row => String(row.fields?.TRAIT ?? ''))
    .filter(Boolean),
});

function* walkRows(block: Block | undefined): Generator<Block> {
  for (let at = block; at; at = at.next?.block) {
    yield at;
  }
}

/**
 * The cameras a WORLD declares for itself: every `define camera` in its
 * workspace whose owner socket is empty.
 *
 * One with something plugged in is somebody else's — a Viewport's, declared
 * from the world's blocks by naming it — and is not the world's to list.
 */
export function worldCameras(contents: string): DeclaredCamera[] {
  let state: BlocklySerialization | undefined;
  try {
    state = JSON.parse(contents) as BlocklySerialization;
  } catch {
    return [];
  }
  return [...everyBlock(state)]
    .filter(
      block =>
        block.type === 'world_define_camera' && ownerOf(block) === 'world',
    )
    .map(declared);
}

/**
 * The cameras a PLACEMENT's script declares for itself: every `define camera
 * for ⟨this actor⟩` in it.
 *
 * `this actor` and nothing else, because a placement's script may say
 * `for ⟨any Minimap⟩` and mean a different Viewport, and that camera belongs
 * where it will land, not where it was written.
 */
export function placementCameras(
  blocks: BlocklySerialization | undefined,
): DeclaredCamera[] {
  return [...everyBlock(blocks)]
    .filter(
      block =>
        block.type === 'world_define_camera' && ownerOf(block) === 'this actor',
    )
    .map(declared);
}
