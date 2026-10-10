/**
 * Background removal (chroma key) for AI-generated images. Every prompt
 * names the flat colour it wants behind the subject (keyColor.ts), and the
 * keyer clears that colour wherever it is. Two matte styles: sharp (binary
 * alpha, what pixel art wants) and soft (a feathered, despilled edge, what
 * illustrated art wants). keyOutColor() holds the per-pixel decision
 * (unit-testable without a canvas); removeKeyColor() is the thin canvas
 * wrapper. The other helpers here are the canvas steps around it.
 */

import {
  ALPHA_THRESHOLD,
  findOpaqueBounds,
} from '@cdo/apps/p5lab/spritelab/lab2/imageTrim';
import {BACKGROUND_GROUND_COLOR} from '@cdo/apps/p5lab/spritelab/lab2/paintBlank';

import {clearMinorComponents} from './specks';

export interface MatteOptions {
  // Soft matte feathers the edge (partial alpha + despill). When false
  // (default) the cut is binary, which is correct for pixel art.
  soft?: boolean;
}

// How much a pixel is the key colour, 0–255: the least of the channels the
// key has full minus the most of the channels it has none of. Pure magenta
// scores 255, and so does a shaded, textured or noisy magenta as long as
// red and blue stay well above green — which is the point: a background the
// model paints with texture instead of flat colour still keys out, where a
// fixed distance from pure magenta left clouds of it behind. Nothing a
// character wears scores high: a purple robe at (120, 60, 180) scores 60.
function keySignature(
  data: Uint8ClampedArray,
  index: number,
  key: [number, number, number]
): number {
  let full = 255;
  let none = 0;
  for (let c = 0; c < 3; c++) {
    if (key[c] >= 128) {
      full = Math.min(full, data[index + c]);
    } else {
      none = Math.max(none, data[index + c]);
    }
  }
  return full - none;
}

// A pixel at or above this signature is background outright. Pixels in the
// band below it that the background can reach — flooding out from the
// outright pixels through the band — are background too: the darker
// patches of a textured backdrop, and the anti-aliased edge where key and
// character blend. The band's floor keeps a saturated costume out of reach
// (keySignature's robe example scores 60).
const KEY_SIGNATURE = 150;
const KEY_EDGE_SIGNATURE = 65;

// A backdrop that came back duller than asked scores under KEY_SIGNATURE
// everywhere, so no flood starts and all of it stays. The prompt puts the
// backdrop on every edge: when the border is one flat colour (10th to 90th
// percentile within the spread) scoring in the band, the outright cutoff
// drops to just under its median. A border that scores under the floor,
// varies, or is mostly transparent already leaves the cutoff alone.
const DULL_KEY_FLOOR = 90;
const DULL_KEY_MARGIN = 24;
const DULL_KEY_SPREAD = 40;

function outrightCutoff(
  data: Uint8ClampedArray,
  signature: Uint8ClampedArray,
  width: number,
  height: number
): number {
  const border: number[] = [];
  let ring = 0;
  const take = (p: number) => {
    ring++;
    if (data[p * 4 + 3] > 0) {
      border.push(signature[p]);
    }
  };
  for (let x = 0; x < width; x++) {
    take(x);
    if (height > 1) {
      take((height - 1) * width + x);
    }
  }
  for (let y = 1; y < height - 1; y++) {
    take(y * width);
    if (width > 1) {
      take(y * width + width - 1);
    }
  }
  if (border.length < ring / 2) {
    return KEY_SIGNATURE;
  }
  border.sort((a, b) => a - b);
  const median = border[border.length >> 1];
  const spread =
    border[Math.floor(border.length * 0.9)] -
    border[Math.floor(border.length * 0.1)];
  if (
    median < DULL_KEY_FLOOR ||
    median >= KEY_SIGNATURE ||
    spread > DULL_KEY_SPREAD
  ) {
    return KEY_SIGNATURE;
  }
  return Math.max(
    KEY_EDGE_SIGNATURE + DULL_KEY_MARGIN,
    median - DULL_KEY_MARGIN
  );
}

/**
 * Key out a KNOWN colour everywhere in RGBA data — enclosed gaps included,
 * with no dependence on what the corners hold. Pixels carrying the key's
 * signature go transparent; the band below floods from them, so a shaded
 * or textured backdrop dissolves completely; band pixels that touch the
 * character are its edge and go too (sharp) or fade by their signature and
 * lose the key's tint (soft); stray specks the flood missed are cleared.
 */
export function keyOutColor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  key: [number, number, number],
  options: MatteOptions = {}
): void {
  const total = width * height;
  // 0 = character, 1 = cleared outright, 2 = band reached by the flood.
  const kind = new Uint8Array(total);
  const signature = new Uint8ClampedArray(total);
  for (let p = 0; p < total; p++) {
    signature[p] = keySignature(data, p * 4, key);
  }
  const cutoff = outrightCutoff(data, signature, width, height);
  const queue: number[] = [];
  for (let p = 0; p < total; p++) {
    if (data[p * 4 + 3] === 0) {
      kind[p] = 1;
      queue.push(p);
    } else if (signature[p] >= cutoff) {
      data[p * 4 + 3] = 0;
      kind[p] = 1;
      queue.push(p);
    }
  }
  const neighbours = (p: number, visit: (q: number) => void) => {
    const x = p % width;
    const y = (p - x) / width;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if ((dx || dy) && nx >= 0 && ny >= 0 && nx < width && ny < height) {
          visit(ny * width + nx);
        }
      }
    }
  };
  // Flood the band from the cleared pixels.
  for (let head = 0; head < queue.length; head++) {
    neighbours(queue[head], q => {
      if (kind[q] === 0 && signature[q] >= KEY_EDGE_SIGNATURE) {
        kind[q] = 2;
        queue.push(q);
      }
    });
  }
  for (let p = 0; p < total; p++) {
    if (kind[p] !== 2) {
      continue;
    }
    let touchesCharacter = false;
    neighbours(p, q => {
      if (kind[q] === 0) {
        touchesCharacter = true;
      }
    });
    if (options.soft && touchesCharacter) {
      const alpha = Math.min(
        1,
        (cutoff - signature[p]) / (cutoff - KEY_EDGE_SIGNATURE)
      );
      // Despill: an edge pixel is the character's colour blended with the
      // key by (1 - alpha); take the key's share back out, or the fringe
      // keeps a tint of it and reads as a halo over any background.
      for (let c = 0; c < 3; c++) {
        const i = p * 4 + c;
        data[i] = Math.max(
          0,
          Math.min(255, Math.round((data[i] - (1 - alpha) * key[c]) / alpha))
        );
      }
      data[p * 4 + 3] = Math.round(data[p * 4 + 3] * alpha);
    } else {
      data[p * 4 + 3] = 0;
    }
  }
  // Specks: a lone pixel the background surrounds is background too.
  for (let p = 0; p < total; p++) {
    if (kind[p] !== 0 || data[p * 4 + 3] === 0) {
      continue;
    }
    let clear = 0;
    let all = 0;
    neighbours(p, q => {
      all++;
      if (data[q * 4 + 3] === 0) {
        clear++;
      }
    });
    if (all === 8 && clear >= 7) {
      data[p * 4 + 3] = 0;
    }
  }
}

/** Remove a known key colour from an image Blob and return a new PNG Blob. */
export async function removeKeyColor(
  blob: Blob,
  key: [number, number, number],
  options: MatteOptions = {}
): Promise<Blob> {
  const img = await loadImageFromBlob(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  keyOutColor(imageData.data, imageData.width, imageData.height, key, options);
  ctx.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas);
}

/** A canvas's pixels as a PNG Blob; rejects if the canvas can't encode. */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(result => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Crop an image Blob to its opaque content bounds and return a new PNG Blob.
 * Returns the input unchanged when there's nothing to crop (full-bleed
 * content or nothing opaque). Run after keying: the delivered image then
 * fills its own frame edge-to-edge, so grid-placed copies tile seamlessly no
 * matter how much margin the model left. Stray marks do not count toward
 * the bounds, or a line at the edge would hold the crop open.
 */
export async function cropToContent(blob: Blob): Promise<Blob> {
  const img = await loadImageFromBlob(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const counted = imageData.data.slice();
  clearMinorComponents(
    counted,
    imageData.width,
    imageData.height,
    ALPHA_THRESHOLD
  );
  const bounds = findOpaqueBounds(counted, imageData.width, imageData.height);
  if (
    !bounds ||
    (bounds.left === 0 &&
      bounds.top === 0 &&
      bounds.right === canvas.width - 1 &&
      bounds.bottom === canvas.height - 1)
  ) {
    return blob;
  }

  const cropped = document.createElement('canvas');
  cropped.width = bounds.right - bounds.left + 1;
  cropped.height = bounds.bottom - bounds.top + 1;
  cropped
    .getContext('2d')!
    .drawImage(
      canvas,
      bounds.left,
      bounds.top,
      cropped.width,
      cropped.height,
      0,
      0,
      cropped.width,
      cropped.height
    );

  return canvasToBlob(cropped);
}

/**
 * Crop an image Blob to a square of its shorter side and return a new PNG
 * Blob; the input unchanged when it is square already. A ground block is
 * shown in a square cell, scaled to fit, so a block that came back a little
 * taller than wide would leave a gap above and below every copy. A wide
 * block loses equal margins at the sides; a tall one keeps its top edge,
 * the surface a character stands on, and loses the bottom. Cropping keeps
 * a pixel block's grid where a stretch would not.
 */
export async function cropToSquare(blob: Blob): Promise<Blob> {
  const img = await loadImageFromBlob(blob);
  if (img.width === img.height) {
    return blob;
  }
  const side = Math.min(img.width, img.height);
  const left = Math.floor((img.width - side) / 2);
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  canvas
    .getContext('2d')!
    .drawImage(img, left, 0, side, side, 0, 0, side, side);
  return canvasToBlob(canvas);
}

/** Decode an image Blob into an element ready to draw. */
export function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Composite a PNG blob over the stage's ground color. Backgrounds must be
 * fully opaque: model output sometimes carries transparent pixels, which
 * would show the stage through the artwork.
 */
export async function flattenOntoGround(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return blob;
  }
  ctx.fillStyle = BACKGROUND_GROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvasToBlob(canvas).catch(() => blob);
}
