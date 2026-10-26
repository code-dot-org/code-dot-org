// The line break in a designed block (specs/ACTOR_BLOCKS_PLAN.md).
//
// A design is words, values and line breaks in order. A break is written as
// Blockly's `input_end_row`, so the block wraps where its author put one; the
// blocks a design makes are drawn inline, which is what makes that the only
// place they wrap. A break that ends nothing — first, last, or after another
// break — would draw nothing, and is left out of every block made from it.

/** A line break's part. */
export const ROW_PART = 'row';

/** The input a break is written as. */
export const END_ROW = 'input_end_row';

/** The parts with every break that ends nothing taken out. */
export function settledParts<T extends {kind?: string}>(
  parts: readonly T[],
): T[] {
  const kept: T[] = [];
  for (const part of parts) {
    if (
      part.kind === ROW_PART &&
      (kept.length === 0 || kept[kept.length - 1].kind === ROW_PART)
    ) {
      continue;
    }
    kept.push(part);
  }
  while (kept.length && kept[kept.length - 1].kind === ROW_PART) {
    kept.pop();
  }
  return kept;
}

/** Whether a break ends nothing where it is, in parts as they are arranged. */
export function endsNothing(
  parts: ReadonlyArray<{kind?: string}>,
  at: number,
): boolean {
  if (parts[at]?.kind !== ROW_PART) {
    return false;
  }
  return (
    at === 0 ||
    at === parts.length - 1 ||
    parts[at - 1].kind === ROW_PART ||
    parts.slice(at + 1).every(part => part.kind === ROW_PART)
  );
}
