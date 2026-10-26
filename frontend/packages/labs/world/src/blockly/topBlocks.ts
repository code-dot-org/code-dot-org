// The top blocks of a Blockly-authored file, whichever shape the file is.
//
// A `.rule`, an `.actor` and a `.world` ARE a workspace serialization, so
// their top blocks are `blocks.blocks`. A `.map` is a DOCUMENT — its size, its
// tile, its placements — that holds a workspace under `blocks`, so its top
// blocks are `blocks.blocks.blocks`, one level further down.
//
// Three callers ask it to find the root a file takes its NAME from: what the
// file calls itself (`projectModules/authoredName`), what it called itself
// before a rename, and where to write the new name (`newThing/renamed`). Each
// walked the first shape only, which is why a `.map` declared no name until
// `define map` gave it one to declare (specs/MAP_EVENTS_PLAN.md). One more asks
// it about a `.world` in particular: where to write a `define event` an
// imported map needs (`maps/declareEvents`).

/** As much of a block as naming and walking need. */
export interface TopBlock {
  type?: string;
  fields?: Record<string, string>;
  next?: {block?: TopBlock};
}

/** A workspace serialization, or a document holding one under `blocks`. */
interface Holder {
  blocks?: {blocks?: TopBlock[] | {blocks?: TopBlock[]}};
}

/**
 * Every top block, or an empty list for a file that has no workspace.
 *
 * Takes the PARSED file rather than its text because callers that write a name
 * back mutate the parse and re-serialize it; handing them the text twice would
 * mean parsing it twice and losing everything the parse is not about.
 */
export const topBlocksOf = (parsed: unknown): TopBlock[] => {
  const held = (parsed as Holder | null)?.blocks?.blocks;
  if (Array.isArray(held)) {
    return held;
  }
  return held?.blocks ?? [];
};

/**
 * The root block types whose NAME field names a Blockly-authored file.
 *
 * Rules among them, which they were not: a `.rule`'s options list fell through
 * to the file's stem, and every caller that wanted "Has Gravity" got it from
 * the rule REGISTRY instead. That is still where a `use rule` dropdown reads
 * it; this is for everything that has only the file (`files/itemName`).
 *
 * A map among them since `define map`: a `.map` used to declare no name at all
 * (specs/MAP_EVENTS_PLAN.md).
 */
const NAMED_ROOTS: readonly string[] = [
  'world_actor',
  'world_world',
  'world_rule',
  'world_map',
];

/**
 * The block a file takes its name from, if it has one.
 *
 * BY TYPE AND NOT BY "the first top block with a NAME field", which is what
 * the callers did while every named root was the only thing in its file. A
 * map's workspace is not: `the ⟨Pause⟩` carries a NAME too, and an orphan of
 * one left above the root would have been read as the map's name — and, on a
 * rename, written to.
 */
export const namedRootOf = (parsed: unknown): TopBlock | undefined =>
  topBlocksOf(parsed).find(block => NAMED_ROOTS.includes(block?.type ?? ''));
