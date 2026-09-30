import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

import styles from './multipleChoiceQuestion.module.scss';
import shared from '../shared.module.scss';

export type Feedback = 'correct' | 'incorrect';

// The first four props match quiz's MultiChoiceQuestionContainer, so it can
// replace this component; the rest are what that one lacks.
interface MultipleChoiceQuestionProps {
  question: QuizQuestionSummary;
  /** Unused here; kept for parity with MultiChoiceQuestionContainer. */
  questionLabel?: string;
  selectedChoiceId: string | null;
  onSelectChoice: (choiceId: string) => void;
  /** Tints the selected choice. */
  verdict: Feedback | undefined;
  disabled: boolean;
  /** Bumped on every wrong answer so the shake replays. */
  shakeNonce: number;
  /** Moves focus to the question text on mount. */
  focusOnMount: boolean;
}

/** One multiple-choice question's stem and choices. */
const MultipleChoiceQuestion: React.FunctionComponent<
  MultipleChoiceQuestionProps
> = ({
  question,
  selectedChoiceId,
  onSelectChoice,
  verdict,
  disabled,
  shakeNonce,
  focusOnMount,
}) => {
  const legend = useRef<HTMLLegendElement>(null);

  useEffect(() => {
    if (focusOnMount) legend.current?.focus();
  }, [focusOnMount]);

  const choiceClass = (choiceId: string) => {
    const selected = choiceId === selectedChoiceId;
    return classNames(
      styles.option,
      selected && styles.optionSelected,
      selected && verdict === 'correct' && styles.optionCorrect,
      selected && verdict === 'incorrect' && styles.optionWrong
    );
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend ref={legend} tabIndex={-1} className={shared.questionPrompt}>
        {question.stem}
      </legend>
      <div
        key={shakeNonce}
        className={classNames(
          styles.questionOptions,
          verdict === 'incorrect' && styles.optionsShake
        )}
      >
        {(question.choices ?? []).map(choice => (
          <label key={choice.id} className={choiceClass(choice.id)}>
            <input
              type="radio"
              name={`question-${question.id}`}
              value={choice.id}
              checked={choice.id === selectedChoiceId}
              disabled={disabled}
              onChange={() => onSelectChoice(choice.id)}
            />
            {choice.text}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default MultipleChoiceQuestion;
