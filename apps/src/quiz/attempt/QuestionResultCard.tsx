import {Typography} from '@mui/material';
import React from 'react';

import {QuizQuestionSummary} from '../types';

import AttemptCard from './AttemptCard';
import FreeResponseAnswer from './FreeResponseAnswer';
import MultipleChoiceAnswer from './MultipleChoiceAnswer';
import MultipleSelectAnswer from './MultipleSelectAnswer';
import QuestionDescription from './QuestionDescription';
import SkippedTag from './SkippedTag';
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
  // A teacher viewing a student's attempt; the selected answer is the student's.
  isViewingStudent?: boolean;
}

function isSkipped(result: QuizQuestionResult): boolean {
  if (isFreeResponseResponse(result)) {
    return !result.responseData.answerText;
  }
  if (isMultipleChoiceResponse(result)) {
    return !result.responseData.selectedChoiceId;
  }
  if (isMultipleSelectResponse(result)) {
    return !result.responseData.selectedChoiceIds?.length;
  }
  return false;
}

// Read-only review of one submitted question, graded or not.
const QuestionResultCard: React.FunctionComponent<QuestionResultCardProps> = ({
  question,
  questionLabel,
  result,
  revealAnswerExplanation,
  isViewingStudent,
}) => (
  <AttemptCard
    label={questionLabel}
    tag={isSkipped(result) && <SkippedTag isGraded={result.correct !== null} />}
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

export default QuestionResultCard;
