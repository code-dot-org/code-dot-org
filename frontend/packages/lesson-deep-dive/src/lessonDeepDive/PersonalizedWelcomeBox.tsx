import React, {FC} from 'react';

import styles from './personalized-welcome-box.module.scss';

interface PersonalizedWelcomeBoxProps {
  lessonName: string;
  unitLabel: string | null;
  displayName: string | undefined;
}

const PersonalizedWelcomeBox: FC<PersonalizedWelcomeBoxProps> = ({
  lessonName,
  unitLabel,
  displayName,
}) => {
  const firstName = displayName?.split(' ')[0] ?? null;

  return (
    <div className={styles.container}>
      {unitLabel && <p className={styles.overline}>{unitLabel}</p>}
      <h2 className={styles.heading}>
        Nice work today,
        <br />
        <span className={styles.name}>{firstName ?? 'friend'}</span>
      </h2>
      <p className={styles.body}>
        {"Let's look at how "}
        <strong>{lessonName}</strong>
        {' went — then you can choose how to go deeper.'}
      </p>
    </div>
  );
};

export default PersonalizedWelcomeBox;
