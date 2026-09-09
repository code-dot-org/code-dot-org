import {type FC} from 'react';

import RecapStoryCard from './RecapStoryCard';

import styles from './welcome-box.module.scss';

interface WelcomeBoxProps {
  lessonName: string;
  currentSlide: number;
  totalSlides: number;
  onNext?: () => void;
}

const WelcomeBox: FC<WelcomeBoxProps> = ({
  lessonName,
  currentSlide,
  totalSlides,
  onNext,
}) => (
  <RecapStoryCard
    gradient="linear-gradient(to bottom, #38C8F8, #D0EFFC)"
    lessonLabel={`${lessonName} Recap`}
    currentSlide={currentSlide}
    totalSlides={totalSlides}
    onSkip={onNext}
  >
    <div className={styles.body}>
      <h2 className={styles.headline}>
        {"THAT'S"}
        <br />
        {'A WRAP'}
      </h2>
      <p className={styles.subtitle}>
        {"Let's take a look at how the lesson went."}
      </p>
    </div>
  </RecapStoryCard>
);

export default WelcomeBox;
