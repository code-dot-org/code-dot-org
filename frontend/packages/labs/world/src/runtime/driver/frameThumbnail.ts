// Draws a single resolved appearance frame to a square PNG data URL, for the map
// editor's actor picker. Runs in the preview sandbox (same origin as the vendor
// sprites, so the canvas is not tainted and `toDataURL` works). A frameless
// actor — one with no sprite — falls back to the plain-rectangle color the
// PhaserBinding uses for such actors, so the picker still shows something.

import type {FrameState} from 'world-lab';

const FALLBACK_COLOR = '#33cc66';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`could not load sprite ${src}`));
    image.src = src;
  });
}

export async function frameThumbnail(
  frame: FrameState | undefined,
  assetBase: string,
  uploads: Record<string, string>,
  size: number,
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }
  const fillFallback = () => {
    ctx.fillStyle = FALLBACK_COLOR;
    ctx.fillRect(0, 0, size, size);
  };
  if (!frame) {
    fillFallback();
    return canvas.toDataURL('image/png');
  }
  // Uploaded sprites are data URLs; built-ins are self-hosted PNGs.
  const src =
    uploads[frame.sprite] ?? `${assetBase}sprites/${frame.sprite}.png`;
  try {
    const image = await loadImage(src);
    const cell = frame.cell;
    if (cell) {
      // A spritesheet cell — draw just that source rectangle, scaled to fit.
      ctx.drawImage(
        image,
        cell.x,
        cell.y,
        cell.width,
        cell.height,
        0,
        0,
        size,
        size,
      );
    } else {
      ctx.drawImage(image, 0, 0, size, size);
    }
  } catch {
    fillFallback();
  }
  return canvas.toDataURL('image/png');
}
