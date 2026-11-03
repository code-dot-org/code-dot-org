// What kind of file a Blockly file is, and what it may therefore contain.
//
// A project's Blockly files come in kinds, and the kind is in the name:
// `.actor`, `.rule`, `.map`, `.screen`. Two very different things need to agree about it
// — the palette, which decides what blocks a learner may put in the file, and
// the generator, which decides what module the file compiles to. When they
// disagree, a file is offered a block that then changes what the file IS. So
// both ask here.

/** Which kind of file this is. */
export type FileKind = 'actor' | 'rule' | 'map' | 'placement' | 'screen';

/**
 * A Blockly file's kind, from its path — the one place the extensions are read.
 *
 * `undefined` for anything else, which in the running lab means a file that is
 * not Blockly-authored at all. The generator is also handed `undefined` by
 * callers with no path (tests), and treats it as "work it out from the blocks".
 */
export const fileKindOf = (path?: string): FileKind | undefined => {
  const match = /\.(rule|actor|map|screen)$/.exec(path ?? '');
  return match ? (match[1] as FileKind) : undefined;
};

/**
 * The two kinds a `.map` holds, and one of them is no file.
 *
 * A `.map` is JSON with a workspace on each placement and one for the map
 * itself (specs/MAP_FIRST.md, "The file"). The map's own workspace is kind
 * `map`: it declares events and hears the map load and unload. A
 * placement's is kind `placement`: an actor file's shape for one placed
 * instance, so it takes the kind's events with `this actor` as subject and
 * none of the definition rows. `fileKindOf` never answers `placement`; the
 * editor and the generator name it when they open one.
 */
export const isMapKind = (kind: FileKind | undefined): boolean =>
  kind === 'map' || kind === 'placement';

/**
 * The DEFINITION roots, and which kinds of file may hold one.
 *
 * A root here is not merely useless in the wrong file — it changes what the
 * file IS, so it is both kept out of the palette and refused by the generator.
 *
 * `world_actor` belongs to an `.actor` file alone; every actor is a file.
 *
 *
 * A type absent from this map is offered everywhere. Most blocks are neither
 * roots nor file-bound.
 */
export const ROOT_HOMES: ReadonlyMap<string, ReadonlySet<FileKind>> = new Map([
  ['world_actor', new Set<FileKind>(['actor'])],
  // A map's own blocks (specs/MAP_FIRST.md): naming another placement and
  // unloading the map belong to the map and its placements; hearing the map
  // load and unload belongs to the map's own workspace alone.
  // …and the root a map's workspace opens with, which every other Blockly
  // file kind already had (specs/MAP_EVENTS_PLAN.md).
  ['world_map', new Set<FileKind>(['map'])],
  ['world_placement', new Set<FileKind>(['map', 'placement'])],
  ['world_unload_this_map', new Set<FileKind>(['map', 'placement'])],
  // A layer's name is its map's, so a block naming one is the map's too.
  ['world_all_actors_in_layer', new Set<FileKind>(['map', 'placement'])],
  ['world_is_in_layer', new Set<FileKind>(['map', 'placement'])],
  ['world_on_map_loads', new Set<FileKind>(['map'])],
  ['world_on_map_unloads', new Set<FileKind>(['map'])],
  ['world_on_screen_loads', new Set<FileKind>(['screen'])],
]);

/**
 * The roots that DEFINE what a file is, and how each reads in the error.
 *
 * One in the wrong kind of file is refused rather than compiled: a `define
 * map` in an actor is not an actor with something extra in it, it is a file
 * that cannot be what its name says. `define actor` joined the list when
 * every actor became a file — until then a world could hold one, and before
 * that "actor" was the shape a file fell back to, so it never had a wrong
 * home to be refused in. The rest of the definition blocks are inert out of
 * place and stay that way (`ROOT_HOMES`).
 */
const DEFINING_ROOTS: ReadonlyMap<string, string> = new Map([
  ['world_actor', 'define actor'],
  ['world_map', 'define map'],
]);

/** Which module a file's blocks are assembled into. */
export type ModuleShape = FileKind;

/**
 * What a file compiles to — and a refusal if a block would decide that instead
 * of the file's own name.
 *
 * Generation used to pick the shape by looking for defining roots, so a
 * `define world` dragged into an `.actor` did not fail: it compiled that
 * actor into a world, and the actor stopped existing. Nothing
 * said so. The complaint surfaced wherever something later tried to place the
 * actor, which is nowhere near the mistake, and reads as the world being
 * broken rather than one block being in the wrong file.
 *
 * So the file's extension decides, and a defining root that disagrees with it
 * is an error rather than a redirection. With no path there is nothing to go
 * on, and the blocks are an actor's.
 *
 * @throws if a defining root is in a file whose kind is not its home.
 */
export function moduleShape(
  path: string | undefined,
  topBlockTypes: readonly string[],
): ModuleShape {
  const kind = fileKindOf(path);
  if (!kind) {
    return 'actor';
  }
  for (const type of topBlockTypes) {
    const says = DEFINING_ROOTS.get(type);
    if (says && !ROOT_HOMES.get(type)?.has(kind)) {
      const home = [...(ROOT_HOMES.get(type) ?? [])][0];
      throw new Error(
        `${path}: a "${says}" block can only be in a .${home} file, and this ` +
          `is a .${kind}. Move it there, or delete it.`,
      );
    }
  }
  return kind;
}
