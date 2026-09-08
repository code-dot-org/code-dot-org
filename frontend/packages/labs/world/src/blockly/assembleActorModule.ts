// Assembles a `.actor` file's world-lab module from its workspace's top-level
// blocks' generated code. Events are their own top-level blocks (INTERFACE.md),
// so the workspace's block order can't be trusted: the `world_actor` block's
// `const actor = ...` must precede any `actor.*` use, or a floating event
// dragged above it would emit `actor.on(...)` into a temporal dead zone.
//
// So we emit the actor block first, then the event handlers, then the default
// export — regardless of on-canvas position. `export default actor` captures
// the actor object by reference, so handlers registered after it still mutate
// the exported instance.

/** A top-level block's type and its already-generated code. */
import {DEFINE_TWEEN} from './tweens';

export interface GeneratedBlock {
  type: string;
  code: string;
  /** The top-level block's own id, for the two blocks that refer to each other. */
  id?: string;
  /**
   * The co-located `define actor` this one ACTS LIKE, by block id.
   *
   * Read off the workspace rather than out of the code (`BlocklyGenerator`),
   * because what the assembler needs is the EDGE and the code has only the
   * variable it resolved to.
   */
  actsLike?: string;
}

/**
 * Order the generated blocks into a valid world-lab actor module.
 *
 * `declarations` are the actor's own properties (`actorMeta`), and they go
 * between the actor and its handlers for the reason the actor goes first: they
 * are `actor.defineProperty(…)` calls, so they need `const actor` to exist, and
 * the handlers that read them need the consts they bind.
 */
export function assembleActorModule(
  blocks: GeneratedBlock[],
  declarations = '',
): string {
  const actor = blocks.find(block => block.type === 'world_actor');
  // A tween's definition is a `const` a handler reads, so it has to be bound
  // before one runs — the same temporal-dead-zone hazard a world's local
  // actors have, and the same answer.
  const tweens = blocks.filter(block => block.type === DEFINE_TWEEN);
  const events = blocks.filter(
    block => block !== actor && !tweens.includes(block),
  );
  // THE DECLARATIONS GO INSIDE the actor block's code, straight after
  // `const actor = …`, and not after the whole of it.
  //
  // They are `const`s, and a row in the definition's own chain may READ one:
  // the stock Label declares `text` and then sets it to "Label" three rows
  // later, which is an ordinary thing to write and was a use before
  // declaration — "Cannot access 'TextProperty' before initialization", from a
  // module that would not load at all. It only became reachable when the four
  // text properties stopped being a rule's, because an imported name is
  // hoisted and one declared here is not.
  //
  // A world's own actor already had this right (`domainBlocks`, `world_actor`
  // emits `ownDeclarationsIn` before opening the block its body runs in); this
  // is the same order for a file.
  const opened = actor ? actor.code.indexOf('\n') + 1 : 0;
  const actorCode = actor
    ? actor.code.slice(0, opened) + declarations + actor.code.slice(opened)
    : declarations;
  const tweensCode = tweens.map(block => block.code).join('');
  const eventsCode = events.map(block => block.code).join('');
  return `${actorCode}${tweensCode}${eventsCode}export default actor;\n`;
}

/**
 * A world's own actors, ordered so a parent is declared before a child.
 *
 * Each is a `const`, and `acts like ⟨a co-located actor⟩` READS that const as
 * the child is being described — so a child written above its parent on the
 * canvas would reach a name in its temporal dead zone and the module would
 * throw as it loaded. Where a block sits on a canvas is not something a
 * learner should have to think about, which is the same reason local actors
 * are hoisted above the world block at all.
 *
 * A depth-first walk, parents first, and STABLE: an actor with no parent keeps
 * its place relative to the others, so a world nobody has used this in is
 * emitted exactly as it was.
 *
 * A CYCLE KEEPS ITS ORIGINAL ORDER rather than looping. The dropdown will not
 * offer one and the palette's walk guards against one, but a pasted or renamed
 * file may still hold one — and a module that throws naming the actor is a far
 * better answer than a generator that never returns.
 */
function inParentOrder(actors: GeneratedBlock[]): GeneratedBlock[] {
  const byId = new Map(
    actors.flatMap(actor => (actor.id ? [[actor.id, actor] as const] : [])),
  );
  const ordered: GeneratedBlock[] = [];
  const placed = new Set<GeneratedBlock>();
  const visiting = new Set<GeneratedBlock>();
  const place = (actor: GeneratedBlock): void => {
    if (placed.has(actor) || visiting.has(actor)) {
      return;
    }
    visiting.add(actor);
    const parent = actor.actsLike ? byId.get(actor.actsLike) : undefined;
    if (parent) {
      place(parent);
    }
    visiting.delete(actor);
    placed.add(actor);
    ordered.push(actor);
  };
  actors.forEach(place);
  return ordered;
}

/**
 * Assemble a `.world` file's module. The `world_world` block is the root — it
 * builds `const world = …` and generates its `use rule` / `use animations` /
 * `load map` children inline — so it is the only top-level block; any stray
 * others are appended before the default export. Imports are hoisted by
 * `finish()`.
 *
 * With one exception, and it is the same one the actor module has: a world may
 * define actors of its own (`blockly/localActors`), each a `const` the world's
 * body then places with `add actor`. Those must be declared BEFORE the world
 * block, or placing one reads a variable in its temporal dead zone — and where
 * a definition sits on the canvas is not something a learner should have to
 * think about.
 */
export function assembleWorldModule(
  blocks: GeneratedBlock[],
  /**
   * Which hat types belong to a WORLD event — see the two constraints below.
   *
   * Passed in rather than worked out here: whether an event has an actor is a
   * fact about the rule that declared it (`RuleMeta.events[].scope`), and this
   * file knows about code, not rules. An absent or unlisted type is treated as
   * an actor's, which is where every hat went before the split.
   */
  worldEventTypes: ReadonlySet<string> = new Set(),
): string {
  const world = blocks.find(block => block.type === 'world_world');
  const actors = inParentOrder(
    blocks.filter(block => block.type === 'world_actor'),
  );
  // Tween definitions, hoisted for exactly the reason local actors are: they
  // are `const`s the world's own body reads — `add actor … do play tween …` —
  // and `rest` is emitted AFTER the world block, so left there the name is in
  // its temporal dead zone and the module throws as it is imported.
  const tweens = blocks.filter(block => block.type === DEFINE_TWEEN);
  // Event handlers are REGISTRATIONS, and the two kinds have OPPOSITE
  // constraints — which is why they are split rather than kept together.
  //
  // An actor's must come BEFORE the world block. A template copies its handlers
  // into each instance as it makes one (`ActorBuilder.instantiate`), so a hat
  // below the world block would register onto a template every actor had
  // already been made from: it would compile, run, and never fire.
  //
  // A world's must come AFTER it. It generates `world.on(…)`, and `world` is
  // what the world block binds. Above it, the module threw as it was imported
  // and the whole project stopped — and because esbuild rewrites the `const`,
  // it threw as "Cannot read properties of undefined (reading 'on')" rather
  // than as the use-before-declaration it actually is.
  const handlers = blocks.filter(block => block.type.startsWith('world_on_'));
  const onActors = handlers.filter(block => !worldEventTypes.has(block.type));
  const onWorld = handlers.filter(block => worldEventTypes.has(block.type));
  const rest = blocks.filter(
    block =>
      block !== world &&
      !actors.includes(block) &&
      !tweens.includes(block) &&
      !handlers.includes(block),
  );
  const actorsCode = tweens
    .map(block => block.code)
    .concat(actors.map(block => block.code))
    .concat(onActors.map(block => block.code))
    .join('');
  const worldCode =
    (world ? world.code : '') + onWorld.map(block => block.code).join('');
  const restCode = rest.map(block => block.code).join('');
  // `localActors` is declared and exported by every world, defined actors or
  // not: a module that only sometimes has an export is a module its importers
  // have to ask about first, and the thumbnail manifest imports it by name
  // (MAPS.md §5). Empty is a perfectly good answer.
  return (
    `const localActors = {};\n` +
    `${actorsCode}${worldCode}${restCode}` +
    `export default world;\n` +
    `export {localActors};\n`
  );
}
