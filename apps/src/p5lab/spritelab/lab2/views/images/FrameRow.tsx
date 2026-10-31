// A character set's frames in a row, each named for its pose, the one
// being drawn marked; clicking another opens it.

import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import {FRAME_LABELS, FrameSize} from './frames';

import styles from './images-tab.module.scss';

interface FrameRowProps {
  sheetSrc: string;
  frameSize: FrameSize;
  count: number;
  selected: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

// Draws one frame of the sheet into its tile.
const FrameTile: React.FunctionComponent<{
  sheetSrc: string;
  frameSize: FrameSize;
  index: number;
}> = ({sheetSrc, frameSize, index}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) {
        return;
      }
      const columns = Math.max(1, Math.floor(image.naturalWidth / frameSize.x));
      canvas.width = frameSize.x;
      canvas.height = frameSize.y;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(
        image,
        (index % columns) * frameSize.x,
        Math.floor(index / columns) * frameSize.y,
        frameSize.x,
        frameSize.y,
        0,
        0,
        frameSize.x,
        frameSize.y
      );
    };
    image.src = sheetSrc;
    return () => {
      cancelled = true;
    };
  }, [sheetSrc, frameSize.x, frameSize.y, index]);
  return <canvas ref={canvasRef} className={styles.frameTileCanvas} />;
};

const FrameRow: React.FunctionComponent<FrameRowProps> = ({
  sheetSrc,
  frameSize,
  count,
  selected,
  onSelect,
  disabled,
}) => (
  <div className={styles.frameStrip} role="group" aria-label="Frames">
    {Array.from({length: count}, (_, index) => {
      const label = FRAME_LABELS[index] ?? `Frame ${index + 1}`;
      const chosen = index === selected;
      return (
        <button
          key={index}
          type="button"
          className={classNames(
            styles.frameTile,
            chosen && styles.frameTileChosen
          )}
          aria-pressed={chosen}
          aria-label={label}
          disabled={disabled}
          onClick={() => onSelect(index)}
        >
          <FrameTile sheetSrc={sheetSrc} frameSize={frameSize} index={index} />
          <span className={styles.frameLabel} aria-hidden>
            {label}
          </span>
        </button>
      );
    })}
  </div>
);

export default FrameRow;
