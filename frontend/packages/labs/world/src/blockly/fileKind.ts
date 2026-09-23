// What kind of file a Blockly file is, and what it may therefore contain.
//
// A project's Blockly files come in three kinds, and the kind is in the name:
// `.actor`, `.world`, `.rule`. Two very different things need to agree about it
// — the palette, which decides what blocks a learner may put in the file, and
// the generator, which decides what module the file compiles to. When they
// disagree, a file is offered a block that then changes what the file IS. So
// both ask here.

/** Which kind of file this is. */
export type FileKind = 'actor' | 'world' | 'rule' | 'map' | 'placement';

/**
 * A Blockly file's kind, from its path — the one place the extensions are read.
 *
 * `undefined` for anything else, which in the running lab means a file that is
 * not Blockly-authored at all. The generator is also handed `undefined` by
 * callers with no path (tests), and treats it as "work it out from the blocks".
 */
export const fileKindOf = (path?: string): FileKind | undefined => {
  const match = /\.(rule|actor|world|map)$/.exec(path ?? '');
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
 * `world_actor` belongs to an `.actor` file alone. A world once held its own,
 * as roots beside `define world`; every actor is a file now.
 *
 * `world_rule` names only `rule`, and the rest of a rule's definition blocks
 * are not listed at all: the palette drops that whole category outside a
 * `.rule`, and the ones not listed here are inert rather than destructive in
 * the wrong file — no walk in the generator matches them, so they and whatever
 * hangs off them generate nothing, exactly as a misplaced event hat does.
 *
 * A type absent from this map is offered everywhere. Most blocks are neither
 * roots nor file-bound.
 */
export const ROOT_HOMES: ReadonlyMap<string, ReadonlySet<FileKind>> = new Map([
  ['world_actor', new Set<FileKind>(['actor'])],
  ['world_world', new Set<FileKind>(['world'])],
  ['world_rule', new Set<FileKind>(['rule'])],
  ['world_rule_trait', new Set<FileKind>(['rule'])],
  // …and an ACTOR file, where the same block declares a thing that HAPPENS to
  // that kind of actor rather than a member of a rule
  // (`ActorBuilder.defineEvent`).
  //
  // …AND A WORLD, which is the app's own vocabulary: the events its maps
  // raise. A map used to declare its own and the world heard them, which
  // meant a hundred level maps minted a hundred different `complete` events
  // and a hundred drawers to hold them (specs/MAP_EVENTS_PLAN.md).
  //
  // This entry USED TO EXCLUDE a `.world`, "for the reason `define block`
  // beside it is not: a world's own `define actor` generates into a block
  // scope, and the declaration this emits is an `export const`." A world has
  // not been able to hold a `define actor` since every actor became a file —
  // see `DEFINING_ROOTS` below, which refuses one outright — so the block
  // scope that reason turns on cannot be created any more. The restriction
  // outlived its cause by some months, and the two entries under it are the
  // rest of the same wreckage.
  //
  // NOT A `.map`, which it was until the inversion: a map used to declare the
  // events its placements raised, and the world heard them through a drawer
  // per map. A map declares no events of its own now — it RAISES the world's,
  // by name — so that a hundred maps raising one event is one declaration and
  // one handler (specs/MAP_EVENTS_PLAN.md).
  ['world_rule_event', new Set<FileKind>(['rule', 'actor', 'world'])],
  // …and an ACTOR file, where the same block declares a thing that kind of
  // actor does rather than a member of a rule (`ActorBuilder.defineAction`).
  //
  // STILL NOT A `.world`, and now for a reason that is true: nobody has asked
  // for one. The old reason was the dead block scope above; a `define block`
  // at a world file's top level would generate as happily as an actor's does,
  // and what it would BE is a helper local to one program. That is a real
  // thing and a separate question, and the day it is asked this line is one
  // word (specs/MAP_EVENTS_PLAN.md).
  ['world_rule_block', new Set<FileKind>(['rule', 'actor'])],
  // `acts like` names another ACTOR's module, so it belongs in the file that
  // defines one and nowhere else.
  //
  // IT USED TO BE OFFERED IN A `.world` TOO, so that it could be a row under
  // a world's own `define actor` — which is the same dead reason read the
  // other way round, an ALLOWANCE for a position that cannot exist. A world
  // has no actor definition for it to sit in, so the block was offered in a
  // file that could do nothing with it.
  ['world_acts_like', new Set<FileKind>(['actor'])],
  ['world_rule_enum', new Set<FileKind>(['rule'])],
  ['world_rule_enum_option', new Set<FileKind>(['rule'])],
  ['world_rule_step_tick', new Set<FileKind>(['rule'])],
  ['world_rule_step_in', new Set<FileKind>(['rule'])],
  // `each frame` reads two ways, and both are the same sentence about
  // whoever owns it: chained under a `define trait` it is one of that trait's
  // members; chained under an `.actor` file's `define actor` it is work that
  // kind of actor does.
  //
  // IT MUST BE INSIDE A `define actor` in the second, and its generator
  // writes nothing when it is not (`worldTraitStep`); an unattached step is
  // grayed by `DisableOrphansPlugin` rather than quietly compiled from
  // nowhere. Not a world: it was offered there for the actors a world once
  // defined for itself, and a world holds no `define actor` now.
  ['world_trait_step', new Set<FileKind>(['actor', 'rule'])],
  // A drawing belongs to a KIND of actor, and a kind is what an `.actor` file
  // is. Not a rule: a rule is a shared mechanic, and how a particular actor
  // looks is the one thing that is not shared — an actor that wants somebody
  // else's picture already has `set sprite` (specs/DRAWING.md). Not a world
  // either, since the actors a world once described for itself are files.
  // A ROW under `define actor`, so this entry says which files may hold one
  // rather than which give it a root's shape (`domainBlocks.worldDefineDrawing`).
  ['world_define_drawing', new Set<FileKind>(['actor'])],
  // A tween is defined where it is used — an actor's in its own file, a
  // world's in the world — and referenced by the defining block's id. A file
  // of shared ones is the same axis an actor sits on and is not built yet.
  ['world_define_tween', new Set<FileKind>(['actor', 'world'])],
  // A map's own blocks (specs/MAP_FIRST.md): naming another placement and
  // unloading the map belong to the map and its placements; hearing the map
  // load and unload belongs to the map's own workspace alone.
  // …and the root a map's workspace opens with, which every other Blockly
  // file kind already had (specs/MAP_EVENTS_PLAN.md).
  ['world_map', new Set<FileKind>(['map'])],
  ['world_placement', new Set<FileKind>(['map', 'placement'])],
  ['world_unload_this_map', new Set<FileKind>(['map', 'placement'])],
  ['world_on_map_loads', new Set<FileKind>(['map'])],
  ['world_on_map_unloads', new Set<FileKind>(['map'])],
]);

/**
 * The roots that DEFINE what a file is, and how each reads in the error.
 *
 * One in the wrong kind of file is refused rather than compiled: a `define
 * rule` in a world is not a world with something extra in it, it is a file
 * that cannot be what its name says. `define actor` joined the list when
 * every actor became a file — until then a world could hold one, and before
 * that "actor" was the shape a file fell back to, so it never had a wrong
 * home to be refused in. The rest of the definition blocks are inert out of
 * place and stay that way (`ROOT_HOMES`).
 */
const DEFINING_ROOTS: ReadonlyMap<string, string> = new Map([
  ['world_world', 'define world'],
  ['world_actor', 'define actor'],
  ['world_rule', 'define rule'],
  ['world_map', 'define map'],
]);

/** Which module a file's blocks are assembled into. */
export type ModuleShape = FileKind;

/**
 * What a file compiles to — and a refusal if a block would decide that instead
 * of the file's own name.
 *
 * Generation used to pick the shape by looking for `world_world` and
 * `world_rule`, so a `define world` dragged into an `.actor` did not fail: it
 * compiled that actor into a world, and the actor stopped existing. Nothing
 * said so. The complaint surfaced wherever something later tried to place the
 * actor, which is nowhere near the mistake, and reads as the world being
 * broken rather than one block being in the wrong file.
 *
 * So the file's extension decides, and a defining root that disagrees with it
 * is an error rather than a redirection. A `.world` still assembles as a world
 * with no root yet — a half-built one is missing it, and compiling that as an
 * actor reports the wrong problem.
 *
 * With no path there is nothing better to go on than the blocks, so the old
 * sniffing stands in and nothing is refused.
 *
 * @throws if a defining root is in a file whose kind is not its home.
 */
export function moduleShape(
  path: string | undefined,
  topBlockTypes: readonly string[],
): ModuleShape {
  const kind = fileKindOf(path);
  if (!kind) {
    if (topBlockTypes.includes('world_rule')) {
      return 'rule';
    }
    return topBlockTypes.includes('world_world') ? 'world' : 'actor';
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
