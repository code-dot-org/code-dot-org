import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
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

interface CFUMatchAnswerProps {
  level: CFULevel;
  response: CFULevelResponseResponse;
}

const CFUMatchAnswer: React.FC<CFUMatchAnswerProps> = ({level, response}) => {
  const flatAnswers: CFUMultipleLevelAnswer[] = (level.answers ||
    []) as CFUMultipleLevelAnswer[];
  const options: string[] = (level.options || []).map(option =>
    typeof option === 'string' ? option : ''
  );

  const rawStudentResult = response.student_result;

  const studentOrder: number[] | null = Array.isArray(rawStudentResult)
    ? rawStudentResult
    : null;

  return (
    <div className={styles.matchAnswerContainer}>
      {options.map((optionText, index) => {
        const answerIndex = studentOrder && studentOrder[index];
        const answer = answerIndex !== null && flatAnswers[answerIndex];
        const isCorrect = answer && answerIndex === index;

        return (
          <div key={optionText} className={styles.matchingAnswerPairContainer}>
            <div
              className={classNames(styles.matchingAnswerOptionContainer, {
                [styles.correctOptionMatch]: answer && isCorrect,
                [styles.incorrectOptionMatch]: answer && !isCorrect,
              })}
            >
              <div>
                <SafeMarkdown markdown={optionText} unwrapped />
              </div>
              {isCorrect && (
                <FontAwesomeV6Icon
                  iconName="check"
                  iconStyle="solid"
                  className={classNames(
                    styles.answerIcon,
                    styles.answerIconCorrect
                  )}
                />
              )}
              {answer && !isCorrect && (
                <FontAwesomeV6Icon
                  iconName="xmark"
                  iconStyle="solid"
                  className={classNames(
                    styles.answerIcon,
                    styles.answerIconIncorrect
                  )}
                />
              )}
            </div>
            {!answer && (
              <div
                className={classNames(
                  styles.matchingAnswerOptionContainer,
                  styles.notAnsweredOption
                )}
              >
                <Typography variant="h3" component="p">
                  ?
                </Typography>
              </div>
            )}

            <div className={styles.matchingAnswerOptionContainer}>
              <SafeMarkdown
                markdown={answer ? answer.text : flatAnswers[index].text}
                unwrapped
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CFUMatchAnswer;
