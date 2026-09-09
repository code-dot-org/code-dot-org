import {type FC, useEffect, useState} from 'react';

import RecapStoryCard from '../RecapStoryCard';

import styles from './time-spent-box.module.scss';

const ANIMATION_DURATION_MS = 1200;

interface TimeSpentBoxProps {
  lessonName: string;
  timeSpentSeconds: number;
  currentSlide: number;
  totalSlides: number;
  onNext?: () => void;
}

const TimeSpentBox: FC<TimeSpentBoxProps> = ({
  lessonName,
  timeSpentSeconds,
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
      gradient="linear-gradient(to bottom, #F97316, #FDDAB0)"
      lessonLabel={`${lessonName} Recap`}
      currentSlide={currentSlide}
      totalSlides={totalSlides}
      onSkip={onNext}
    >
      <div className={styles.body}>
        <h2 className={styles.headline}>
          MINUTES IN
          <br />
          THE ZONE
        </h2>
        <div className={styles.metricRow}>
          <div className={styles.bigNumber}>{displayMinutes}</div>
          <p className={styles.caption}>
            minutes
            <br />
            working
          </p>
        </div>
      </div>
    </RecapStoryCard>
  );
};

export default TimeSpentBox;
