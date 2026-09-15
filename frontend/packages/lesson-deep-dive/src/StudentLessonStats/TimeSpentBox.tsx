import {type FC, useEffect, useState} from 'react';

import RecapStoryCard from '../RecapStoryCard';

import styles from './stat-card.module.scss';

const ANIMATION_DURATION_MS = 1200;

interface TimeSpentBoxProps {
  gradient: string;
  headline: string;
  headlineFirst: boolean;
  headlineAlign?: 'left' | 'right';
  lessonName: string;
  timeSpentSeconds: number;
  autoAdvanceDurationMs: number;
  currentSlide: number;
  totalSlides: number;
  onNext?: () => void;
}

const TimeSpentBox: FC<TimeSpentBoxProps> = ({
  gradient,
  headline,
  headlineFirst,
  headlineAlign = 'left',
  lessonName,
  timeSpentSeconds,
  autoAdvanceDurationMs,
  currentSlide,
  totalSlides,
  onNext,
}) => {
  const totalMinutes = Math.round(timeSpentSeconds / 60);
  const [displayMinutes, setDisplayMinutes] = useState(0);

  useEffect(() => {
    if (totalMinutes === 0) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayMinutes(Math.round(eased * totalMinutes));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [totalMinutes]);

  return (
    <RecapStoryCard
      gradient={gradient}
      lessonLabel={`${lessonName} Recap`}
      autoAdvanceDurationMs={autoAdvanceDurationMs}
      currentSlide={currentSlide}
      totalSlides={totalSlides}
      onSkip={onNext}
    >
      <div className={styles.body}>
        {headlineFirst && (
          <h2
            className={`${styles.headline} ${headlineAlign === 'right' ? styles.headlineRight : ''}`}
          >
            {headline}
          </h2>
        )}
        <div className={styles.metricRow}>
          <div className={styles.bigNumber}>{displayMinutes}</div>
          <p className={styles.caption}>
            minutes
            <br />
            working
          </p>
        </div>
        {!headlineFirst && (
          <h2
            className={`${styles.headline} ${headlineAlign === 'right' ? styles.headlineRight : ''}`}
          >
            {headline}
          </h2>
        )}
      </div>
    </RecapStoryCard>
  );
};

export default TimeSpentBox;
