// Draws a single resolved appearance frame to a square PNG data URL, for the map
// editor's actor picker. Runs in the preview sandbox (same origin as the vendor
// sprites, so the canvas is not tainted and `toDataURL` works). A frameless
// actor — one with no sprite — falls back to the plain-rectangle color the
// PhaserBinding uses for such actors, so the picker still shows something.

import type {DrawingState, FrameState} from 'world-lab';

import {paintDrawing} from './drawingTextures';

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

/**
 * …and the same, for a kind that describes its own picture.
 *
 * The palette entry IS the routine's output, which is the whole answer to the
 * gap `specs/UI_ACTORS.md` recorded and could not close: a Label has no file to
 * show, so before drawings existed its entry could only be blank.
 *
 * ITS OWN SHAPE, NOT A SQUARE, and at 1:1 unless it is too big for one.
 *
 * A sprite's thumbnail is a square because a picture fitted into one is still
 * that picture. A drawing is not: fitting a 96 by 24 Label into 48 by 48 drew
 * its 12px text at 6px, on a transparent ground over a white palette strip —
 * which is to say it drew nothing at all, and the picker showed an empty cell
 * above the word "Label" (specs/UI_ACTORS.md).
 *
 * So the cap is a BOX rather than a side, twice as wide as it is tall, and a
 * drawing smaller than it is not scaled up. What that buys is a Label that
 * reads as a strip of legible text and a Button that reads as a button, which
 * is also the truth about their proportions.
 */
export async function drawingThumbnail(
  drawing: DrawingState,
  assetBase: string,
  uploads: Record<string, string>,
  size: number,
): Promise<string> {
  const width = Math.max(1, Math.round(drawing.width));
  const height = Math.max(1, Math.round(drawing.height));
  // Never bigger than the box, never scaled up past 1:1 — an 8 by 8 drawing
  // blown up to 48 is four fat squares where a learner drew a pixel.
  const scale = Math.min(1, (size * 2) / width, size / height);
  const square = document.createElement('canvas');
  square.width = Math.max(1, Math.round(width * scale));
  square.height = Math.max(1, Math.round(height * scale));
  const target = square.getContext('2d');
  if (!target) {
    return '';
  }
  const source = document.createElement('canvas');
  source.width = width;
  source.height = height;
  const context = source.getContext('2d');
  if (!context) {
    return '';
  }
  // Every picture the commands name, loaded before any of them is drawn:
  // `paintDrawing` is synchronous because the running game's textures are
  // already in hand, and here they are not.
  const images = new Map<string, HTMLImageElement>();
  await Promise.all(
    [
      ...new Set(
        drawing.commands.flatMap(command =>
          command.op === 'image' ? [command.sprite] : [],
        ),
      ),
    ].map(async sprite => {
      try {
        images.set(
          sprite,
          await loadImage(
            uploads[sprite] ?? `${assetBase}sprites/${sprite}.png`,
          ),
        );
      } catch {
        // A picture the project no longer holds draws nothing, exactly as it
        // does in the running game.
      }
    }),
  );
  paintDrawing(context, drawing.commands, sprite => images.get(sprite));
  target.drawImage(source, 0, 0, square.width, square.height);
  return square.toDataURL('image/png');
}
