import {formatChoiceLetter} from '../utils';

export interface MatchItem {
  id: string;
  text: string;
}

export type MatchSets = [MatchItem[], MatchItem[]];

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

// Each first-set item has a letter by position.
export function letterOf(matchSets: MatchSets, id: string): string | undefined {
  const index = matchSets[0].findIndex(item => item.id === id);
  return index === -1 ? undefined : formatChoiceLetter(index);
}

// For accessible names: a first-set item's label leads with its letter.
export function labelOf(matchSets: MatchSets, id: string): string | undefined {
  const first = matchSets[0].find(item => item.id === id);
  if (first) {
    return `${letterOf(matchSets, id)}. ${first.text}`;
  }
  return matchSets[1].find(item => item.id === id)?.text;
}
