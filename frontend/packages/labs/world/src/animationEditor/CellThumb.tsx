// One cell of a spritesheet, drawn.
//
// Shared by the two places that ask which cell: the picker on a frame
// (CellPicker) and the one that builds frames out of a whole sheet
// (AddFramesDialog). A cell is a rectangle in an image, so drawing one is a
// `drawImage` with a source rectangle — there is no way to crop an `<img>`
// without one, and every other approach (background-position, clip-path)
// re-derives the same arithmetic somewhere it cannot be tested.

import {useEffect, useRef} from 'react';

import styles from './cellThumb.module.css';
import type {CellRect} from './sheetFrames';

export interface CellThumbProps {
  image: HTMLImageElement;
  cell: CellRect;
  /** Draw scale — 2 everywhere in this editor, so pixel art reads. */
  scale: number;
}

export const CellThumb = ({image, cell, scale}: CellThumbProps) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const width = cell.width * scale;
  const height = cell.height * scale;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(
      image,
      cell.x,
      cell.y,
      cell.width,
      cell.height,
      0,
      0,
      width,
      height,
    );
  }, [image, cell, width, height]);

  return (
    <canvas
      ref={ref}
      className={styles.cell}
      style={{width, height}}
      aria-hidden="true"
    />
  );
};
