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
 * WHERE an applied effect is, and which effect it is — not how it is tuned.
 *
 * The structural question: gaining or losing an effect changes what is attached
 * to what, and no patch can express that. Its knob settings are a different
 * question, because a filter already running can be retuned in place — see
 * `World.setEffectValues` and the driver's per-frame reconcile.
 *
 * Per SLOT rather than per path, because the same effect on two actors is two
 * effects with two sets of knobs: `[owner, path]` says which one, where owner
 * is `world`, `backdrop:<n>`, or an actor's id. A JSON pair rather than a
 * joined string — an actor's id may itself contain a separator (a placement's
 * is `<blockId>:<placementId>`).
 */
export function effectSlotId(owner: string, effect: AppliedEffectSpec): string {
  return JSON.stringify([owner, effect.path]);
}

/**
 * An applied effect's IDENTITY: which effect, with which knob settings.
 *
 * Deliberately excludes the graph. Identity is what has to be structural —
 * gaining, losing, or retuning an effect all change what is attached to what.
 * The driver compares this same id per frame to notice a retune, which is how
 * `add effect Tint` with a computed color reaches the running filter. The graph
 * is different:
 * it can be swapped underneath a running filter (`updateEffect`), so an edit to
 * it should update the game rather than restart it. That content lives in
 * {@link effectContentHash}.
 */
export function effectSnapshotId(effect: AppliedEffectSpec): string {
  return `${effect.path}@${hash(JSON.stringify(effect.values ?? null))}`;
}

/**
 * An effect's CONTENT: the graph, hashed.
 *
 * Compared separately from identity so the reconciler can tell "the learner
 * edited the shader" from "the learner changed which effects are in play". The
 * first is patchable into a running game; the second is not.
 */
export function effectContentHash(effect: AppliedEffectSpec): string {
  return hash(JSON.stringify(effect.document));
}
