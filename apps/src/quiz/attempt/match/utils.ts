import {formatChoiceLetter} from '../../utils';

import {MatchItem, MatchPairs, MatchSets, MatchSide} from './types';

export function itemsOn(matchSets: MatchSets, side: MatchSide): MatchItem[] {
  return matchSets[side === 'start' ? 0 : 1];
}

// Pairing two items replaces any pair either was already in, so each item
// has at most one partner. Pairing two items that are already partners
// unpairs them instead.
export function toggleMatch(
  pairs: MatchPairs,
  [startId, endId]: [string, string]
): MatchPairs {
  const isExisting = pairs.some(
    ([start, end]) => start === startId && end === endId
  );
  const others = pairs.filter(
    ([start, end]) => start !== startId && end !== endId
  );
  return isExisting ? others : [...others, [startId, endId]];
}

export function partnerOf(pairs: MatchPairs, id: string): string | undefined {
  for (const [start, end] of pairs) {
    if (start === id) {
      return end;
    }
    if (end === id) {
      return start;
    }
  }
  return undefined;
}

// Each start item has a letter by position.
export function letterOf(matchSets: MatchSets, id: string): string | undefined {
  const index = itemsOn(matchSets, 'start').findIndex(item => item.id === id);
  return index === -1 ? undefined : formatChoiceLetter(index);
}

// For accessible names: a start item's label leads with its letter.
export function labelOf(matchSets: MatchSets, id: string): string | undefined {
  const startItem = itemsOn(matchSets, 'start').find(item => item.id === id);
  if (startItem) {
    return `${letterOf(matchSets, id)}. ${startItem.text}`;
  }
  return itemsOn(matchSets, 'end').find(item => item.id === id)?.text;
}
