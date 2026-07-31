// Identity for an applied effect, as the hot-reload reconciler sees it.
//
// `reconcile` (runtime/driver) decides whether a rebuild can be patched into
// the running game or has to restart it, and it decides from `World.snapshot()`
// — rule ids, actor ids, and property values. An effect appears in none of
// those: it declares no property and belongs to no trait. Without an entry of
// its own, editing a `.effect` would rebuild the bundle, reconcile to "nothing
// changed", and leave the old shader on screen.
//
// So the snapshot carries `<path>@<hash>` per applied effect. The path alone
// would catch an effect being added, removed, or swapped, but not the case that
// matters most while authoring: the same effect, edited.

import type {AppliedEffectSpec} from './types';

/**
 * FNV-1a over the serialized document.
 *
 * A hash rather than the document itself because the snapshot is compared by
 * stringifying it, and a graph is kilobytes: the comparison should cost the
 * same whatever the effect. FNV-1a is not a security hash and does not need to
 * be — a collision means one edit does not restart the game, which the next
 * edit corrects. It is chosen for being short, dependency-free, and stable
 * across runs, which `Object.hashCode`-style identity is not.
 */
function hash(text: string): string {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index);
    // The FNV prime, by shifts: `value * 16777619` overflows past 2^53 and
    // loses the low bits that carry the difference between similar documents.
    value +=
      (value << 1) + (value << 4) + (value << 7) + (value << 8) + (value << 24);
  }
  // `>>>` folds the accumulated 32-bit value back into an unsigned integer.
  return (value >>> 0).toString(36);
}

/**
 * `<path>@<hash>` — what a change to this effect changes in the snapshot.
 *
 * The hash covers the parameter values as well as the graph. Values are read
 * once, when the filter is attached to the Game Object, so changing one only
 * reaches the screen on a restart — exactly like editing the graph.
 */
export function effectSnapshotId(effect: AppliedEffectSpec): string {
  return `${effect.path}@${hash(
    JSON.stringify([effect.document, effect.values ?? null]),
  )}`;
}
