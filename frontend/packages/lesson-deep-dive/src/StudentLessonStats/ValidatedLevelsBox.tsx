import {type CSSProperties, type FC} from 'react';

import RecapStoryCard from '../RecapStoryCard';

import styles from './validated-levels-box.module.scss';

interface ValidatedLevelsBoxProps {
  gradient: string;
  headline: string;
  headlineAlign?: 'left' | 'right';
  lessonName: string;
  validatedLevelsTotalCount: number;
  validatedLevelsCorrectCount: number;
  validatedLevelsIncorrectCount: number;
  autoAdvanceDurationMs: number;
  currentSlide: number;
  totalSlides: number;
  onNext?: () => void;
}

const ValidatedLevelsBox: FC<ValidatedLevelsBoxProps> = ({
  gradient,
  headline,
  headlineAlign = 'left',
  lessonName,
  validatedLevelsTotalCount,
  validatedLevelsCorrectCount,
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
      <div
        className={styles.metricRow}
        style={{'--target-count': validatedLevelsCorrectCount} as CSSProperties}
      >
        <div className={styles.bigNumber} />
        <p className={styles.caption}>
          of {validatedLevelsTotalCount} validated
          <br />
          levels passed
        </p>
      </div>
      <h2
        className={`${styles.headline} ${headlineAlign === 'right' ? styles.headlineRight : ''}`}
      >
        {headline}
      </h2>
    </div>
  </RecapStoryCard>
);

export default ValidatedLevelsBox;
