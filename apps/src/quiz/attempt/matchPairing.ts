// A pair is [id from the first set, id from the second set].
export type MatchPairs = [string, string][];

// Pairing two items replaces any pair either was already in, so each item
// has at most one partner. Pairing two items that are already partners
// unpairs them instead.
export function toggleMatch(
  pairs: MatchPairs,
  [firstId, secondId]: [string, string]
): MatchPairs {
  const isExisting = pairs.some(
    ([first, second]) => first === firstId && second === secondId
  );
  const others = pairs.filter(
    ([first, second]) => first !== firstId && second !== secondId
  );
  return isExisting ? others : [...others, [firstId, secondId]];
}

export function partnerOf(pairs: MatchPairs, id: string): string | undefined {
  for (const [first, second] of pairs) {
    if (first === id) {
      return second;
    }
    if (second === id) {
      return first;
    }
  }
  return undefined;
}
