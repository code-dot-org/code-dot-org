import React, {FC} from 'react';

import styles from './levels-attempted-box.module.scss';

interface LevelsAttemptedBoxProps {
  lessonName: string;
  levelsAttempted: number;
  levelsTotal: number;
}

const LevelsAttemptedBox: FC<LevelsAttemptedBoxProps> = ({
  levelsAttempted,
  levelsTotal,
}) => (
  <div className={styles.container}>
    <p className={styles.label}>Progress</p>
    <div
      className={styles.statBlock}
      style={{'--target-count': levelsAttempted} as React.CSSProperties}
    >
      <div className={styles.bigNumber} />
      <p className={styles.statHeading}>levels attempted</p>
      <p className={styles.statSubtitle}>
        out of {levelsTotal} in today&apos;s lesson
      </p>
    </div>
  </div>
);

export default LevelsAttemptedBox;
