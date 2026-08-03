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
export interface GeneratedBlock {
  type: string;
  code: string;
}

/** Order the generated blocks into a valid world-lab actor module. */
export function assembleActorModule(blocks: GeneratedBlock[]): string {
  const actor = blocks.find(block => block.type === 'world_actor');
  const events = blocks.filter(block => block !== actor);
  const actorCode = actor ? actor.code : '';
  const eventsCode = events.map(block => block.code).join('');
  return `${actorCode}${eventsCode}export default actor;\n`;
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
export function assembleWorldModule(blocks: GeneratedBlock[]): string {
  const world = blocks.find(block => block.type === 'world_world');
  const actors = blocks.filter(block => block.type === 'world_actor');
  // Event handlers are REGISTRATIONS on an actor, and a template copies its
  // handlers into each instance as it makes one (`ActorBuilder.instantiate`).
  // So a hat below the world block would register onto a template every actor
  // had already been made from: the handler would compile, run, and never fire.
  const handlers = blocks.filter(block => block.type.startsWith('world_on_'));
  const rest = blocks.filter(
    block =>
      block !== world && !actors.includes(block) && !handlers.includes(block),
  );
  const actorsCode = actors
    .map(block => block.code)
    .concat(handlers.map(block => block.code))
    .join('');
  const worldCode = world ? world.code : '';
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
