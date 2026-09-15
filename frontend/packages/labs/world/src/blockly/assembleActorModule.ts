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
 * Assemble a `.world` file's module. The `world_world` block is the root — it
 * builds `const world = …` and generates its `use rule` / `use animations` /
 * `load map` children inline — so it is the only top-level block; any stray
 * others are appended before the default export. Imports are hoisted by
 * `finish()`.
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
      block !== world && !tweens.includes(block) && !handlers.includes(block),
  );
  const actorsCode = tweens
    .map(block => block.code)
    .concat(onActors.map(block => block.code))
    .join('');
  const worldCode =
    (world ? world.code : '') + onWorld.map(block => block.code).join('');
  const restCode = rest.map(block => block.code).join('');
  return `${actorsCode}${worldCode}${restCode}export default world;\n`;
}
