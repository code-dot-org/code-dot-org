import React, {FC, useCallback, useState} from 'react';

import experiments from '@cdo/apps/util/experiments';

import InterventionBox from './InterventionBox';
import LessonSummaryBox from './LessonSummaryBox';
import ReflectionBox from './ReflectionBox';
import TutorSummaryBox from './TutorSummaryBox';

import styles from './lesson-deep-dive-container.module.scss';

const BOXES = [
  {id: 'lesson-summary', content: <LessonSummaryBox />},
  {id: 'reflection', content: <ReflectionBox />},
  {id: 'intervention', content: <InterventionBox />},
  {id: 'tutor-summary', content: <TutorSummaryBox />},
];

const LessonDeepDiveContainer: FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, BOXES.length - 1));
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  if (!experiments.isEnabled(experiments.LESSON_TUTOR)) {
    return null;
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === BOXES.length - 1;

  return (
    <div className={styles.container}>
      <div className={styles.box}>{BOXES[currentIndex].content}</div>

      <div className={styles.navigation}>
        {!isFirst && (
          <button
            type="button"
            className={styles.arrowButton}
            onClick={goToPrev}
            aria-label="Previous"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 14l5-5 5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {!isLast && (
          <button
            type="button"
            className={styles.arrowButton}
            onClick={goToNext}
            aria-label="Next"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonDeepDiveContainer;
