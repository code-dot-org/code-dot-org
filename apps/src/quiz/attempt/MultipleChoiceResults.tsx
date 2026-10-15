import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {QuizQuestionSummary} from '../types';
import {formatChoiceLetter, selectedAnswerLabel} from '../utils';

import {MultipleChoiceQuestionResponse, QuizQuestionResult} from './types';

import styles from './multiple-choice-results.module.scss';

type MultipleChoiceStatus =
  | 'correct'
  | 'incorrect'
  | 'selected_ungraded'
  | 'neutral';

type MultipleChoiceResult = QuizQuestionResult & MultipleChoiceQuestionResponse;

function getMultipleChoiceStatus(
  choiceId: string,
  result: MultipleChoiceResult
): MultipleChoiceStatus {
  const isSelected = choiceId === result.responseData.selectedChoiceId;
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
  result: MultipleChoiceResult;
  isViewingStudent?: boolean;
}> = ({question, result, isViewingStudent}) => (
  <ul className={styles.choices}>
    {(question.choices ?? []).map((choice, index) => {
      const status = getMultipleChoiceStatus(choice.id, result);
      const isSelectedChoice =
        choice.id === result.responseData.selectedChoiceId;

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

export default MultipleChoiceResults;
