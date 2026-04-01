import React, {FC, useCallback, useState} from 'react';

import experiments from '@cdo/apps/util/experiments';

import InterventionBox from './InterventionBox';
import LessonSummaryBox from './LessonSummaryBox';
import ReflectionBox from './ReflectionBox';
import TutorSummaryBox from './TutorSummaryBox';
import {LessonDeepDiveData} from './types';

import styles from './lesson-deep-dive-container.module.scss';

const BOX_IDS = [
  'lesson-summary',
  'reflection',
  'intervention',
  'tutor-summary',
] as const;

interface LessonDeepDiveContainerProps {
  lessonDeepDiveData: LessonDeepDiveData;
}

const LessonDeepDiveContainer: FC<LessonDeepDiveContainerProps> = ({
  lessonDeepDiveData,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, BOX_IDS.length - 1));
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  if (!experiments.isEnabled(experiments.LESSON_TUTOR)) {
    return null;
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === BOX_IDS.length - 1;

  const renderBox = () => {
    switch (BOX_IDS[currentIndex]) {
      case 'lesson-summary':
        return (
          <LessonSummaryBox
            lessonName={lessonDeepDiveData.lessonName}
            lessonSummary={lessonDeepDiveData.lessonSummary}
          />
        );
      case 'reflection':
        return <ReflectionBox objectives={lessonDeepDiveData.objectives} />;
      case 'intervention':
        return (
          <InterventionBox
            lessonName={lessonDeepDiveData.lessonName}
            lessonSummary={lessonDeepDiveData.lessonSummary}
            vocabulary={lessonDeepDiveData.vocabulary}
          />
        );
      case 'tutor-summary':
        return <TutorSummaryBox />;
    }
  };
  return (
    <div className={styles.container}>
      {!isFirst && (
        <div className={styles.topNav}>
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
        </div>
      )}

      <div className={styles.box}>{renderBox()}</div>

      {!isLast && (
        <div className={styles.bottomNav}>
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
        </div>
      )}
    </div>
  );
};

export default LessonDeepDiveContainer;
