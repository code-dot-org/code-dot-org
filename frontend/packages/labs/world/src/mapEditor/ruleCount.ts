// How the Main Screen's properties say how many rules the game runs.

/** Spelled out, because "1 rules" is a bug on screen, and "no" is an answer. */
export function countText(count: number): string {
  if (count === 0) {
    return 'no rules';
  }
  return count === 1 ? '1 rule' : `${count} rules`;
}
