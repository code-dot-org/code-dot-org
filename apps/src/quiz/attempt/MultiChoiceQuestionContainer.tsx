import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import RadioButton from '@code-dot-org/component-library/radioButton';
import classNames from 'classnames';
import React from 'react';

import {QuizQuestionSummary} from '../types';

import AttemptCard from './AttemptCard';
import ChoiceLabel from './ChoiceLabel';
import QuestionDescription from './QuestionDescription';

import styles from './choice-question-container.module.scss';

export interface MultiChoiceQuestionContainerProps {
  question: Omit<QuizQuestionSummary, 'page'>;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  selectedChoiceId: string | null;
  onSelectChoice: (choiceId: string) => void;
  // Grades the selected choice in place, for a student retrying a question.
  // This is used for FE grading, while Quiz backed levels will handle grading on the server.
  // Therefore quiz backed levels should be used for most evaluation scenarios.
  selectedChoiceStatus?: 'correct' | 'incorrect';
  headingRef?: React.Ref<HTMLHeadingElement>;
  disabled?: boolean;
  /**
   * A typed answer offered after the choices under its own id, picked by
   * its radio or by typing.
   */
  other?: {
    id: string;
    placeholder?: string;
    text: string;
    onChangeText: (text: string) => void;
  };
}

const MultiChoiceQuestionContainer: React.FunctionComponent<
  MultiChoiceQuestionContainerProps
> = ({
  question,
  questionLabel,
  selectedChoiceId,
  onSelectChoice,
  selectedChoiceStatus,
  headingRef,
  disabled,
  other,
}) => (
  <AttemptCard
    label={questionLabel}
    title={question.questionTitle}
    headingRef={headingRef}
    description={<QuestionDescription markdown={question.description} />}
  >
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
            disabled={disabled}
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
            <ChoiceLabel index={index} text={choice.text} />
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
      {other && (
        <RadioButton
          name={`question-${question.id}`}
          value={other.id}
          checked={other.id === selectedChoiceId}
          onChange={() => onSelectChoice(other.id)}
          disabled={disabled}
          className={classNames(
            styles.option,
            other.id === selectedChoiceId && styles.optionSelected
          )}
        >
          <ChoiceLabel index={question.choices?.length ?? 0} text="Other" />
        </RadioButton>
      )}
    </div>
    {other && (
      <input
        type="text"
        className={styles.otherInput}
        aria-label={other.placeholder ?? 'Your own answer'}
        placeholder={other.placeholder}
        value={other.text}
        disabled={disabled}
        onChange={e => {
          other.onChangeText(e.target.value);
          if (other.id !== selectedChoiceId) onSelectChoice(other.id);
        }}
      />
    )}
  </AttemptCard>
);

export default MultiChoiceQuestionContainer;
