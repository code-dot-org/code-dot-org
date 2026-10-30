import {QuizQuestionItem} from '@cdo/apps/quiz/types';
import {formatChoiceLetter} from '@cdo/apps/quiz/utils';

import {MatchPairs, MatchSets, MatchSide} from './types';

// A constant, so MatchBoard's line measurement doesn't rerun every render.
export const NO_MATCH_SETS: MatchSets = [[], []];

export function itemsInColumn(
  matchSets: MatchSets,
  side: MatchSide
): QuizQuestionItem[] {
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

export type PairStatus = 'correct' | 'incorrect';

// Undefined for an unpaired item, which has no pair to mark.
export function pairStatus(
  pairs: MatchPairs,
  correctPairs: MatchPairs,
  id: string
): PairStatus | undefined {
  const partnerId = findPartner(pairs, id);
  if (!partnerId) {
    return undefined;
  }
  return findPartner(correctPairs, id) === partnerId ? 'correct' : 'incorrect';
}

// Each start item has a letter by position.
export function letterOf(matchSets: MatchSets, id: string): string | undefined {
  const index = itemsInColumn(matchSets, 'start').findIndex(
    item => item.id === id
  );
  return index === -1 ? undefined : formatChoiceLetter(index);
}

// For accessible names, which leave out the letter: a name already says
// what the item is matched with.
export function getItemText(
  matchSets: MatchSets,
  id: string
): string | undefined {
  return matchSets.flat().find(item => item.id === id)?.text;
}
