import {type CSSProperties, type FC} from 'react';

import RecapStoryCard from '../RecapStoryCard';

import styles from './levels-attempted-box.module.scss';

interface LevelsAttemptedBoxProps {
  lessonName: string;
  levelsAttempted: number;
  levelsTotal: number;
  currentSlide: number;
  totalSlides: number;
  onNext?: () => void;
}

const LevelsAttemptedBox: FC<LevelsAttemptedBoxProps> = ({
  lessonName,
  levelsAttempted,
  levelsTotal,
  currentSlide,
  totalSlides,
  onNext,
}) => (
  <RecapStoryCard
    gradient="linear-gradient(to bottom, #22D45A, #BAFAD0)"
    lessonLabel={`${lessonName} Recap`}
    currentSlide={currentSlide}
    totalSlides={totalSlides}
    onSkip={onNext}
  >
    <div className={styles.body}>
      <div
        className={styles.metricRow}
        style={{'--target-count': levelsAttempted} as CSSProperties}
      >
        <div className={styles.bigNumber} />
        <p className={styles.caption}>
          of {levelsTotal} levels
          <br />
          completed
        </p>
      </div>
      <h2 className={styles.headline}>
        YOU GOT
        <br />
        IT DONE
      </h2>
    </div>
  </RecapStoryCard>
);

export default LevelsAttemptedBox;
