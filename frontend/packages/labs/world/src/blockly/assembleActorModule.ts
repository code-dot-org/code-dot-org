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
