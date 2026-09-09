import {type FC} from 'react';

import RecapStoryCard from './RecapStoryCard';

import styles from './lesson-summary-card.module.scss';

interface LessonSummaryCardProps {
  lessonName: string;
  levelsAttempted: number;
  levelsTotal: number;
  timeSpentSeconds: number;
  validatedCorrect: number;
  validatedTotal: number;
  currentSlide: number;
  totalSlides: number;
  onNext?: () => void;
}

const LessonSummaryCard: FC<LessonSummaryCardProps> = ({
  lessonName,
  levelsAttempted,
  levelsTotal,
  timeSpentSeconds,
  validatedCorrect,
  validatedTotal,
  currentSlide,
  totalSlides,
  onNext,
}) => {
  const totalMinutes = Math.round(timeSpentSeconds / 60);

  return (
    <RecapStoryCard
      gradient="linear-gradient(to bottom, #29ABE2, #AADDF5)"
      lessonLabel={`${lessonName} Recap`}
      currentSlide={currentSlide}
      totalSlides={totalSlides}
      onSkip={onNext}
      ctaLabel="Continue"
    >
      <div className={styles.body}>
        <h2 className={styles.headline}>
          THE WHOLE
          <br />
          PICTURE
        </h2>
        <div className={styles.statList}>
          <div className={styles.divider} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Levels attempted</span>
            <span className={styles.statValue}>
              {levelsAttempted}/{levelsTotal}
            </span>
          </div>
          <div className={styles.divider} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Time spent</span>
            <span className={styles.statValue}>{totalMinutes} min</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Validation passed</span>
            <span className={styles.statValue}>
              {validatedCorrect}/{validatedTotal}
            </span>
          </div>
          <div className={styles.divider} />
        </div>
      </div>
    </RecapStoryCard>
  );
};

export default LessonSummaryCard;
