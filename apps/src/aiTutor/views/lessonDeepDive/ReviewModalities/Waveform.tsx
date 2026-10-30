import React, {FC, useEffect, useState} from 'react';

import styles from './podcasts-box.module.scss';

// Rainbow waveform bars: [restingHeightPct, color]. The resting heights are the
// decorative shape shown while idle; during playback the heights are driven by
// live frequency data from the analyser.
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

const RESTING_HEIGHTS = BARS.map(([height]) => height);

// Lowest bar height (%) while live, so quiet moments still show a sliver.
const MIN_LIVE_HEIGHT = 8;

interface WaveformProps {
  // The analyser tapping the podcast audio, or null when Web Audio is
  // unavailable (in which case we fall back to the decorative CSS pulse).
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const Waveform: FC<WaveformProps> = ({analyser, isPlaying}) => {
  const [heights, setHeights] = useState<number[]>(RESTING_HEIGHTS);

  useEffect(() => {
    if (!analyser || !isPlaying) {
      setHeights(RESTING_HEIGHTS);
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      setHeights(
        BARS.map((_bar, i) => {
          const magnitude = (data[i] ?? 0) / 255;
          return MIN_LIVE_HEIGHT + magnitude * (100 - MIN_LIVE_HEIGHT);
        })
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [analyser, isPlaying]);

  // Without an analyser we can't follow the audio, so keep the original pulse.
  const pulsing = isPlaying && !analyser;

  return (
    <div className={styles.waveform}>
      {BARS.map(([, color], i) => (
        <div
          key={i}
          className={`${styles.bar} ${pulsing ? styles.barAnimating : ''} ${
            analyser ? styles.barLive : ''
          }`}
          style={{
            height: `${heights[i]}%`,
            backgroundColor: color,
            animationDelay: `${(i * 0.04).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Waveform;
