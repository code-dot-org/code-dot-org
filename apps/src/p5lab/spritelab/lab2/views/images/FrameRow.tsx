// A character set's frames as a row of toggle buttons, each named for its
// pose; the one being drawn is pressed.

import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import {toImage} from '@cdo/apps/imageUtils';
import {
  drawStripCell,
  FrameSize,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';

import {FRAME_LABELS, FRAME_ROW_ORDER} from './frames';

import styles from './images-tab.module.scss';

interface FrameRowProps {
  sheetSrc: string;
  frameSize: FrameSize;
  count: number;
  selected: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

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
    toImage(sheetSrc).then(image => {
      if (!cancelled) {
        drawStripCell(image, frameSize, index, canvas);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sheetSrc, frameSize, index]);
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
    {(count === FRAME_ROW_ORDER.length
      ? FRAME_ROW_ORDER
      : Array.from({length: count}, (_, i) => i)
    ).map(index => {
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
