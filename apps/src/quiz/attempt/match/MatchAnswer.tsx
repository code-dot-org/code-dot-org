import {Typography} from '@mui/material';
import React, {useId} from 'react';

import {QuizQuestionSummary} from '@cdo/apps/quiz/types';
import {selectedAnswerLabel} from '@cdo/apps/quiz/utils';

import {MatchQuestionResponse, QuizQuestionResult} from '../types';

import MatchBoard from './MatchBoard';
import {NO_MATCH_SETS} from './utils';

import styles from './match-answer.module.scss';

type MatchResult = QuizQuestionResult & MatchQuestionResponse;

// A submitted match question: the pairs as made, read-only. With the answer
// key revealed, each pair is marked, and a wrong answer is followed by the
// correct one.
const MatchAnswer: React.FunctionComponent<{
  question: QuizQuestionSummary;
  result: MatchResult;
  isViewingStudent?: boolean;
}> = ({question, result, isViewingStudent}) => {
  const correctAnswerLabelId = useId();
  const matchSets = question.matchSets ?? NO_MATCH_SETS;
  const correctPairs =
    result.correct === null ? undefined : result.correctPairs ?? undefined;

  return (
    <div className={styles.matchAnswer}>
      <MatchBoard
        matchSets={matchSets}
        pairs={result.responseData.pairs ?? []}
        correctPairs={correctPairs}
        label={selectedAnswerLabel(isViewingStudent)}
      />
      {correctPairs && !result.correct && (
        <>
          <Typography
            id={correctAnswerLabelId}
            variant="overline2"
            component="p"
            className={styles.correctAnswerLabel}
          >
            Correct answer
          </Typography>
          <MatchBoard
            matchSets={matchSets}
            pairs={correctPairs}
            isAnswerKey
            labelledBy={correctAnswerLabelId}
          />
        </>
      )}
    </div>
  );
};

export default MatchAnswer;
