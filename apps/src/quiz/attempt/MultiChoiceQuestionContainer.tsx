import RadioButton from '@code-dot-org/component-library/radioButton';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {QuizQuestionSummary} from '../types';

import AttemptCard from './AttemptCard';

import styles from './multi-choice-question-container.module.scss';

export interface MultiChoiceQuestionContainerProps {
  question: QuizQuestionSummary;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  selectedChoiceId: string | null;
  onSelectChoice: (choiceId: string) => void;
}

const CHOICE_LETTERS = 'ABCDEFGHIJ';

const MultiChoiceQuestionContainer: React.FunctionComponent<
  MultiChoiceQuestionContainerProps
> = ({question, questionLabel, selectedChoiceId, onSelectChoice}) => (
  <AttemptCard questionLabel={questionLabel} title={question.stem}>
    <div
      className={styles.choices}
      role="radiogroup"
      aria-label={question.stem}
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
                {CHOICE_LETTERS[index]}.
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
