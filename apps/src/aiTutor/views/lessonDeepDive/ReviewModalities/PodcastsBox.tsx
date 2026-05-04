import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import styles from './podcasts-box.module.scss';

// Rainbow waveform bars: [heightPct, color]
const BARS: [number, string][] = [
  [35, '#9657c7'],
  [55, '#8a60cb'],
  [75, '#7d6acf'],
  [90, '#7173d3'],
  [100, '#5e7ed7'],
  [85, '#4b89db'],
  [70, '#3894df'],
  [80, '#25a0e3'],
  [95, '#00b4c8'],
  [100, '#00b89b'],
  [90, '#00bc6e'],
  [80, '#4abf45'],
  [95, '#8ac23c'],
  [100, '#b4c336'],
  [85, '#d4c030'],
  [75, '#f0ba2a'],
  [60, '#f5a52a'],
  [70, '#fa902a'],
  [50, '#fa752a'],
  [40, '#fa5a2a'],
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PodcastsBox: FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(p => !p);
  }, [isPlaying]);

  const skipBack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  }, []);

  const skipForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration || 0,
        audioRef.current.currentTime + 10
      );
    }
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      if (audioRef.current && duration) {
        audioRef.current.currentTime = pct * duration;
      }
    },
    [duration]
  );

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.container}>
      {/* no src — placeholder UI until podcast content is wired up */}
      <audio ref={audioRef} />

      <p className={styles.overline}>Podcast</p>

      <div className={styles.waveform}>
        {BARS.map(([height, color], i) => (
          <div
            key={i}
            className={`${styles.bar} ${isPlaying ? styles.barAnimating : ''}`}
            style={{
              height: `${height}%`,
              backgroundColor: color,
              animationDelay: `${(i * 0.04).toFixed(2)}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.playerArea}>
        <div className={styles.volumeRow}>
          <FontAwesomeV6Icon iconName="volume" />
        </div>

        <div
          className={styles.progressTrack}
          onClick={handleProgressClick}
          role="slider"
          aria-label="Playback position"
          aria-valuenow={Math.round(currentTime)}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
        >
          <div className={styles.progressFill} style={{width: `${progress}%`}} />
        </div>

        <div className={styles.timestamps}>
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : '--:--'}</span>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={skipBack}
            aria-label="Skip back 10 seconds"
          >
            <FontAwesomeV6Icon iconName="backward-fast" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <FontAwesomeV6Icon iconName={isPlaying ? 'pause' : 'play'} />
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={skipForward}
            aria-label="Skip forward 10 seconds"
          >
            <FontAwesomeV6Icon iconName="forward-fast" />
          </button>
        </div>
      </div>

      <p className={styles.description}>
        This lesson&apos;s concepts, explained as a short audio summary. Press
        play to listen.
      </p>
    </div>
  );
};

export default PodcastsBox;
