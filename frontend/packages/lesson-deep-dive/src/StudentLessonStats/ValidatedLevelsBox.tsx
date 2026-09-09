import {type CSSProperties, type FC} from 'react';

import RecapStoryCard from '../RecapStoryCard';

import styles from './validated-levels-box.module.scss';

interface ValidatedLevelsBoxProps {
  lessonName: string;
  validatedLevelsTotalCount: number;
  validatedLevelsCorrectCount: number;
  validatedLevelsIncorrectCount: number;
  currentSlide: number;
  totalSlides: number;
  onNext?: () => void;
}

const ValidatedLevelsBox: FC<ValidatedLevelsBoxProps> = ({
  lessonName,
  validatedLevelsTotalCount,
  validatedLevelsCorrectCount,
  currentSlide,
  totalSlides,
  onNext,
}) => (
  <RecapStoryCard
    gradient="linear-gradient(to bottom, #8060E0, #CAC0F4)"
    lessonLabel={`${lessonName} Recap`}
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
      <h2 className={styles.headline}>
        VALIDATED
        <br />
        AND PASSED
      </h2>
    </div>
  </RecapStoryCard>
);

export default ValidatedLevelsBox;
