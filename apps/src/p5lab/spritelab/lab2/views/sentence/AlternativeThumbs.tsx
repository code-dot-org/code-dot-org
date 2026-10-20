// Down the left of the frame: every picture of the session as small tiles
// in order, the one in the frame marked; clicking another swaps it in.

import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import styles from './alternative-thumbs.module.scss';

export interface AlternativeThumb {
  id: string;
  src: string;
  /** Read to screen readers as the tile's name. */
  prompt: string;
  /** A set's first frame; the whole image when unset. */
  crop?: {width: number; height: number};
  pixelArt?: boolean;
}

interface AlternativeThumbsProps {
  thumbs: AlternativeThumb[];
  /** The picture in the frame. */
  chosenId: string | null;
  onChoose: (id: string) => void;
  disabled?: boolean;
}

// A tile's edge, px: a level's five tiles and their gaps stand within the
// dialog's pane at its smallest; past that the column scrolls.
const TILE_PX = 56;

// Draws the picture, or its first frame, to fit the tile.
const Tile: React.FunctionComponent<AlternativeThumb> = ({
  src,
  crop,
  pixelArt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The crop's numbers, so a fresh object each render does not redraw.
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
      const w = cropWidth ?? image.naturalWidth;
      const h = cropHeight ?? image.naturalHeight;
      const scale = Math.min(TILE_PX / w, TILE_PX / h);
      const dw = w * scale;
      const dh = h * scale;
      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }
      context.clearRect(0, 0, TILE_PX, TILE_PX);
      context.imageSmoothingEnabled = !pixelArt;
      context.drawImage(
        image,
        0,
        0,
        w,
        h,
        (TILE_PX - dw) / 2,
        (TILE_PX - dh) / 2,
        dw,
        dh
      );
    };
    image.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, cropWidth, cropHeight, pixelArt]);
  return (
    <canvas
      ref={canvasRef}
      width={TILE_PX}
      height={TILE_PX}
      className={classNames(styles.tile, pixelArt && styles.pixelArt)}
      aria-hidden
    />
  );
};

const AlternativeThumbs: React.FunctionComponent<AlternativeThumbsProps> = ({
  thumbs,
  chosenId,
  onChoose,
  disabled,
}) => (
  <div className={styles.column} role="group" aria-label="Your pictures">
    {thumbs.map((thumb, i) => (
      <button
        key={thumb.id}
        type="button"
        className={classNames(
          styles.button,
          thumb.id === chosenId && styles.chosen
        )}
        aria-label={`Picture ${i + 1}: ${thumb.prompt}`}
        aria-pressed={thumb.id === chosenId}
        disabled={disabled}
        onClick={() => onChoose(thumb.id)}
      >
        <Tile {...thumb} />
      </button>
    ))}
  </div>
);

export default AlternativeThumbs;
