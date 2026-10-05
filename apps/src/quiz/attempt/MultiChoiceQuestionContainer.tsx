import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import RadioButton from '@code-dot-org/component-library/radioButton';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {QuizQuestionSummary} from '../types';
import {formatChoiceLetter} from '../utils';

import AttemptCard from './AttemptCard';

import styles from './multi-choice-question-container.module.scss';

export interface MultiChoiceQuestionContainerProps {
  question: Pick<QuizQuestionSummary, 'id' | 'stem' | 'choices'>;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  selectedChoiceId: string | null;
  onSelectChoice: (choiceId: string) => void;
  // Grades the selected choice in place, for a student retrying a question.
  selectedChoiceStatus?: 'correct' | 'incorrect';
}

const MultiChoiceQuestionContainer: React.FunctionComponent<
  MultiChoiceQuestionContainerProps
> = ({
  question,
  questionLabel,
  selectedChoiceId,
  onSelectChoice,
  selectedChoiceStatus,
}) => (
  <AttemptCard label={questionLabel} title={question.stem}>
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
              isSelected && styles.optionSelected,
              isSelected &&
                selectedChoiceStatus === 'correct' &&
                styles.optionCorrect,
              isSelected &&
                selectedChoiceStatus === 'incorrect' &&
                styles.optionIncorrect
            )}
          >
            <Typography variant="body2" component="span">
              <span className={styles.optionLetter}>
                {formatChoiceLetter(index)}.
              </span>{' '}
              {choice.text}
            </Typography>
            {isSelected && selectedChoiceStatus && (
              <>
                <FontAwesomeV6Icon
                  iconName={
                    selectedChoiceStatus === 'correct' ? 'check' : 'xmark'
                  }
                  iconStyle="solid"
                  className={styles.statusIcon}
                />
                <span className={styles.srOnly}>
                  {selectedChoiceStatus === 'correct' ? 'Correct' : 'Incorrect'}
                </span>
              </>
            )}
          </RadioButton>
        );
      })}
    </div>
  </AttemptCard>
);

export default MultiChoiceQuestionContainer;
