import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {AnswerRecord, isPassed, recordedSelection} from '../../progress';
import {MultipleChoiceQuestion as Question} from '../../types';

import SubmitButton from './SubmitButton';

import styles from './multipleChoiceQuestion.module.scss';
import shared from '../shared.module.scss';

export type Feedback = 'correct' | 'incorrect';

interface MultipleChoiceQuestionProps {
  question: Question;
  record: AnswerRecord | undefined;
  feedback: Feedback | undefined;
  /** True while a correct answer's pause or an exit transition plays. */
  locked: boolean;
  isLast: boolean;
  /** Bumped on every wrong answer so the shake replays. */
  shakeNonce: number;
  /** Moves focus to the question text on mount. */
  focusOnMount: boolean;
  onSelectionChange: () => void;
  onSubmit: (optionIds: string[]) => void;
}

/**
 * One multiple-choice question. Key it by question id: the selection is
 * seeded from the record on mount.
 */
const MultipleChoiceQuestion: React.FunctionComponent<
  MultipleChoiceQuestionProps
> = ({
  question,
  record,
  feedback,
  locked,
  isLast,
  shakeNonce,
  focusOnMount,
  onSelectionChange,
  onSubmit,
}) => {
  const [selectedIds, setSelectedIds] = useState(() =>
    recordedSelection(record)
  );
  const legend = useRef<HTMLLegendElement>(null);
  const passed = isPassed(record);
  const verdict = passed ? 'correct' : feedback;

  useEffect(() => {
    if (focusOnMount) legend.current?.focus();
  }, [focusOnMount]);

  const select = (optionId: string) => {
    setSelectedIds(ids => {
      if (!question.multiSelect) return [optionId];
      return ids.includes(optionId)
        ? ids.filter(id => id !== optionId)
        : [...ids, optionId];
    });
    onSelectionChange();
  };

  const optionClass = (optionId: string) =>
    classNames(
      styles.option,
      selectedIds.includes(optionId) && styles.optionSelected,
      selectedIds.includes(optionId) &&
        verdict === 'correct' &&
        styles.optionCorrect,
      selectedIds.includes(optionId) &&
        verdict === 'incorrect' &&
        styles.optionWrong
    );

  return (
    <>
      <fieldset className={styles.fieldset}>
        <legend ref={legend} tabIndex={-1} className={shared.questionPrompt}>
          {question.text}
        </legend>
        <div
          key={shakeNonce}
          className={classNames(
            styles.questionOptions,
            feedback === 'incorrect' && styles.optionsShake
          )}
        >
          {question.options.map(o => (
            <label key={o.id} className={optionClass(o.id)}>
              <input
                type={question.multiSelect ? 'checkbox' : 'radio'}
                name={question.id}
                value={o.id}
                checked={selectedIds.includes(o.id)}
                disabled={locked || passed}
                onChange={() => select(o.id)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
      {passed && <p className={styles.passedNote}>Answered correctly</p>}
      <SubmitButton
        disabled={selectedIds.length === 0}
        locked={locked}
        onClick={() => onSubmit(selectedIds)}
      >
        {isLast ? 'Finish →' : 'Next →'}
      </SubmitButton>
    </>
  );
};

export default MultipleChoiceQuestion;
