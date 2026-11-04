// What an undo or a redo changed on a map, in words for the announcer. The
// history keeps whole files and no names for its steps, so the words come
// from comparing the map before with the map after.

import type {MapDoc, Placement} from './mapModel';

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/** A placement with its position taken out, to tell a move from the rest. */
const unplaced = (placement: Placement) => {
  const {positional, ...properties} = placement.properties ?? {};
  const rest = {...positional};
  delete rest.position;
  return {...placement, properties, positional: rest};
};

/** Up to three names, and a count past that. */
const names = (ids: readonly string[]): string =>
  ids.length > 3
    ? `${ids.length} actors`
    : ids.length === 1
      ? ids[0]
      : `${ids.slice(0, -1).join(', ')} and ${ids[ids.length - 1]}`;

export function mapChange(before: MapDoc, after: MapDoc): string {
  const was = new Map(before.actors.map(actor => [actor.id, actor]));
  const now = new Map(after.actors.map(actor => [actor.id, actor]));
  let added = after.actors.filter(actor => !was.has(actor.id));
  let removed = before.actors.filter(actor => !now.has(actor.id));
  const parts: string[] = [];
  // A rename is an id gone and one come, of the same kind.
  if (
    added.length === 1 &&
    removed.length === 1 &&
    added[0].type === removed[0].type
  ) {
    parts.push(`renamed ${removed[0].id} to ${added[0].id}`);
    added = [];
    removed = [];
  }
  const moved: string[] = [];
  const changed: string[] = [];
  for (const actor of after.actors) {
    const held = was.get(actor.id);
    if (!held || same(held, actor)) {
      continue;
    }
    (same(unplaced(held), unplaced(actor)) ? moved : changed).push(actor.id);
  }
  if (added.length) {
    parts.push(`added ${names(added.map(actor => actor.id))}`);
  }
  if (removed.length) {
    parts.push(`removed ${names(removed.map(actor => actor.id))}`);
  }
  if (moved.length) {
    parts.push(`moved ${names(moved)}`);
  }
  if (changed.length) {
    parts.push(`changed ${names(changed)}`);
  }
  if (!same(before.layout, after.layout) && !moved.length) {
    parts.push('changed the docking');
  }
  if (!same(before.size, after.size) || !same(before.tile, after.tile)) {
    parts.push('changed the size');
  }
  if (
    !same(before.layers, after.layers) ||
    !same(before.background, after.background) ||
    before.backgroundColor !== after.backgroundColor ||
    before.theme !== after.theme
  ) {
    parts.push('changed the look');
  }
  if (!same(before.blocks, after.blocks)) {
    parts.push('changed the code');
  }
  return parts.join('; ') || 'a change';
}
