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
 * Assemble a `.scene` file's module. The `world_scene` block is the root — it
 * builds `const scene = …` and generates its `world_add_actor` children inline
 * (each a block-scoped `scene.addActor(...)`), so it is the only top-level block
 * here; any stray others are appended before the default export. Imports the
 * blocks registered are hoisted separately by the generator's `finish()`.
 */
export function assembleSceneModule(blocks: GeneratedBlock[]): string {
  const scene = blocks.find(block => block.type === 'world_scene');
  const rest = blocks.filter(block => block !== scene);
  const sceneCode = scene ? scene.code : '';
  const restCode = rest.map(block => block.code).join('');
  return `${sceneCode}${restCode}export default scene;\n`;
}

/**
 * Assemble a `.world` file's module. The `world_world` block is the root — it
 * builds `const world = …` and generates its `use rule` / `use animations`
 * children inline — so it is the only top-level block; any stray others are
 * appended before the default export. Imports are hoisted by `finish()`.
 */
export function assembleWorldModule(blocks: GeneratedBlock[]): string {
  const world = blocks.find(block => block.type === 'world_world');
  const rest = blocks.filter(block => block !== world);
  const worldCode = world ? world.code : '';
  const restCode = rest.map(block => block.code).join('');
  return `${worldCode}${restCode}export default world;\n`;
}
