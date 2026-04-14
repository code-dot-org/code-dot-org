import {createTheme, ThemeProvider} from '@mui/material/styles';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import experiments from '@cdo/apps/util/experiments';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1c1c1c',
    },
    text: {
      primary: '#e8e8f2',
      secondary: '#9898b8',
    },
    primary: {
      main: '#6b9fd4',
    },
    divider: '#242424',
  },
});

import InterventionBox from './InterventionBox';
import LessonSummaryBox from './LessonSummaryBox';
import PracticeBox from './PracticeBox';
import ReflectionBox from './ReflectionBox';
import TutorSummaryBox from './TutorSummaryBox';
import {LessonDeepDiveData, ReflectionData} from './types';
import WelcomeBox from './WelcomeBox';

import styles from './lesson-deep-dive-container.module.scss';

const FizzyButton: FC<{
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}> = ({onClick, ariaLabel, children}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createBubble = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.random() * 9 + 4;
    const bubble = document.createElement('span');
    bubble.className = styles.fizzBubble;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${rect.left + Math.random() * rect.width}px`;
    bubble.style.top = `${rect.bottom - size}px`;
    bubble.style.animationDuration = `${Math.random() * 1.8 + 1.2}s`;
    bubble.style.setProperty('--fizz-drift', `${(Math.random() - 0.5) * 50}px`);
    const hue = Math.random() * 360;
    bubble.style.background = `radial-gradient(circle at 30% 30%, hsl(${hue}, 100%, 88%), hsl(${hue}, 80%, 55%))`;
    document.body.appendChild(bubble);
    bubble.addEventListener('animationend', () => bubble.remove(), {
      once: true,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    createBubble();
    intervalRef.current = setInterval(createBubble, 80);
  }, [createBubble]);

  const handleMouseLeave = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    },
    []
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`${styles.arrowButton} ${styles.fizzyButton}`}
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};

const BOX_IDS = [
  'welcome',
  'lesson-summary',
  'reflection',
  'intervention',
  'practice',
  'tutor-summary',
] as const;

interface LessonDeepDiveContainerProps {
  lessonDeepDiveData: LessonDeepDiveData;
}

const LessonDeepDiveContainer: FC<LessonDeepDiveContainerProps> = ({
  lessonDeepDiveData,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reflectionData, setReflectionData] = useState<ReflectionData | null>(
    null
  );

  const goToNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, BOX_IDS.length - 1));
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  const handleReflectionComplete = useCallback((data: ReflectionData) => {
    setReflectionData(data);
  }, []);

  if (!experiments.isEnabled(experiments.LESSON_TUTOR)) {
    return null;
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === BOX_IDS.length - 1;

  const renderBox = () => {
    switch (BOX_IDS[currentIndex]) {
      case 'welcome':
        return <WelcomeBox />;
      case 'lesson-summary':
        return (
          <LessonSummaryBox
            lessonName={lessonDeepDiveData.lessonName}
            lessonSummary={lessonDeepDiveData.lessonSummary}
          />
        );
      case 'reflection':
        return (
          <ReflectionBox
            lessonId={lessonDeepDiveData.lessonId}
            objectives={lessonDeepDiveData.objectives}
            onSubmitComplete={handleReflectionComplete}
            initialValues={reflectionData}
          />
        );
      case 'intervention':
        return (
          <InterventionBox
            lessonId={lessonDeepDiveData.lessonId}
            lessonName={lessonDeepDiveData.lessonName}
            lessonSummary={lessonDeepDiveData.lessonSummary}
            vocabulary={lessonDeepDiveData.vocabulary}
            objectives={lessonDeepDiveData.objectives}
            reflectionData={reflectionData}
          />
        );
      case 'practice':
        return (
          <PracticeBox
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
    <ThemeProvider theme={darkTheme}>
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
            <FizzyButton onClick={goToNext} ariaLabel="Next">
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
            </FizzyButton>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default LessonDeepDiveContainer;
