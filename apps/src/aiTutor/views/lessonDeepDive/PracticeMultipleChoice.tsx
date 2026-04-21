import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useState} from 'react';

import {PracticeProblem, PracticeProblemTypes} from './types';

import styles from './practice-problems.module.scss';

interface PracticeMultipleChoiceProps {
  problem: PracticeProblem;
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  correctCallback: React.Dispatch<React.SetStateAction<boolean>>;
}

const PracticeMultipleChoice: FC<PracticeMultipleChoiceProps> = ({
  problem,
  submitted,
  submitCallback,
  correctCallback,
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const isCorrect = () => {
    const correctOptions = new Set(
      problem.solution
        .filter(solution => solution.correct)
        .map(solution => solution.option)
    );
    const selectedSet = new Set(selected);
    return (
      correctOptions.size === selectedSet.size &&
      [...correctOptions].every(x => selectedSet.has(x))
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.prompt}>
          <Typography variant="h4" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
            {problem.problem_text}
          </Typography>
          <div className={styles.optionsContainer}>
            {problem.solution.map((solution, index) => (
              <button
                key={index}
                type="button"
                className={classNames([
                  `${styles.card}`,
                  selected.includes(solution.option) && !submitted
                    ? styles.cardselected
                    : null,
                  submitted && solution.correct ? styles.cardcorrect : null,
                  selected.includes(solution.option) &&
                  submitted &&
                  !solution.correct
                    ? styles.cardincorrect
                    : null,
                ])}
                disabled={submitted}
                onClick={() => {
                  if (problem.type === PracticeProblemTypes.MULTI_SINGLE) {
                    setSelected([solution.option]);
                  } else if (
                    problem.type === PracticeProblemTypes.MULTI_MULTI
                  ) {
                    if (selected && selected.includes(solution.option)) {
                      setSelected(selected.filter(s => s !== solution.option));
                    } else {
                      setSelected([...selected, solution.option]);
                    }
                  }
                }}
                aria-label={solution.option}
              >
                <Typography variant="body1" className={styles.cardLabel}>
                  {solution.option}
                </Typography>
              </button>
            ))}
            <button
              type="button"
              disabled={selected.length === 0 && !submitted}
              onClick={() => {
                submitCallback(true);
                correctCallback(isCorrect);
              }}
            >
              <Typography variant="body1" className={styles.cardLabel}>
                Submit
              </Typography>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeMultipleChoice;
