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

// Read-only review of one submitted question, graded or not. Not a
// RadioButton - these choices are no longer interactive.
const QuestionResultCard: React.FunctionComponent<QuestionResultCardProps> = ({
  question,
  questionLabel,
  result,
  revealAnswerExplanation,
}) => (
  <AttemptCard label={questionLabel} title={question.stem}>
    <ul className={styles.choices}>
      {(question.choices ?? []).map((choice, index) => {
        const isSelectedChoice = choice.id === result.selectedChoiceId;
        const isCorrectChoice =
          choice.id === result.correctChoiceId ||
          (result.correct === true && isSelectedChoice);
        const isIncorrectSelection =
          result.correct === false && isSelectedChoice;
        // showCorrectness off - still show what was picked, ungraded.
        const isUngradedSelection = result.correct === null && isSelectedChoice;

        return (
          <li
            key={choice.id}
            className={classNames(styles.option, {
              [styles.optionCorrect]: isCorrectChoice,
              [styles.optionIncorrect]: isIncorrectSelection,
              [styles.optionSelectedUngraded]: isUngradedSelection,
              [styles.optionNeutral]:
                !isCorrectChoice &&
                !isIncorrectSelection &&
                !isUngradedSelection,
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
            {isCorrectChoice && (
              <>
                <FontAwesomeV6Icon
                  iconName="check"
                  iconStyle="solid"
                  className={styles.correctIcon}
                />
                <span className={styles.srOnly}>Correct answer</span>
              </>
            )}
            {isIncorrectSelection && (
              <>
                <FontAwesomeV6Icon
                  iconName="xmark"
                  iconStyle="solid"
                  className={styles.incorrectIcon}
                />
                <span className={styles.srOnly}>Your answer, incorrect</span>
              </>
            )}
            {isUngradedSelection && (
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
