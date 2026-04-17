import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {FC, useCallback, useState} from 'react';

// import matchJson from '@cdo/static/tutor/match_example.json';
import multiSingleJson from '@cdo/static/tutor/multiple_choice_example.json';
import multiMultiJson from '@cdo/static/tutor/multiple_choice_multi_select.json';
import scrambleJson from '@cdo/static/tutor/scramble_example.json';
// import sortJson from '@cdo/static/tutor/sort_example.json';

import PracticeMultipleChoice from './PracticeMultipleChoice';
import PracticeScramble from './PracticeScramble';
import {LessonDeepDiveData, PracticeProblem} from './types';

import styles from './practice-problems.module.scss';

const PracticeProblems: PracticeProblem[] = [
  multiMultiJson as PracticeProblem,
  multiSingleJson as PracticeProblem,
  scrambleJson as PracticeProblem,
  // matchJson as PracticeProblem,
  // sortJson as PracticeProblem,
];

interface PracticeBoxProps {
  lessonName: string;
  lessonSummary: string;
  vocabulary: LessonDeepDiveData['vocabulary'];
}

const PracticeBox: FC<PracticeBoxProps> = ({
  lessonName,
  lessonSummary,
  vocabulary,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, PracticeProblems.length - 1));
    setIsSubmitted(false);
    setIsCorrect(false);
  }, []);

  const isLast = currentIndex === PracticeProblems.length - 1;

  const renderBox = (index: number) => {
    switch (PracticeProblems[index].type) {
      case 'multiple_choice_single_select':
        return (
          <PracticeMultipleChoice
            problem={PracticeProblems[index]}
            key={PracticeProblems[index].id}
            submitted={isSubmitted}
            submitCallback={setIsSubmitted}
            correctCallback={setIsCorrect}
          />
        );
      case 'multiple_choice_multi_select':
        return (
          <PracticeMultipleChoice
            problem={PracticeProblems[index]}
            key={PracticeProblems[index].id}
            submitted={isSubmitted}
            submitCallback={setIsSubmitted}
            correctCallback={setIsCorrect}
          />
        );
      case 'scramble':
        return (
          <PracticeScramble
            problem={PracticeProblems[index]}
            key={PracticeProblems[index].id}
            submitted={isSubmitted}
            submitCallback={setIsSubmitted}
            correctCallback={setIsCorrect}
          />
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.prompt}>
          <Typography variant="h2" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
            Let's Practice!!
          </Typography>
          <div className={styles.container}>
            <div className={styles.box}>{renderBox(currentIndex)}</div>
            {isSubmitted && (
              <div className={styles.nextButtonContainer}>
                <Typography variant="body1">
                  {isCorrect
                    ? 'Yay!!! You got it right!'
                    : 'Not quite! Do you have any questions?'}
                </Typography>
                {!isLast && (
                  <button
                    type="button"
                    className={styles.nextButton}
                    onClick={goToNext}
                    aria-label="Next"
                  >
                    <Typography variant="body1">Next Question</Typography>
                    <FontAwesomeV6Icon iconName="circle-arrow-right" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeBox;
