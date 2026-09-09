import {type FC, type ReactNode} from 'react';

import styles from './recap-story-card.module.scss';

interface RecapStoryCardProps {
  gradient: string;
  lessonLabel: string;
  currentSlide: number; // 1-indexed
  totalSlides: number;
  onSkip?: () => void;
  ctaLabel?: string;
  children: ReactNode;
}

const RecapStoryCard: FC<RecapStoryCardProps> = ({
  gradient,
  lessonLabel,
  currentSlide,
  totalSlides,
  onSkip,
  ctaLabel = 'Skip',
  children,
}) => (
  <div className={styles.card} style={{background: gradient}}>
    <div className={styles.progressTracker} aria-hidden="true">
      {Array.from({length: totalSlides}, (_, i) => (
        <div
          key={i}
          className={`${styles.segment} ${
            i < currentSlide ? styles.segmentFilled : ''
          }`}
        />
      ))}
    </div>
    <p className={styles.lessonLabel}>{lessonLabel}</p>
    <div className={styles.content}>{children}</div>
    {onSkip && (
      <div className={styles.footer}>
        <button type="button" className={styles.skipButton} onClick={onSkip}>
          {ctaLabel}
        </button>
      </div>
    )}
  </div>
);

export default RecapStoryCard;
