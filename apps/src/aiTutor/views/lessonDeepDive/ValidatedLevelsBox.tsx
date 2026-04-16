import React, {FC} from 'react';

import styles from './validated-levels-box.module.scss';

// Max bubbles rendered to avoid visual overflow for very long lessons.
const MAX_BUBBLES = 60;

interface ValidatedLevelsBoxProps {
  lessonName: string;
  validatedLevelsTotalCount: number;
  validatedLevelsCorrectCount: number;
  validatedLevelsIncorrectCount: number;
}

type BubbleKind = 'correct' | 'incorrect' | 'unattempted';

const BUBBLE_SYMBOL: Record<BubbleKind, string> = {
  correct: '✓',
  incorrect: 'x',
  unattempted: '?',
};

const BUBBLE_CLASS: Record<BubbleKind, string> = {
  correct: styles.bubbleCorrect,
  incorrect: styles.bubbleIncorrect,
  unattempted: styles.bubbleUnattempted,
};

const ValidatedLevelsBox: FC<ValidatedLevelsBoxProps> = ({
  lessonName,
  validatedLevelsTotalCount,
  validatedLevelsCorrectCount,
  validatedLevelsIncorrectCount,
}) => {
  const unattemptedCount =
    validatedLevelsTotalCount -
    validatedLevelsCorrectCount -
    validatedLevelsIncorrectCount;

  const bubbles: BubbleKind[] = [
    ...Array<BubbleKind>(validatedLevelsCorrectCount).fill('correct'),
    ...Array<BubbleKind>(validatedLevelsIncorrectCount).fill('incorrect'),
    ...Array<BubbleKind>(Math.max(unattemptedCount, 0)).fill('unattempted'),
  ].slice(0, MAX_BUBBLES);

  return (
    <div className={styles.container}>
      <p className={styles.lessonName}>{lessonName}</p>
      <div className={styles.countSection}>
        <div
          className={styles.levelNumber}
          style={
            {
              '--target-count': validatedLevelsCorrectCount,
            } as React.CSSProperties
          }
        />
        <div className={styles.levelLabel}>
          {' '}
          out of {validatedLevelsTotalCount} validated levels correct
        </div>
        <div className={styles.bubblesRow}>
          {bubbles.map((kind, i) => (
            <div
              key={i}
              className={`${styles.bubble} ${BUBBLE_CLASS[kind]}`}
              style={{animationDelay: `${0.8 + i * 0.05}s`}}
            >
              {BUBBLE_SYMBOL[kind]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ValidatedLevelsBox;
