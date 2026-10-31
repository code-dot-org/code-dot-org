// A picture drawn at a coarser grid than its own: what the model's guess
// looks like part way through.

import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import styles from './learning-dialog.module.scss';

interface ChunkyPictureProps {
  src: string;
  /** Cells across the picture; the picture's own pixels when unset. */
  cells?: number;
  /** A sheet's first frame; the whole image when unset. */
  crop?: {width: number; height: number};
  className?: string;
}

const ChunkyPicture: React.FunctionComponent<ChunkyPictureProps> = ({
  src,
  cells,
  crop,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropWidth = crop?.width;
  const cropHeight = crop?.height;
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
      const width = cropWidth ?? image.naturalWidth;
      const height = cropHeight ?? image.naturalHeight;
      // Down to the coarse grid, then back up with hard edges.
      const coarse = document.createElement('canvas');
      coarse.width = cells ?? width;
      coarse.height = cells ?? height;
      const coarseCtx = coarse.getContext('2d');
      const ctx = canvas.getContext('2d');
      if (!coarseCtx || !ctx) {
        return;
      }
      coarseCtx.imageSmoothingEnabled = false;
      coarseCtx.drawImage(
        image,
        0,
        0,
        width,
        height,
        0,
        0,
        coarse.width,
        coarse.height
      );
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(coarse, 0, 0, width, height);
    };
    image.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, cells, cropWidth, cropHeight]);
  return (
    <canvas
      ref={canvasRef}
      className={classNames(styles.chunky, className)}
      aria-hidden
    />
  );
};

export default ChunkyPicture;
