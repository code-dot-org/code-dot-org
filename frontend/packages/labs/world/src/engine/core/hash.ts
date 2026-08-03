// A short, stable digest of a string, for the parts of a snapshot that stand in
// for something too big to compare directly — an effect's graph, a handler's
// body.

/**
 * FNV-1a.
 *
 * A hash rather than the text itself because a snapshot is compared by
 * stringifying it, and the things hashed here run to kilobytes: the comparison
 * should cost the same whatever the document. FNV-1a is not a security hash and
 * does not need to be — a collision means one edit does not restart the game,
 * which the next edit corrects. It is chosen for being short, dependency-free,
 * and stable across runs, which `Object.hashCode`-style identity is not.
 */
export function fnv1a(text: string): string {
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
