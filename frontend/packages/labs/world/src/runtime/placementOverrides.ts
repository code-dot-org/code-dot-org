// A placement's overrides, put onto the actor drawn for it.
//
// A `.map` names what a placement overrides by `${ownerId}.${propId}` — the
// declaring rule, trait or KIND, then the property — and the sandbox draws a
// placement by instantiating its kind and setting those (`World.loadMap` does
// the same for the game). The two have to find the same slots, or a Label
// says its own words in the game and the kind's default in the editor.
//
// That was the bug this file came out of. The sandbox looked a path up in the
// actor's TRAITS alone, and an actor's own properties — `text`, `width`, the
// ones an interface actor is placed for — belong to no trait
// (`ActorBuilder.defineProperty`). Every override on a Label was skipped in
// silence, and the map drew the kind. The game had the same hole and closed it
// first; this is the closing, shared.

import type {Actor, Property} from 'world-lab';

/** Every slot a placement may name on this actor, by the path a map uses. */
export function placementSlots(actor: Actor): Map<string, Property> {
  const slots = new Map<string, Property>();
  for (const trait of actor.traits()) {
    for (const property of Object.values(trait.properties)) {
      slots.set(`${property.ownerId}.${property.id}`, property);
    }
  }
  // The kind's own, and what it inherits by acting like another: a Button's
  // `text` is keyed under the Label that declared it.
  for (const property of actor.ownProperties()) {
    slots.set(`${property.ownerId}.${property.id}`, property);
  }
  return slots;
}

/**
 * Set a placement's overrides on `actor`.
 *
 * A path the actor has no slot for is skipped: a placement saved against a
 * rule the project has since dropped is a picture to draw anyway, not an
 * error to raise. An actor-typed value names another placement and means
 * nothing to an actor drawn alone, so it is left as well.
 */
export function applyPlacementOverrides(
  actor: Actor,
  properties: Record<string, Record<string, unknown>> | undefined,
): void {
  const slots = placementSlots(actor);
  for (const [ownerId, values] of Object.entries(properties ?? {})) {
    for (const [propId, value] of Object.entries(values)) {
      const property = slots.get(`${ownerId}.${propId}`);
      if (
        !property ||
        property.type === 'actor' ||
        property.type === 'actors'
      ) {
        continue;
      }
      actor.set(property, value as never);
    }
  }
}
