import React, {FC} from 'react';

import styles from './levels-attempted-box.module.scss';

// Rainbow palette matching welcome-box.module.scss word colors.
const BUBBLE_COLORS = [
  {border: 'hsl(5deg 85% 58%)', bg: 'hsl(5deg 85% 58% / 0.12)'},
  {border: 'hsl(35deg 90% 52%)', bg: 'hsl(35deg 90% 52% / 0.12)'},
  {border: 'hsl(55deg 88% 45%)', bg: 'hsl(55deg 88% 45% / 0.12)'},
  {border: 'hsl(145deg 65% 42%)', bg: 'hsl(145deg 65% 42% / 0.12)'},
  {border: 'hsl(175deg 72% 40%)', bg: 'hsl(175deg 72% 40% / 0.12)'},
  {border: 'hsl(215deg 85% 60%)', bg: 'hsl(215deg 85% 60% / 0.12)'},
  {border: 'hsl(285deg 72% 62%)', bg: 'hsl(285deg 72% 62% / 0.12)'},
] as const;

interface LevelsAttemptedBoxProps {
  lessonName: string;
  levelsAttempted: number;
}

const LevelsAttemptedBox: FC<LevelsAttemptedBoxProps> = ({
  lessonName,
  levelsAttempted,
}) => (
  <div className={styles.container}>
    <p className={styles.lessonName}>{lessonName}</p>
    <div className={styles.levelCountSection}>
      <div
        className={styles.levelNumber}
        style={{'--target-count': levelsAttempted} as React.CSSProperties}
      />
      <div className={styles.levelLabel}>levels attempted</div>
      <div className={styles.bubblesRow}>
        {Array.from({length: levelsAttempted}, (_, i) => {
          const {border, bg} = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
          return (
            <div
              key={i}
              className={styles.bubble}
              style={{
                animationDelay: `${0.8 + i * 0.05}s`,
                borderColor: border,
                backgroundColor: bg,
              }}
            />
          );
        })}
      </div>
    </div>
  </div>
);

export default LevelsAttemptedBox;
