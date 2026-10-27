import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {QuizQuestionSummary} from '../types';
import {selectedAnswerLabel} from '../utils';

import ChoiceLabel from './ChoiceLabel';
import {
  ChoiceResultStatus,
  MultipleSelectQuestionResponse,
  QuizQuestionResult,
} from './types';

import styles from './multiple-select-answer.module.scss';

type MultipleSelectResult = QuizQuestionResult & MultipleSelectQuestionResponse;

function getMultipleSelectStatus(
  isSelected: boolean,
  correctChoiceIds: string[] | null,
  choiceId: string
): ChoiceResultStatus {
  // showCorrectness off - still show what was selected, ungraded.
  if (!correctChoiceIds) {
    return isSelected ? 'selected_ungraded' : 'neutral';
  }
  const isCorrectAnswer = correctChoiceIds.includes(choiceId);
  if (isSelected) {
    return isCorrectAnswer ? 'correct' : 'incorrect';
  }
  return isCorrectAnswer ? 'correct' : 'neutral';
}

// Not a Checkbox - these choices are no longer interactive.
const MultipleSelectAnswer: React.FunctionComponent<{
  question: QuizQuestionSummary;
  result: MultipleSelectResult;
  isViewingStudent?: boolean;
}> = ({question, result, isViewingStudent}) => {
  const selectedChoiceIds = result.responseData.selectedChoiceIds ?? [];
  const correctChoiceIds =
    result.correct === null ? null : result.correctChoiceIds ?? null;
  const answerLabel = selectedAnswerLabel(isViewingStudent);

  return (
    <>
      <ul className={styles.choices}>
        {(question.choices ?? []).map((choice, index) => {
          const isSelected = selectedChoiceIds.includes(choice.id);
          const status = getMultipleSelectStatus(
            isSelected,
            correctChoiceIds,
            choice.id
          );

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
                  className={classNames(styles.checkboxVisual, {
                    [styles.checkboxVisualChecked]: isSelected,
                  })}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <FontAwesomeV6Icon iconName="check" iconStyle="solid" />
                  )}
                </div>
                <ChoiceLabel
                  index={index}
                  text={choice.text}
                  className={styles.optionText}
                />
              </div>
              {status === 'correct' && (
                <>
                  <FontAwesomeV6Icon
                    iconName="check"
                    iconStyle="solid"
                    className={styles.correctIcon}
                  />
                  <span className={styles.srOnly}>
                    {isSelected
                      ? `${answerLabel}, correct`
                      : 'Correct answer, not selected'}
                  </span>
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
                    {answerLabel}, incorrect
                  </span>
                </>
              )}
              {status === 'selected_ungraded' && (
                <span className={styles.srOnly}>{answerLabel}</span>
              )}
            </li>
          );
        })}
      </ul>
      {result.correct !== null && !correctChoiceIds && (
        <Typography
          variant="body3"
          component="p"
          className={classNames(
            styles.overallResult,
            result.correct
              ? styles.overallResultCorrect
              : styles.overallResultIncorrect
          )}
        >
          <FontAwesomeV6Icon
            iconName={result.correct ? 'check' : 'xmark'}
            iconStyle="solid"
          />
          {answerLabel} is {result.correct ? 'correct' : 'incorrect'}
        </Typography>
      )}
    </>
  );
};

export default MultipleSelectAnswer;
