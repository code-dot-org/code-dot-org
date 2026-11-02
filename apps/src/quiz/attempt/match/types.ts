import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

export type MatchSets = NonNullable<QuizQuestionSummary['matchSets']>;

// A column, by reading order: start is the left column in left-to-right
// languages. The start column shows the first set, whose items are lettered.
export type MatchSide = 'start' | 'end';

// A pair is [start id, end id].
export type MatchPairs = [string, string][];

// At most one selected item per column; a pair forms once both are set.
export type MatchSelection = Partial<Record<MatchSide, string>>;
