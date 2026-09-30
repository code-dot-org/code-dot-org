import classNames from 'classnames';
import React from 'react';

import {Question} from '../../types';

import styles from './questionProgress.module.scss';

interface QuestionProgressProps {
  questions: Question[];
  current: number;
  /** The highest index the student may open. */
  reachable: number;
  disabled: boolean;
  onSelect: (index: number) => void;
}

const QuestionProgress: React.FunctionComponent<QuestionProgressProps> = ({
  questions,
  current,
  reachable,
  disabled,
  onSelect,
}) => (
  <div
    role="group"
    aria-label="Question progress"
    className={styles.questionProgress}
  >
    {questions.map((q, i) => (
      <button
        key={q.id}
        type="button"
        className={classNames(
          i === current && styles.questionDotActive,
          i !== current && i <= reachable && styles.questionDotDone
        )}
        aria-label={`Go to question ${i + 1}`}
        aria-current={i === current ? 'step' : undefined}
        disabled={i > reachable || i === current || disabled}
        onClick={() => onSelect(i)}
      />
    ))}
  </div>
);

export default QuestionProgress;
