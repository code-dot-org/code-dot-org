// The blank canvas "Paint manually" opens on, sized the way an AI generation
// of the same style would come out — and the stage ground color that
// background handling everywhere composites onto.

import {crispScaleFor} from '@cdo/apps/pixelEditor/pixelArt';

import {ASSUMED_BLOCK, MODEL_OUTPUT_PX} from './ai/images/modelHelpers';
import {ImageStyle, ImageType} from './ai/images/types';

// Pixel style draws on the same logical grid the pixel prompt asks for.
const PIXEL_LOGICAL = MODEL_OUTPUT_PX / ASSUMED_BLOCK;

// The stage's ground color, which backgrounds must cover fully: blank
// background canvases start on it, generated backgrounds are flattened onto
// it, and the paint editor grounds a background on it.
export const BACKGROUND_GROUND_COLOR = '#000000';

export interface BlankPaintSpec {
  /** Canvas edge, physical px. */
  size: number;
  /** Physical px per art pixel; set for pixel style. */
  pixelGridSize?: number;
  /** Backgrounds fill the stage, so they start black; the rest transparent. */
  fill: 'black' | 'transparent';
}

export function blankPaintSpec(
  imageType: ImageType,
  style: ImageStyle
): BlankPaintSpec {
  const pixelGridSize =
    style === 'pixel' ? crispScaleFor(PIXEL_LOGICAL, PIXEL_LOGICAL) : undefined;
  return {
    size: pixelGridSize ? PIXEL_LOGICAL * pixelGridSize : MODEL_OUTPUT_PX,
    pixelGridSize,
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
