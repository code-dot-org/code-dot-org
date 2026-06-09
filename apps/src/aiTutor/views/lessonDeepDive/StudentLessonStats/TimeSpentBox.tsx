import React, {FC, useEffect, useState} from 'react';

import styles from './time-spent-box.module.scss';

const ANIMATION_DURATION_MS = 1200;

interface TimeSpentBoxProps {
  lessonName: string;
  timeSpentSeconds: number;
}

const TimeSpentBox: FC<TimeSpentBoxProps> = ({
  lessonName,
  timeSpentSeconds,
}) => {
  const totalMinutes = Math.round(timeSpentSeconds / 60);
  const [displayMinutes, setDisplayMinutes] = useState(0);

  useEffect(() => {
    if (totalMinutes === 0) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayMinutes(Math.round(eased * totalMinutes));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [totalMinutes]);

  return (
    <div className={styles.container}>
      <p className={styles.label}>Time on task</p>
      <div className={styles.statBlock}>
        <div className={styles.bigNumber}>{displayMinutes}</div>
        <p className={styles.statHeading}>minutes</p>
        <p className={styles.statSubtitle}>spent on {lessonName}</p>
      </div>
    </div>
  );
};

export default TimeSpentBox;
