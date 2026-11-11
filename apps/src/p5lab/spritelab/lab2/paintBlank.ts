// The blank canvas "Paint manually" opens on, sized the way an AI generation
// of the same style would come out — and the stage ground color that
// background handling everywhere composites onto.

import {NATIVE_PIXEL_GRID} from '@cdo/apps/pixelEditor/pixelArt';

import {
  ASSUMED_BLOCK,
  MODEL_OUTPUT_PX,
  STORED_MAX_PX,
} from './ai/images/modelHelpers';
import {ImageStyle, ImageType} from './ai/images/types';

// A character or object drawn by hand starts on a grid this many pixels
// square. It is coarser than the 32 a generated one has, so a small picture
// takes fewer strokes to fill.
const DRAWN_SPRITE_GRID = 24;

// The grid a blank pixel-style canvas has. A hand-drawn sprite gets its own
// size; a block and a background get the grid the pixel prompt asks the AI
// for (a background's is finer).
function pixelLogical(imageType: ImageType): number {
  return imageType === 'sprite'
    ? DRAWN_SPRITE_GRID
    : MODEL_OUTPUT_PX / ASSUMED_BLOCK[imageType];
}

// The stage's ground color, which backgrounds must cover fully: blank
// background canvases start on it, generated backgrounds are flattened onto
// it, and the paint editor grounds a background on it.
export const BACKGROUND_GROUND_COLOR = '#000000';

export interface BlankPaintSpec {
  /** Canvas edge, physical px. */
  size: number;
  /** 1 for pixel style: the canvas is the art grid itself. */
  pixelGridSize?: number;
  /** Backgrounds fill the stage, so they start black; the rest transparent. */
  fill: 'black' | 'transparent';
}

export function blankPaintSpec(
  imageType: ImageType,
  style: ImageStyle
): BlankPaintSpec {
  const pixel = style === 'pixel';
  return {
    // Smooth blanks open at the stored ceiling for their type, so paint
    // output lands at the stored sizes with nothing ever cropped or
    // downscaled behind the painter's back (a 1px brush stroke must survive
    // a save/reopen round trip).
    size: pixel
      ? pixelLogical(imageType)
      : STORED_MAX_PX[imageType] ?? MODEL_OUTPUT_PX,
    pixelGridSize: pixel ? NATIVE_PIXEL_GRID : undefined,
    fill: imageType === 'background' ? 'black' : 'transparent',
  };
}

/** The spec rendered to a PNG data URI the pixel editor can open. */
export function blankPaintImage(
  imageType: ImageType,
  style: ImageStyle
): {dataURI: string; pixelGridSize?: number} {
  const spec = blankPaintSpec(imageType, style);
  const canvas = document.createElement('canvas');
  canvas.width = spec.size;
  canvas.height = spec.size;
  const ctx = canvas.getContext('2d');
  if (ctx && spec.fill === 'black') {
    ctx.fillStyle = BACKGROUND_GROUND_COLOR;
    ctx.fillRect(0, 0, spec.size, spec.size);
  }
  return {
    dataURI: canvas.toDataURL('image/png'),
    pixelGridSize: spec.pixelGridSize,
  };
}
