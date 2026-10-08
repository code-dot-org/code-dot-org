import RadioButton from '@code-dot-org/component-library/radioButton';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {QuizQuestionSummary} from '../types';
import {formatChoiceLetter} from '../utils';

import AttemptCard from './AttemptCard';

import styles from './multi-choice-question-container.module.scss';

export interface MultiChoiceQuestionContainerProps {
  question: QuizQuestionSummary;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  selectedChoiceId: string | null;
  onSelectChoice: (choiceId: string) => void;
}

const MultiChoiceQuestionContainer: React.FunctionComponent<
  MultiChoiceQuestionContainerProps
> = ({question, questionLabel, selectedChoiceId, onSelectChoice}) => (
  <AttemptCard label={questionLabel} title={question.questionTitle}>
    <div
      className={styles.choices}
      role="radiogroup"
      aria-label={question.questionTitle}
    >
      {(question.choices ?? []).map((choice, index) => {
        const isSelected = choice.id === selectedChoiceId;
        return (
          <RadioButton
            key={choice.id}
            name={`question-${question.id}`}
            value={choice.id}
            checked={isSelected}
            onChange={() => onSelectChoice(choice.id)}
            className={classNames(
              styles.option,
              isSelected && styles.optionSelected
            )}
          >
            <Typography variant="body2" component="span">
              <span className={styles.optionLetter}>
                {formatChoiceLetter(index)}.
              </span>{' '}
              {choice.text}
            </Typography>
          </RadioButton>
        );
      })}
    </div>
  </AttemptCard>
);

export default MultiChoiceQuestionContainer;
