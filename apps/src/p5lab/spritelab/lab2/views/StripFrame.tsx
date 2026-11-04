// One frame of a character set's strip, drawn into a canvas once the
// strip's image has loaded.

import React, {useEffect, useRef} from 'react';

import {toImage} from '@cdo/apps/imageUtils';
import {
  drawStripCell,
  FrameSize,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';

interface StripFrameProps {
  sheetSrc: string;
  frameSize: FrameSize;
  index: number;
  className?: string;
  /** Read by assistive tech; the frame is decorative without one. */
  label?: string;
}

const StripFrame: React.FunctionComponent<StripFrameProps> = ({
  sheetSrc,
  frameSize,
  index,
  className,
  label,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    let cancelled = false;
    toImage(sheetSrc)
      .then(image => {
        if (!cancelled) {
          drawStripCell(image, frameSize, index, canvas);
        }
      })
      // A failed load leaves the canvas blank.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [sheetSrc, frameSize, index]);
  return (
    <canvas
      ref={canvasRef}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
};

export default StripFrame;
