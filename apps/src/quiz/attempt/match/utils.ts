import {formatChoiceLetter} from '@cdo/apps/quiz/utils';

import {MatchItem, MatchPairs, MatchSets, MatchSide} from './types';

export function itemsInColumn(
  matchSets: MatchSets,
  side: MatchSide
): MatchItem[] {
  return matchSets[side === 'start' ? 0 : 1];
}

// Pairs the two items, first breaking any pair either was already in, so
// each item has at most one partner.
export function pairTogether(
  pairs: MatchPairs,
  [startId, endId]: [string, string]
): MatchPairs {
  return [
    ...pairs.filter(([start, end]) => start !== startId && end !== endId),
    [startId, endId],
  ];
}

// Removes the pair that includes this item, whichever column it's in.
export function unpairItem(pairs: MatchPairs, id: string): MatchPairs {
  return pairs.filter(([start, end]) => start !== id && end !== id);
}

export function findPartner(pairs: MatchPairs, id: string): string | undefined {
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
  const index = itemsInColumn(matchSets, 'start').findIndex(
    item => item.id === id
  );
  return index === -1 ? undefined : formatChoiceLetter(index);
}

// For accessible names: a start item's label leads with its letter.
export function labelOf(matchSets: MatchSets, id: string): string | undefined {
  const startItem = itemsInColumn(matchSets, 'start').find(
    item => item.id === id
  );
  if (startItem) {
    return `${letterOf(matchSets, id)}. ${startItem.text}`;
  }
  return itemsInColumn(matchSets, 'end').find(item => item.id === id)?.text;
}
