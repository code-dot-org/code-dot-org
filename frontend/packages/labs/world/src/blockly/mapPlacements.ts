// A placement's own picture key, for the map editor.
//
// This file once also held what the `create actor in map` block's grid did
// with a click; that block is gone, a world's arrangement being its main map
// (specs/RETIREMENTS_PLAN.md). What is left is what the map editor reads.

export interface MapPlacement {
  id: string;
  /** Per-instance overrides, keyed by owner (trait) id then property id. */
  properties?: Record<string, Record<string, unknown>>;
}

/**
 * What a placement is DRAWN as, as a key — or undefined when its kind's own
 * picture is the answer.
 *
 * Content-derived, so two placements that differ in nothing are rendered once
 * and share the answer — and so an edit to one changes only its own key. The
 * same trick a drawing's texture is cached by (`engine/core/drawing`), one
 * level up.
 *
 * The owner ids are sorted because a key that depended on the order a
 * `properties` object happened to be built in would miss its own cache after an
 * edit that changed nothing.
 */
export const placementKey = (
  type: string,
  properties: Record<string, Record<string, unknown>> = {},
): string | undefined => {
  const owners = Object.keys(properties)
    .filter(owner => owner !== POSITIONAL)
    .sort();
  if (!owners.length) {
    return undefined;
  }
  const described = owners
    .map(owner => {
      const values = properties[owner];
      const inner = Object.keys(values)
        .sort()
        .map(id => `${id}=${JSON.stringify(values[id])}`)
        .join(',');
      return `${owner}{${inner}}`;
    })
    .join(';');
  return `${type}|${described}`;
};

/**
 * The owner every placement overrides, and the one that cannot change a
 * picture.
 *
 * A thumbnail is drawn with no position at all, and the scale and rotation on
 * it are applied by whatever draws the placement rather than baked in. So two
 * actors that differ only in where they stand are one picture — which is most
 * of a map, and the difference between rendering three Labels and rendering
 * forty tiles.
 */
const POSITIONAL = 'positional';
