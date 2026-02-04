import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import RadioButton from '@code-dot-org/component-library/radioButton';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {
  CFULevel,
  CFULevelResponseResponse,
  CFUMultipleLevelAnswer,
} from '../../types';

import styles from './studentCFUAnswers.module.scss';

interface CFUMultiAnswerProps {
  answers: CFUMultipleLevelAnswer[];
  level: CFULevel;
  response: CFULevelResponseResponse;
}

const LETTERS_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const CFUMultiAnswer: React.FC<CFUMultiAnswerProps> = ({answers, response}) => {
  const studentResult = response?.student_result;
  const selectedIndex =
    Array.isArray(studentResult) && studentResult.length > 0
      ? studentResult[0]
      : null;

  return (
    <div className={styles.multiAnswerContainer}>
      {answers.map((answer, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = answer.correct;

        // Determine styling classes
        let optionCorrectnessClass = '';
        if (isSelected) {
          optionCorrectnessClass = isCorrect
            ? ` ${styles.multiAnswerOptionCorrect}`
            : ` ${styles.multiAnswerOptionIncorrect}`;
        }

        return (
          <div
            key={`${answer.text}-${index}`}
            className={classNames(
              styles.multiAnswerOption,
              optionCorrectnessClass
            )}
          >
            <RadioButton
              checked={isSelected}
              value={answer.text}
              onChange={() => null}
              name={answer.text}
              size="s"
              aria-disabled
            >
              <Typography variant="body4">{LETTERS_LABELS[index]}.</Typography>
              <SafeMarkdown unwrapped markdown={answer.text} />
              {isCorrect && (
                <FontAwesomeV6Icon
                  iconName="check"
                  iconStyle="solid"
                  className={classNames(
                    styles.multiAnswerIcon,
                    styles.multiAnswerIconCorrect
                  )}
                />
              )}
              {isSelected && !isCorrect && (
                <FontAwesomeV6Icon
                  iconName="xmark"
                  iconStyle="solid"
                  className={classNames(
                    styles.multiAnswerIcon,
                    styles.multiAnswerIconIncorrect
                  )}
                />
              )}
            </RadioButton>
          </div>
        );
      })}
    </div>
  );
};

export default CFUMultiAnswer;
