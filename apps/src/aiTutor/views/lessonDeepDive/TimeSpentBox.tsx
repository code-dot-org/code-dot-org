import React, {FC, useEffect, useState} from 'react';

import styles from './time-spent-box.module.scss';

const TICK_COLORS = [
  {border: 'hsl(5deg 85% 58%)', bg: 'hsl(5deg 85% 58% / 0.18)'},
  {border: 'hsl(35deg 90% 52%)', bg: 'hsl(35deg 90% 52% / 0.18)'},
  {border: 'hsl(55deg 88% 45%)', bg: 'hsl(55deg 88% 45% / 0.18)'},
  {border: 'hsl(145deg 65% 42%)', bg: 'hsl(145deg 65% 42% / 0.18)'},
  {border: 'hsl(175deg 72% 40%)', bg: 'hsl(175deg 72% 40% / 0.18)'},
  {border: 'hsl(215deg 85% 60%)', bg: 'hsl(215deg 85% 60% / 0.18)'},
  {border: 'hsl(285deg 72% 62%)', bg: 'hsl(285deg 72% 62% / 0.18)'},
] as const;

// Max ticks rendered to avoid visual overflow for very long sessions.
const MAX_TICKS = 60;

const ANIMATION_DURATION_MS = 1500;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface TimeSpentBoxProps {
  lessonName: string;
  timeSpentSeconds: number;
}

const TimeSpentBox: FC<TimeSpentBoxProps> = ({
  lessonName,
  timeSpentSeconds,
}) => {
  const [displaySeconds, setDisplaySeconds] = useState(0);

  useEffect(() => {
    if (timeSpentSeconds === 0) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      // Cubic ease-out.
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplaySeconds(Math.round(eased * timeSpentSeconds));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [timeSpentSeconds]);

  const tickCount = Math.min(Math.floor(timeSpentSeconds / 60), MAX_TICKS);

  return (
    <div className={styles.container}>
      <p className={styles.lessonName}>{lessonName}</p>
      <div className={styles.timeSection}>
        <div className={styles.timeNumber}>{formatTime(displaySeconds)}</div>
        <div className={styles.timeLabel}> minutes on platform this lesson</div>
        <div className={styles.ticksRow}>
          {Array.from({length: tickCount}, (_, i) => {
            const {border, bg} = TICK_COLORS[i % TICK_COLORS.length];
            return (
              <div
                key={i}
                className={styles.tick}
                style={{
                  animationDelay: `${0.8 + i * 0.03}s`,
                  backgroundColor: bg,
                  borderLeft: `2px solid ${border}`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeSpentBox;
