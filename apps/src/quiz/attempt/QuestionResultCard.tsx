import {Typography} from '@mui/material';
import React from 'react';

import {QuizQuestionSummary} from '../types';

import AttemptCard from './AttemptCard';
import FreeResponseAnswer from './FreeResponseAnswer';
import MultipleChoiceAnswer from './MultipleChoiceAnswer';
import MultipleSelectAnswer from './MultipleSelectAnswer';
import QuestionDescription from './QuestionDescription';
import ResultTag, {ResultTagStatus} from './ResultTag';
import {
  isFreeResponseResponse,
  isMultipleChoiceResponse,
  isMultipleSelectResponse,
  QuizQuestionResult,
} from './types';

import styles from './question-result-card.module.scss';

export interface QuestionResultCardProps {
  question: QuizQuestionSummary;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  result: QuizQuestionResult;
  revealAnswerExplanation?: boolean;
  showCorrectness?: boolean;
  // A teacher viewing a student's attempt; the selected answer is the student's.
  isViewingStudent?: boolean;
}

// null when there is nothing to tag: not yet submitted, or answered with
// correctness hidden.
function getResultTagStatus(
  result: QuizQuestionResult,
  showCorrectness: boolean
): ResultTagStatus | null {
  if (result.answered === undefined) {
    return null;
  }
  if (!showCorrectness) {
    return result.answered ? null : 'skipped_ungraded';
  }
  if (!result.answered) {
    return 'skipped';
  }
  if (result.correct === null) {
    return 'ungraded';
  }
  return result.correct ? 'correct' : 'incorrect';
}

// Read-only review of one submitted question, graded or not.
const QuestionResultCard: React.FunctionComponent<QuestionResultCardProps> = ({
  question,
  questionLabel,
  result,
  revealAnswerExplanation,
  showCorrectness = false,
  isViewingStudent,
}) => {
  const tagStatus = getResultTagStatus(result, showCorrectness);
  return (
    <AttemptCard
      label={questionLabel}
      tag={tagStatus && <ResultTag status={tagStatus} />}
      title={question.questionTitle}
      description={<QuestionDescription markdown={question.description} />}
    >
      {isFreeResponseResponse(result) && (
        <FreeResponseAnswer
          answerText={result.responseData.answerText ?? null}
          isViewingStudent={isViewingStudent}
        />
      )}
      {isMultipleChoiceResponse(result) && (
        <MultipleChoiceAnswer
          question={question}
          result={result}
          isViewingStudent={isViewingStudent}
        />
      )}
      {isMultipleSelectResponse(result) && (
        <MultipleSelectAnswer
          question={question}
          result={result}
          isViewingStudent={isViewingStudent}
        />
      )}
      {revealAnswerExplanation && result.explanation && (
        <div className={styles.explanation}>
          <div className={styles.explanationHeader}>
            <Typography variant="overline2" className={styles.explanationLabel}>
              Answer explanation
            </Typography>
          </div>
          <Typography variant="body3" className={styles.explanationBody}>
            {result.explanation}
          </Typography>
        </div>
      )}
    </AttemptCard>
  );
};

export default QuestionResultCard;
