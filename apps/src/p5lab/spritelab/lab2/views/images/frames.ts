// A character set is stored as one image: a strip of five frames side by
// side. This module names the frames, cuts one out to draw on, and puts
// the drawn frame back.

import {toImage} from '@cdo/apps/imageUtils';
import {
  CHARACTER_STRIP_BASE_FRAME,
  CHARACTER_STRIP_FRAME_COUNT,
  drawStripCell,
  FrameSize,
  stripCellOrigin,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';

/** What each frame of the strip shows, in strip order (see
    CHARACTER_STRIP_POSES). */
export const FRAME_LABELS: readonly string[] = [
  'Idle',
  'Standing',
  'Walk',
  'Jump up',
  'Jump down',
];

/** The frames as the row shows them: the standing frame first, then the
    rest in strip order. */
export const FRAME_ROW_ORDER: readonly number[] = [
  CHARACTER_STRIP_BASE_FRAME,
  ...Array.from({length: CHARACTER_STRIP_FRAME_COUNT}, (_, i) => i).filter(
    i => i !== CHARACTER_STRIP_BASE_FRAME
  ),
];

/** One frame of the strip as a PNG data URI. */
export async function cutFrame(
  sheetSrc: string,
  frameSize: FrameSize,
  index: number
): Promise<string> {
  const image = await toImage(sheetSrc);
  return drawStripCell(image, frameSize, index).toDataURL('image/png');
}

/** The strip with one frame replaced by drawn pixels, as a PNG data URI.
    The drawn frame is fitted to the cell. */
export async function replaceFrame(
  sheetSrc: string,
  frameSize: FrameSize,
  index: number,
  frameSrc: string
): Promise<string> {
  const [sheet, frame] = await Promise.all([
    toImage(sheetSrc),
    toImage(frameSrc),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = sheet.naturalWidth;
  canvas.height = sheet.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No canvas context');
  }
  ctx.drawImage(sheet, 0, 0);
  const {x, y} = stripCellOrigin(sheet.naturalWidth, frameSize, index);
  ctx.clearRect(x, y, frameSize.x, frameSize.y);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(frame, x, y, frameSize.x, frameSize.y);
  return canvas.toDataURL('image/png');
}

/** How many frames a strip `imageWidth` wide holds, at most the set's
    five. */
export function frameCount(imageWidth: number, frameSize: FrameSize): number {
  return Math.min(
    CHARACTER_STRIP_FRAME_COUNT,
    Math.max(1, Math.floor(imageWidth / frameSize.x))
  );
}
