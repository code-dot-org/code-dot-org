import {getImageThumbnail} from './imageTrim';
import {sceneGridSize, World} from './world';

// Side, in pixels, of the drawing on the set world block.
export const WORLD_THUMBNAIL_PX = 60;

const EMPTY_COLOR = '#2b2f36';
const LINE_COLOR = 'rgba(255, 255, 255, 0.12)';

// Decoded cell pictures by source, so a redraw does not wait on decoding.
const decoded = new Map<string, HTMLImageElement>();

/**
 * A small picture of a world's grid, as a data URL. Pictures still loading
 * are left out; onReady is called when one finishes, so the caller can draw
 * again.
 */
export function drawWorldThumbnail(
  world: World | undefined,
  onReady: () => void
): string {
  const canvas = document.createElement('canvas');
  canvas.width = WORLD_THUMBNAIL_PX;
  canvas.height = WORLD_THUMBNAIL_PX;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }
  const size = sceneGridSize(world);
  const cell = WORLD_THUMBNAIL_PX / size;
  ctx.fillStyle = EMPTY_COLOR;
  ctx.fillRect(0, 0, WORLD_THUMBNAIL_PX, WORLD_THUMBNAIL_PX);
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 1;
  for (let i = 1; i < size; i++) {
    const at = Math.round(i * cell) + 0.5;
    ctx.beginPath();
    ctx.moveTo(at, 0);
    ctx.lineTo(at, WORLD_THUMBNAIL_PX);
    ctx.moveTo(0, at);
    ctx.lineTo(WORLD_THUMBNAIL_PX, at);
    ctx.stroke();
  }
  ctx.imageSmoothingEnabled = false;
  world?.grid.forEach((cells, row) =>
    cells.forEach((placement, col) => {
      const src = placement && getImageThumbnail(placement.image);
      if (!src) {
        return;
      }
      const image = decoded.get(src);
      if (!image) {
        const loading = new Image();
        loading.onload = () => {
          decoded.set(src, loading);
          onReady();
        };
        loading.src = src;
        return;
      }
      ctx.drawImage(image, col * cell, row * cell, cell, cell);
    })
  );
  return canvas.toDataURL('image/png');
}
