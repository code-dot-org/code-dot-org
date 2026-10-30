import Checkbox from '@code-dot-org/component-library/checkbox';
import classNames from 'classnames';
import React from 'react';

import {QuizQuestionSummary} from '../../types';
import AttemptCard from '../AttemptCard';
import QuestionDescription from '../QuestionDescription';

import ChoiceLabel from './ChoiceLabel';

import styles from './choice-question-container.module.scss';

export interface MultipleSelectQuestionContainerProps {
  question: Omit<QuizQuestionSummary, 'page'>;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  selectedChoiceIds: string[];
  onToggleChoice: (choiceId: string) => void;
  headingRef?: React.Ref<HTMLHeadingElement>;
  disabled?: boolean;
}

const MultipleSelectQuestionContainer: React.FunctionComponent<
  MultipleSelectQuestionContainerProps
> = ({
  question,
  questionLabel,
  selectedChoiceIds,
  onToggleChoice,
  headingRef,
  disabled,
}) => (
  <AttemptCard
    label={questionLabel}
    title={question.questionTitle}
    headingRef={headingRef}
    description={<QuestionDescription markdown={question.description} />}
  >
    <div
      className={styles.choices}
      role="group"
      aria-label={question.questionTitle}
    >
      {(question.choices ?? []).map((choice, index) => {
        const isSelected = selectedChoiceIds.includes(choice.id);
        return (
          <Checkbox
            key={choice.id}
            name={`question-${question.id}-${choice.id}`}
            value={choice.id}
            checked={isSelected}
            onChange={() => onToggleChoice(choice.id)}
            disabled={disabled}
            className={classNames(
              styles.option,
              isSelected && styles.optionSelected
            )}
          >
            <ChoiceLabel index={index} text={choice.text} />
          </Checkbox>
        );
      })}
    </div>
  </AttemptCard>
);

export default MultipleSelectQuestionContainer;
