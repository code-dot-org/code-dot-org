// A character set's strip, frame by frame: what each frame is, cutting one
// out to draw on, and putting the drawn frame back.

import {toImage} from '@cdo/apps/imageUtils';

import {CHARACTER_STRIP_FRAME_COUNT} from '../../characterAnimations';

/** What each frame of the strip shows, in strip order (see
    CHARACTER_STRIP_POSES). */
export const FRAME_LABELS: readonly string[] = [
  'Idle',
  'Standing',
  'Walk',
  'Jump up',
  'Jump down',
];

/** The frame a set is drawn from, and so the one editing opens on. */
export const BASE_FRAME = 1;

export interface FrameSize {
  x: number;
  y: number;
}

/** Frames are cut the way the engine cuts them: cells row by row, wrapping
    at the image width. */
function cellOrigin(
  image: HTMLImageElement,
  frameSize: FrameSize,
  index: number
): {x: number; y: number} {
  const columns = Math.max(1, Math.floor(image.naturalWidth / frameSize.x));
  return {
    x: (index % columns) * frameSize.x,
    y: Math.floor(index / columns) * frameSize.y,
  };
}

/** One frame of the strip as a PNG data URI. */
export async function cutFrame(
  sheetSrc: string,
  frameSize: FrameSize,
  index: number
): Promise<string> {
  const image = await toImage(sheetSrc);
  const canvas = document.createElement('canvas');
  canvas.width = frameSize.x;
  canvas.height = frameSize.y;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No canvas context');
  }
  const {x, y} = cellOrigin(image, frameSize, index);
  ctx.drawImage(
    image,
    x,
    y,
    frameSize.x,
    frameSize.y,
    0,
    0,
    frameSize.x,
    frameSize.y
  );
  return canvas.toDataURL('image/png');
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
  const {x, y} = cellOrigin(sheet, frameSize, index);
  ctx.clearRect(x, y, frameSize.x, frameSize.y);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(frame, x, y, frameSize.x, frameSize.y);
  return canvas.toDataURL('image/png');
}

/** How many frames a strip of this size holds, at most the set's five. */
export function frameCount(
  sheet: {naturalWidth: number} | {width: number},
  frameSize: FrameSize
): number {
  const width = 'naturalWidth' in sheet ? sheet.naturalWidth : sheet.width;
  return Math.min(
    CHARACTER_STRIP_FRAME_COUNT,
    Math.max(1, Math.floor(width / frameSize.x))
  );
}
