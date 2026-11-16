// A picture drawn at a coarser grid than its own: what the model's guess
// looks like part way through.

import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import {toImage} from '@cdo/apps/imageUtils';

import styles from './learning-dialog.module.scss';

/** Width and height of the top-left region of a picture to show, so a
    sprite sheet shows only its first frame. */
export interface PictureCrop {
  width: number;
  height: number;
}

interface ChunkyPictureProps {
  src: string;
  /** Cells across the picture; the picture's own pixels when unset. */
  cells?: number;
  /** Unset shows the whole image. */
  crop?: PictureCrop;
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
    toImage(src).then(image => {
      if (cancelled) {
        return;
      }
      const width = cropWidth ?? image.naturalWidth;
      const height = cropHeight ?? image.naturalHeight;
      // Shrinking to `cells` pixels across and enlarging back without
      // smoothing turns each coarse pixel into a flat block.
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
    });
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
