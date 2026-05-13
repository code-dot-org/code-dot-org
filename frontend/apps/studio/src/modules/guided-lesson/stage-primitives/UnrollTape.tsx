import {useEffect, useRef, useState} from 'react';

import styles from './stagePrimitives.module.scss';

/**
 * Misconception attacked: kids think `repeat 4` *is* four blocks. They don't
 * see that one written block becomes four executed steps in *time*.
 *
 * Visualization: one purple "repeat N" block on top → N teal slots below
 * that fill in one at a time, numbered 1..N. Student can step manually or
 * auto-play. Changing the count chip rewrites the ribbon — they see that
 * "the number" *is* data.
 */

const COUNTS = [2, 4, 6, 8] as const;
const STEP_MS = 600;

const UnrollTape = () => {
  const [count, setCount] = useState<number>(4);
  const [active, setActive] = useState<number>(-1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActive(-1);
    setPlaying(false);
  };

  useEffect(() => () => reset(), []);
  // Reset when count changes so we don't end up "active" past the new end.
  useEffect(() => {
    reset();
  }, [count]);

  const step = () => {
    setActive(i => Math.min(i + 1, count - 1));
  };

  useEffect(() => {
    if (!playing) return;
    if (active >= count - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => setActive(i => i + 1), STEP_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, active, count]);

  const startPlay = () => {
    setActive(-1);
    setPlaying(true);
    timerRef.current = setTimeout(() => setActive(0), 250);
  };

  return (
    <div className={styles.host}>
      <h2 className={styles.headline}>One block. Many times.</h2>
      <p className={styles.subhead}>
        Press <strong>Play</strong> to watch what <code>repeat {count}</code>{' '}
        really does.
      </p>

      <div className={styles.canvas}>
        <RepeatBlock count={count} pulseOn={active >= 0 && playing} />

        <div className={styles.utRibbon}>
          {Array.from({length: count}, (_, i) => {
            const filled = i <= active;
            const isActive = i === active;
            return (
              <div
                key={i}
                className={`${styles.utSlot} ${
                  filled ? styles.utSlotFilled : ''
                } ${isActive ? styles.utSlotActive : ''}`}
              >
                <span>play sound</span>
                <span className={styles.utSlotNum}>{i + 1}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.controlRow}>
          <button
            type="button"
            className={`${styles.ctrlButton} ${styles.ctrlButtonPrimary}`}
            onClick={playing ? () => setPlaying(false) : startPlay}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            className={styles.ctrlButton}
            onClick={step}
            disabled={playing || active >= count - 1}
          >
            Step
          </button>
          <button
            type="button"
            className={styles.ctrlButton}
            onClick={() => {
              setActive(-1);
              setPlaying(false);
            }}
          >
            Reset
          </button>
        </div>

        <div className={styles.controlRow} role="group" aria-label="Repeat count">
          <span className={styles.qaLabel} style={{margin: 0}}>
            Repeat
          </span>
          <div className={styles.chipGroup}>
            {COUNTS.map(n => (
              <button
                key={n}
                type="button"
                className={styles.chipBtn}
                aria-pressed={n === count}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RepeatBlock = ({
  count,
  pulseOn,
}: {
  count: number;
  pulseOn: boolean;
}) => (
  <svg viewBox="0 0 360 110" width="100%" style={{maxWidth: 320, height: 'auto'}}>
    <defs>
      <linearGradient id="repeatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgb(124, 73, 213)" />
        <stop offset="100%" stopColor="rgb(92, 33, 193)" />
      </linearGradient>
    </defs>
    {/* C-shape repeat block hugging an inner sound block */}
    <path
      d="M 16 14
         L 344 14
         A 12 12 0 0 1 356 26
         L 356 84
         A 12 12 0 0 1 344 96
         L 80 96
         L 80 80
         L 60 80
         L 60 96
         L 16 96
         A 12 12 0 0 1 4 84
         L 4 26
         A 12 12 0 0 1 16 14 Z"
      fill="url(#repeatGrad)"
    />
    <text
      x="22"
      y="44"
      fill="white"
      fontSize="16"
      fontWeight="700"
      fontFamily="system-ui, sans-serif"
    >
      repeat
    </text>
    <rect x="92" y="30" rx="10" ry="10" width="48" height="26" fill="rgb(254,168,55)" />
    <text
      x="116"
      y="48"
      fill="white"
      fontSize="14"
      fontWeight="700"
      textAnchor="middle"
      fontFamily="system-ui, sans-serif"
    >
      × {count}
    </text>
    {/* Nested sound block */}
    <g
      style={{
        transformOrigin: '180px 76px',
        transition: 'transform 200ms ease',
        transform: pulseOn ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      <rect x="100" y="62" rx="10" ry="10" width="220" height="28" fill="rgb(0,173,184)" />
      <text
        x="210"
        y="80"
        fill="white"
        fontSize="14"
        fontWeight="700"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
      >
        play sound
      </text>
    </g>
  </svg>
);

export default UnrollTape;
