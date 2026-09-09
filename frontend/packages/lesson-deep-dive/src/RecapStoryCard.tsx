import {type FC, type ReactNode} from 'react';

import styles from './recap-story-card.module.scss';

interface RecapStoryCardProps {
  gradient: string;
  lessonLabel: string;
  autoAdvanceDurationMs: number;
  currentSlide: number; // 1-indexed
  totalSlides: number;
  onSkip?: () => void;
  ctaLabel?: string;
  children: ReactNode;
}

const RecapStoryCard: FC<RecapStoryCardProps> = ({
  gradient,
  lessonLabel,
  autoAdvanceDurationMs,
  currentSlide,
  totalSlides,
  onSkip,
  ctaLabel = 'Skip',
  children,
}) => {
  return (
    <div className={styles.card} style={{background: gradient}}>
      <div className={styles.progressTracker} aria-hidden="true">
        {Array.from({length: totalSlides}, (_, i) => {
          const isPast = i < currentSlide - 1;
          const isCurrent = i === currentSlide - 1;
          return (
            <div
              key={i}
              className={`${styles.segment} ${isPast ? styles.segmentFilled : ''}`}
            >
              {isCurrent && (
                <div
                  className={styles.segmentFill}
                  style={{animationDuration: `${autoAdvanceDurationMs}ms`}}
                />
              )}
            </div>
          );
        })}
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
};

export default RecapStoryCard;
