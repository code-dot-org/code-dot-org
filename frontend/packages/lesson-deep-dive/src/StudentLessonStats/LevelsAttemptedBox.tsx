import {type CSSProperties, type FC} from 'react';

import RecapStoryCard from '../RecapStoryCard';

import styles from './stat-card.module.scss';

interface LevelsAttemptedBoxProps {
  gradient: string;
  headline: string;
  headlineFirst: boolean;
  lessonName: string;
  levelsAttempted: number;
  levelsTotal: number;
  autoAdvanceDurationMs: number;
  currentSlide: number;
  totalSlides: number;
  onNext?: () => void;
}

const LevelsAttemptedBox: FC<LevelsAttemptedBoxProps> = ({
  gradient,
  headline,
  headlineFirst,
  lessonName,
  levelsAttempted,
  levelsTotal,
  autoAdvanceDurationMs,
  currentSlide,
  totalSlides,
  onNext,
}) => (
  <RecapStoryCard
    gradient={gradient}
    lessonLabel={`${lessonName} Recap`}
    autoAdvanceDurationMs={autoAdvanceDurationMs}
    currentSlide={currentSlide}
    totalSlides={totalSlides}
    onSkip={onNext}
  >
    <div className={styles.body}>
      {headlineFirst && <h2 className={styles.headline}>{headline}</h2>}
      <div
        className={styles.metricRow}
        style={{'--target-count': levelsAttempted} as CSSProperties}
      >
        <div className={styles.bigNumberAnimated} />
        <p className={styles.caption}>
          of {levelsTotal} levels
          <br />
          completed
        </p>
      </div>
      {!headlineFirst && <h2 className={styles.headline}>{headline}</h2>}
    </div>
  </RecapStoryCard>
);

export default LevelsAttemptedBox;
