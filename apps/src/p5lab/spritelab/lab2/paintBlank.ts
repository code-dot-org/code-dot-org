// The blank canvas "Paint manually" opens on, sized the way an AI generation
// of the same style would come out.

import {crispScaleFor} from '@cdo/apps/pixelEditor/pixelArt';

import {ASSUMED_BLOCK, MODEL_OUTPUT_PX} from './ai/images/modelHelpers';
import {ImageStyle, ImageType} from './ai/images/types';

// Pixel style draws on the same logical grid the pixel prompt asks for.
const PIXEL_LOGICAL = MODEL_OUTPUT_PX / ASSUMED_BLOCK;

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
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, spec.size, spec.size);
  }
  return {
    dataURI: canvas.toDataURL('image/png'),
    pixelGridSize: spec.pixelGridSize,
  };
}

/**
 * Composite a data URI over opaque black. Backgrounds must be fully opaque;
 * the editor's eraser can leave holes in one.
 */
export async function flattenDataURIOverBlack(
  dataURI: string
): Promise<string> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataURI;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return dataURI;
  }
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}
