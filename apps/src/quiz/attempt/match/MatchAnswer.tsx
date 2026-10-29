import React from 'react';

import {QuizQuestionSummary} from '@cdo/apps/quiz/types';
import {selectedAnswerLabel} from '@cdo/apps/quiz/utils';

import {MatchQuestionResponse, QuizQuestionResult} from '../types';

import MatchBoard from './MatchBoard';
import {NO_MATCH_SETS} from './utils';

type MatchResult = QuizQuestionResult & MatchQuestionResponse;

// A submitted match question: the pairs as made, read-only. Grading is all or
// nothing, so whether the answer was correct is left to the card's result tag.
const MatchAnswer: React.FunctionComponent<{
  question: QuizQuestionSummary;
  result: MatchResult;
  isViewingStudent?: boolean;
}> = ({question, result, isViewingStudent}) => (
  <MatchBoard
    matchSets={question.matchSets ?? NO_MATCH_SETS}
    pairs={result.responseData.pairs ?? []}
    label={selectedAnswerLabel(isViewingStudent)}
  />
);

export default MatchAnswer;
