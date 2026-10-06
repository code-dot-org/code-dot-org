import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {QuizQuestionSummary} from '../types';
import {formatChoiceLetter} from '../utils';

import AttemptCard from './AttemptCard';
import {QuizQuestionResult} from './types';

import styles from './question-result-card.module.scss';

export interface QuestionResultCardProps {
  question: QuizQuestionSummary;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  result: QuizQuestionResult;
  revealAnswerExplanation?: boolean;
}

type ChoiceStatus = 'correct' | 'incorrect' | 'selected_ungraded' | 'neutral';

function getChoiceStatus(
  choiceId: string,
  result: QuizQuestionResult
): ChoiceStatus {
  const isSelected = choiceId === result.selectedChoiceId;
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

// Read-only review of one submitted question, graded or not. Not a
// RadioButton - these choices are no longer interactive.
const QuestionResultCard: React.FunctionComponent<QuestionResultCardProps> = ({
  question,
  questionLabel,
  result,
  revealAnswerExplanation,
}) => (
  <AttemptCard label={questionLabel} title={question.questionTitle}>
    <ul className={styles.choices}>
      {(question.choices ?? []).map((choice, index) => {
        const status = getChoiceStatus(choice.id, result);
        const isSelectedChoice = choice.id === result.selectedChoiceId;

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
                <span className={styles.srOnly}>Your answer, incorrect</span>
              </>
            )}
            {status === 'selected_ungraded' && (
              <span className={styles.srOnly}>Your answer</span>
            )}
          </li>
        );
      })}
    </ul>
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
