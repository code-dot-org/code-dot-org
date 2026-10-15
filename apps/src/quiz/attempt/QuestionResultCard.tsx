import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {QuizQuestionSummary} from '../types';
import {formatChoiceLetter} from '../utils';

import AttemptCard from './AttemptCard';
import QuestionDescription from './QuestionDescription';
import {
  isFreeResponseResponse,
  isMultipleChoiceResponse,
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

function selectedAnswerLabel(isViewingStudent?: boolean): string {
  return isViewingStudent ? "Student's answer" : 'Your answer';
}

type MultipleChoiceStatus =
  | 'correct'
  | 'incorrect'
  | 'selected_ungraded'
  | 'neutral';

function selectedChoiceIdOf(result: QuizQuestionResult): string | null {
  return isMultipleChoiceResponse(result)
    ? result.responseData.selectedChoiceId ?? null
    : null;
}

function answerTextOf(result: QuizQuestionResult): string | null {
  return isFreeResponseResponse(result)
    ? result.responseData.answerText ?? null
    : null;
}

function getMultipleChoiceStatus(
  choiceId: string,
  result: QuizQuestionResult
): MultipleChoiceStatus {
  const isSelected = choiceId === selectedChoiceIdOf(result);
  const isCorrectAnswer = choiceId === result.correctChoiceId;

  // showCorrectness off - still show what was picked, ungraded.
  if (result.correct === null) {
    return isSelected ? 'selected_ungraded' : 'neutral';
  }

  // showCorrectness is on.
  if (isSelected) {
    return result.correct ? 'correct' : 'incorrect';
  }
  return isCorrectAnswer ? 'correct' : 'neutral';
}

// Not a RadioButton - these choices are no longer interactive.
const MultipleChoiceResults: React.FunctionComponent<{
  question: QuizQuestionSummary;
  result: QuizQuestionResult;
  isViewingStudent?: boolean;
}> = ({question, result, isViewingStudent}) => (
  <ul className={styles.choices}>
    {(question.choices ?? []).map((choice, index) => {
      const status = getMultipleChoiceStatus(choice.id, result);
      const isSelectedChoice = choice.id === selectedChoiceIdOf(result);

      return (
        <li
          key={choice.id}
          className={classNames(styles.option, {
            [styles.optionCorrect]: status === 'correct',
            [styles.optionIncorrect]: status === 'incorrect',
            [styles.optionSelectedUngraded]: status === 'selected_ungraded',
            [styles.optionNeutral]: status === 'neutral',
          })}
        >
          <div className={styles.optionContent}>
            <div
              className={classNames(styles.radioVisual, {
                [styles.radioVisualFilled]: isSelectedChoice,
              })}
              aria-hidden="true"
            />
            <Typography
              variant="body2"
              component="span"
              className={styles.optionText}
            >
              <span className={styles.optionLetter}>
                {formatChoiceLetter(index)}.
              </span>{' '}
              {choice.text}
            </Typography>
          </div>
          {status === 'correct' && (
            <>
              <FontAwesomeV6Icon
                iconName="check"
                iconStyle="solid"
                className={styles.correctIcon}
              />
              <span className={styles.srOnly}>Correct answer</span>
            </>
          )}
          {status === 'incorrect' && (
            <>
              <FontAwesomeV6Icon
                iconName="xmark"
                iconStyle="solid"
                className={styles.incorrectIcon}
              />
              <span className={styles.srOnly}>
                {selectedAnswerLabel(isViewingStudent)}, incorrect
              </span>
            </>
          )}
          {status === 'selected_ungraded' && (
            <span className={styles.srOnly}>
              {selectedAnswerLabel(isViewingStudent)}
            </span>
          )}
        </li>
      );
    })}
  </ul>
);

const FreeResponseAnswer: React.FunctionComponent<{
  answerText: string | null;
  isViewingStudent?: boolean;
}> = ({answerText, isViewingStudent}) => (
  <div className={styles.freeResponseAnswer}>
    <Typography variant="overline2" className={styles.freeResponseLabel}>
      {selectedAnswerLabel(isViewingStudent)}
    </Typography>
    {answerText ? (
      <Typography variant="body2" className={styles.freeResponseText}>
        {answerText}
      </Typography>
    ) : (
      <Typography variant="body2" className={styles.freeResponseEmpty}>
        No answer
      </Typography>
    )}
  </div>
);

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
    title={question.questionTitle}
    description={<QuestionDescription markdown={question.description} />}
  >
    {question.type === 'FreeResponseQuestion' ? (
      <FreeResponseAnswer
        answerText={answerTextOf(result)}
        isViewingStudent={isViewingStudent}
      />
    ) : (
      <MultipleChoiceResults
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
