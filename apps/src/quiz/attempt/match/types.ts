export interface MatchItem {
  id: string;
  text: string;
}

export type MatchSets = [MatchItem[], MatchItem[]];

// A column, by reading order: start is the left column in left-to-right
// languages. The start column shows the first set, whose items are lettered.
export type MatchSide = 'start' | 'end';

// A pair is [start id, end id].
export type MatchPairs = [string, string][];
