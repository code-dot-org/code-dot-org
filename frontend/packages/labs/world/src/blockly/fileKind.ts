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
  // `each frame` reads two ways: chained under a `define trait` it is one of
  // that trait's members, and standing on its own in an `.actor` file it is
  // work that kind of actor does. Both are real; a `.world` is not — a world's
  // per-frame work belongs to a rule, and the block would generate nothing
  // there and say nothing about why.
  ['world_trait_step', new Set<FileKind>(['actor', 'rule'])],
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
