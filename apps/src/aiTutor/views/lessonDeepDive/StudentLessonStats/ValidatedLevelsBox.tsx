import React, {FC} from 'react';

import styles from './validated-levels-box.module.scss';

interface ValidatedLevelsBoxProps {
  lessonName: string;
  validatedLevelsTotalCount: number;
  validatedLevelsCorrectCount: number;
  validatedLevelsIncorrectCount: number;
}

const ValidatedLevelsBox: FC<ValidatedLevelsBoxProps> = ({
  validatedLevelsTotalCount,
  validatedLevelsCorrectCount,
  validatedLevelsIncorrectCount,
}) => {
  const attemptsToday =
    validatedLevelsCorrectCount + validatedLevelsIncorrectCount;

  return (
    <div className={styles.container}>
      <p className={styles.label}>Progress</p>
      <div
        className={styles.statBlock}
        style={
          {'--target-count': validatedLevelsCorrectCount} as React.CSSProperties
        }
      >
        <div className={styles.fractionRow}>
          <div className={styles.bigNumber} />
          <span className={styles.denominator}>
            /{validatedLevelsTotalCount}
          </span>
        </div>
        <p className={styles.statHeading}>correct validations</p>
        <p className={styles.statSubtitle}>
          in {attemptsToday} attempt{attemptsToday !== 1 ? 's' : ''} made today
        </p>
      </div>
    </div>
  );
};

export default ValidatedLevelsBox;
