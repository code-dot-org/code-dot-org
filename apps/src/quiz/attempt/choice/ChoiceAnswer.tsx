import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import {ChoiceResultStatus} from '../types';

import ChoiceLabel from './ChoiceLabel';

import styles from './choice-answer.module.scss';

export interface ChoiceAnswerOption {
  id: string;
  text: string;
  status: ChoiceResultStatus;
  isSelected: boolean;
  srText?: string;
}

const STATUS_CLASS: Record<ChoiceResultStatus, string> = {
  correct: styles.optionCorrect,
  incorrect: styles.optionIncorrect,
  selected_ungraded: styles.optionSelectedUngraded,
  neutral: styles.optionNeutral,
};

// Not RadioButtons or Checkboxes - these choices are no longer interactive.
const ChoiceAnswer: React.FunctionComponent<{
  indicator: 'radio' | 'checkbox';
  choices: ChoiceAnswerOption[];
}> = ({indicator, choices}) => (
  <ul className={styles.choices}>
    {choices.map(({id, text, status, isSelected, srText}, index) => (
      <li key={id} className={classNames(styles.option, STATUS_CLASS[status])}>
        <div className={styles.optionContent}>
          {indicator === 'radio' ? (
            <div
              className={classNames(
                styles.radio,
                isSelected && styles.radioFilled
              )}
              aria-hidden="true"
            />
          ) : (
            <div
              className={classNames(
                styles.checkbox,
                isSelected && styles.checkboxChecked
              )}
              aria-hidden="true"
            >
              {isSelected && (
                <FontAwesomeV6Icon iconName="check" iconStyle="solid" />
              )}
            </div>
          )}
          <ChoiceLabel
            index={index}
            text={text}
            className={styles.optionText}
          />
        </div>
        {status === 'correct' && (
          <FontAwesomeV6Icon
            iconName="check"
            iconStyle="solid"
            className={styles.correctIcon}
          />
        )}
        {status === 'incorrect' && (
          <FontAwesomeV6Icon
            iconName="xmark"
            iconStyle="solid"
            className={styles.incorrectIcon}
          />
        )}
        {srText && <span className={styles.srOnly}>{srText}</span>}
      </li>
    ))}
  </ul>
);

export default ChoiceAnswer;
