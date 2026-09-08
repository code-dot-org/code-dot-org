// What kind of file a Blockly file is, and what it may therefore contain.
//
// A project's Blockly files come in three kinds, and the kind is in the name:
// `.actor`, `.world`, `.rule`. Two very different things need to agree about it
// — the palette, which decides what blocks a learner may put in the file, and
// the generator, which decides what module the file compiles to. When they
// disagree, a file is offered a block that then changes what the file IS. So
// both ask here.

/** Which kind of file this is. */
export type FileKind = 'actor' | 'world' | 'rule';

/**
 * A Blockly file's kind, from its path — the one place the extensions are read.
 *
 * `undefined` for anything else, which in the running lab means a file that is
 * not Blockly-authored at all. The generator is also handed `undefined` by
 * callers with no path (tests), and treats it as "work it out from the blocks".
 */
export const fileKindOf = (path?: string): FileKind | undefined => {
  const match = /\.(rule|actor|world)$/.exec(path ?? '');
  return match ? (match[1] as FileKind) : undefined;
};

/**
 * The DEFINITION roots, and which kinds of file may hold one.
 *
 * A root here is not merely useless in the wrong file — it changes what the
 * file IS, so it is both kept out of the palette and refused by the generator.
 *
 * `world_actor` belongs to two of them: a world may define actors of its own,
 * each a `const` its body then places with `add actor` (`localActors`, and see
 * `assembleWorldModule`). A `.rule` is the one that cannot.
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
  ['world_actor', new Set<FileKind>(['actor', 'world'])],
  ['world_world', new Set<FileKind>(['world'])],
  ['world_rule', new Set<FileKind>(['rule'])],
  ['world_rule_trait', new Set<FileKind>(['rule'])],
  // …and an ACTOR file, where the same block declares a thing that HAPPENS to
  // that kind of actor rather than a member of a rule
  // (`ActorBuilder.defineEvent`). Not a `.world`, for the reason `define
  // block` beside it is not: a world's own `define actor` generates into a
  // block scope, and the declaration this emits is an `export const`.
  ['world_rule_event', new Set<FileKind>(['rule', 'actor'])],
  // …and an ACTOR file, where the same block declares a thing that kind of
  // actor does rather than a member of a rule (`ActorBuilder.defineAction`).
  // Not a `.world`: a world's own `define actor` generates into a block scope,
  // and the declaration this emits is an `export const`.
  ['world_rule_block', new Set<FileKind>(['rule', 'actor'])],
  // `acts like` names another ACTOR's module, so it belongs in the two homes
  // that define one and not in a `.rule`. Unlike `define block` beside it, a
  // world's own `define actor` may hold one: it emits a builder call rather
  // than an `export const`, and a block scope takes that quite happily.
  ['world_acts_like', new Set<FileKind>(['actor', 'world'])],
  ['world_rule_enum', new Set<FileKind>(['rule'])],
  ['world_rule_enum_option', new Set<FileKind>(['rule'])],
  ['world_rule_step_tick', new Set<FileKind>(['rule'])],
  ['world_rule_step_in', new Set<FileKind>(['rule'])],
  // `each frame` reads three ways, and all three are the same sentence about
  // whoever owns it: chained under a `define trait` it is one of that trait's
  // members; chained under an `.actor` file's `define actor` it is work that
  // kind of actor does; and chained inside a world's own `define actor` it is
  // that same work for a kind the world defines rather than a file.
  //
  // The third was missing, and it read as a health bar that never moved: a
  // world-defined actor could do no per-frame work at all, so an actor that
  // had to look at something each frame had to be a file.
  //
  // IT MUST BE INSIDE A `define actor` in either of the last two, and its
  // generator writes nothing when it is not (`worldTraitStep`). In a world
  // that is what keeps a step from emitting a call on an `actor` that is not
  // bound, which would stop the whole project compiling; in an `.actor` file
  // it is what makes an unattached step say so — grayed by
  // `DisableOrphansPlugin` rather than quietly compiled from nowhere.
  ['world_trait_step', new Set<FileKind>(['actor', 'rule', 'world'])],
  // A drawing belongs to a KIND of actor, and a kind is what an `.actor` file
  // is. Not a rule: a rule is a shared mechanic, and how a particular actor
  // looks is the one thing that is not shared — an actor that
  // wants somebody else's picture already has `set sprite` (specs/DRAWING.md).
  // A world may describe its OWN actors' pictures too, chained inside the
  // `define actor` that owns them. A ROW under that definition in both homes
  // now, so this entry says which files may hold one rather than which give it
  // a root's shape (`domainBlocks.worldDefineDrawing`).
  ['world_define_drawing', new Set<FileKind>(['actor', 'world'])],
  // A tween is defined where it is used — an actor's in its own file, a
  // world's in the world — and referenced by the defining block's id. A file
  // of shared ones is the same axis an actor sits on and is not built yet.
  ['world_define_tween', new Set<FileKind>(['actor', 'world'])],
]);

/**
 * How a root out of place READS, for the error. Only the two that shape the
 * module have one, because only those are worth stopping the project over.
 */
const SHAPING_ROOTS: ReadonlyMap<string, string> = new Map([
  ['world_world', 'define world'],
  ['world_rule', 'define rule'],
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
 * So the file's extension decides, and a shaping root that disagrees with it is
 * an error rather than a redirection. A `.world` still assembles as a world
 * with no root yet — a half-built one is missing it, and compiling that as an
 * actor reports the wrong problem.
 *
 * With no path there is nothing better to go on than the blocks, so the old
 * sniffing stands in and nothing is refused.
 *
 * @throws if a shaping root is in a file whose kind is not its home.
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
    const says = SHAPING_ROOTS.get(type);
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
