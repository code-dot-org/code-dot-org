import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {FC, useState} from 'react';

import {
  MatchSolution,
  MultiSolution,
  PracticeProblem,
  PracticeProblemTypes,
  ScrambleSolution,
} from '../../types';

import multiChoiceStyles from './multiple-choice.module.scss';
import styles from './question.module.scss';

interface PracticeMultipleChoiceProps {
  problem: PracticeProblem;
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  correctCallback: React.Dispatch<React.SetStateAction<boolean>>;
  studentAnswerCallback: React.Dispatch<
    React.SetStateAction<
      (MultiSolution | ScrambleSolution | MatchSolution)[] | null
    >
  >;
}

const PracticeMultipleChoice: FC<PracticeMultipleChoiceProps> = ({
  problem,
  submitted,
  submitCallback,
  correctCallback,
  studentAnswerCallback,
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const checkIsCorrect = () => {
    const correctOptions = new Set(
      problem.solution.filter(s => s.correct).map(s => s.option)
    );
    const selectedSet = new Set(selected);
    return (
      correctOptions.size === selectedSet.size &&
      [...correctOptions].every(x => selectedSet.has(x))
    );
  };

  const handleOptionClick = (option: string) => {
    if (problem.type === PracticeProblemTypes.MULTI_SINGLE) {
      setSelected([option]);
    } else if (problem.type === PracticeProblemTypes.MULTI_MULTI) {
      setSelected(prev =>
        prev.includes(option)
          ? prev.filter(o => o !== option)
          : [...prev, option]
      );
    }
  };

  const handleSubmit = () => {
    submitCallback(true);
    correctCallback(checkIsCorrect());
    studentAnswerCallback(
      problem.solution.map(s => ({
        option: s.option,
        correct: selected.includes(s.option),
      }))
    );
  };

  return (
    <div>
      <div className={styles.questionText}>{problem.problem_text}</div>
      <ul className={multiChoiceStyles.optionsContainer}>
        {problem.solution.map((solution, index) => {
          const isSelected = selected.includes(solution.option);
          const showCorrect = submitted && solution.correct;
          const showIncorrect = submitted && isSelected && !solution.correct;
          return (
            <li key={index}>
              <button
                type="button"
                className={[
                  multiChoiceStyles.card,
                  isSelected && !submitted
                    ? multiChoiceStyles.cardselected
                    : '',
                  showCorrect ? multiChoiceStyles.cardcorrect : '',
                  showIncorrect ? multiChoiceStyles.cardincorrect : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={submitted}
                onClick={() => handleOptionClick(solution.option)}
                aria-pressed={isSelected}
              >
                <Typography
                  variant="body1"
                  className={multiChoiceStyles.cardLabel}
                >
                  {solution.option}
                </Typography>
                {showCorrect && (
                  <span className={multiChoiceStyles.correctIcon}>
                    <FontAwesomeV6Icon iconName="check" />
                  </span>
                )}
                {showIncorrect && (
                  <span className={multiChoiceStyles.incorrectIcon}>
                    <FontAwesomeV6Icon iconName="xmark" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className={styles.submitButton}
        disabled={selected.length === 0 || submitted}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default PracticeMultipleChoice;
