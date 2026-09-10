import {type FC} from 'react';

import RecapStoryCard from './RecapStoryCard';

import styles from './welcome-box.module.scss';

interface WelcomeBoxProps {
  gradient: string;
  headline: string;
  lessonName: string;
  autoAdvanceDurationMs: number;
  currentSlide: number;
  totalSlides: number;
  onNext?: () => void;
}

const WelcomeBox: FC<WelcomeBoxProps> = ({
  gradient,
  headline,
  lessonName,
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
      <h2 className={styles.headline}>{headline}</h2>
      <p className={styles.subtitle}>
        {"Let's take a look at how the lesson went."}
      </p>
    </div>
  </RecapStoryCard>
);

export default WelcomeBox;
