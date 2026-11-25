import React, {useEffect, useRef} from 'react';

import {drawStripCell} from '../../characterAnimations';

interface SheetFrameProps {
  /** The sheet image (data URI or URL). */
  src: string;
  frameSize: {x: number; y: number};
  index: number;
  className?: string;
}

/** One frame of a sheet, still. */
const SheetFrame: React.FunctionComponent<SheetFrameProps> = ({
  src,
  frameSize,
  index,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const img = new Image();
    let cancelled = false;
    img.onload = () => {
      if (!cancelled && canvasRef.current) {
        drawStripCell(img, frameSize, index, canvasRef.current);
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, frameSize, index]);
  return (
    <canvas
      ref={canvasRef}
      width={frameSize.x}
      height={frameSize.y}
      className={className}
    />
  );
};

export default SheetFrame;
