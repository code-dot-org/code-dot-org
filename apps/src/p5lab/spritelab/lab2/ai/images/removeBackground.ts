/**
 * Background removal (chroma key) for AI-generated images: the key color is
 * sampled from the top-left corner and flood-filled out. Two matte styles:
 * sharp (binary alpha, what pixel art wants) and soft (feathered edge ramp
 * with key-spill suppression, what illustrated art wants). keyOutBackground()
 * holds the per-pixel decision (unit-testable without a canvas);
 * removeBackground() is the thin canvas wrapper.
 */

import {findOpaqueBounds} from '@cdo/apps/p5lab/spritelab/lab2/imageTrim';
import {BACKGROUND_GROUND_COLOR} from '@cdo/apps/p5lab/spritelab/lab2/paintBlank';

export interface MatteOptions {
  // Soft matte feathers the edge (partial alpha + spill suppression). When
  // false (default) the cut is binary, which is correct for pixel art.
  soft?: boolean;
  // Chroma distance (max per-channel, 0-255) at/below which a pixel counts as
  // pure background and is made fully transparent.
  lowThreshold?: number;
  // Soft matte only: distance up to which a background-connected pixel is still
  // part of the edge ramp and gets partial alpha. Ignored when sharp.
  highThreshold?: number;
}

// Soft matte: ramp output below this becomes fully transparent. A "flat"
// generated background is never perfectly flat, so without a floor the whole
// background region keeps a near-invisible veil that becomes the image's
// content bounds (trims, platformer footing). Real edges ramp steeply
// through this range.
const SOFT_ALPHA_FLOOR = 48;

// Max per-channel difference from the reference color. Cheap and good enough
// for a flat key color.
function chromaDistance(
  data: Uint8ClampedArray,
  px: number,
  refR: number,
  refG: number,
  refB: number
): number {
  return Math.max(
    Math.abs(data[px] - refR),
    Math.abs(data[px + 1] - refG),
    Math.abs(data[px + 2] - refB)
  );
}

// The key color's strictly dominant RGB channel, or null when no single
// channel dominates. Spill suppression only makes sense for single-channel
// keys (green, blue, red-ish); for mixed keys (magenta, cyan, white) clamping
// one channel would shift hue, so it's skipped.
function dominantChannel(r: number, g: number, b: number): number | null {
  const channels = [r, g, b];
  const max = Math.max(r, g, b);
  return channels.filter(c => c === max).length === 1
    ? channels.indexOf(max)
    : null;
}

// Pull a key-dominant edge pixel back toward its other channels, removing the
// key-colored halo left when the subject's anti-aliased edge blended into the
// key color.
function suppressKeySpill(
  data: Uint8ClampedArray,
  px: number,
  keyChannel: number
): void {
  const others = [0, 1, 2].filter(c => c !== keyChannel);
  const maxOther = Math.max(data[px + others[0]], data[px + others[1]]);
  if (data[px + keyChannel] > maxOther) {
    data[px + keyChannel] = maxOther;
  }
}

/**
 * Key out the background in-place. The reference color is read from pixel
 * (0, 0); every pixel connected to it (4-neighbour) within the threshold band
 * is made transparent (sharp) or feathered (soft). Pixels beyond highThreshold
 * are treated as subject and the fill does not cross them, so key color
 * *inside* the subject is preserved.
 */
export function keyOutBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  {soft = false, lowThreshold = 30, highThreshold = 90}: MatteOptions = {}
): void {
  const refR = data[0];
  const refG = data[1];
  const refB = data[2];

  // Sharp matte collapses the band to a single threshold (binary cut).
  const hi = soft ? Math.max(highThreshold, lowThreshold) : lowThreshold;
  const keyChannel = soft ? dominantChannel(refR, refG, refB) : null;

  const visited = new Uint8Array(width * height);
  const stack: number[] = [0];
  visited[0] = 1;

  while (stack.length > 0) {
    const idx = stack.pop()!;
    const px = idx * 4;
    const dist = chromaDistance(data, px, refR, refG, refB);

    // Subject pixel: keep it opaque and don't let the fill cross it.
    if (dist > hi) {
      continue;
    }

    if (!soft || dist <= lowThreshold) {
      // Pure background.
      data[px + 3] = 0;
    } else {
      // Edge ramp: partial alpha, spill-suppressed. Below the floor it's
      // background noise, not edge — cut it (see SOFT_ALPHA_FLOOR).
      const alpha = Math.round(
        (255 * (dist - lowThreshold)) / (hi - lowThreshold)
      );
      data[px + 3] = alpha < SOFT_ALPHA_FLOOR ? 0 : alpha;
      if (data[px + 3] > 0 && keyChannel !== null) {
        suppressKeySpill(data, px, keyChannel);
      }
    }

    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0 && !visited[idx - 1]) {
      visited[idx - 1] = 1;
      stack.push(idx - 1);
    }
    if (x < width - 1 && !visited[idx + 1]) {
      visited[idx + 1] = 1;
      stack.push(idx + 1);
    }
    if (y > 0 && !visited[idx - width]) {
      visited[idx - width] = 1;
      stack.push(idx - width);
    }
    if (y < height - 1 && !visited[idx + width]) {
      visited[idx + width] = 1;
      stack.push(idx + width);
    }
  }
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
// character blend. The band's floor keeps a saturated purple costume out
// of reach (a robe at (120, 60, 180) scores 60).
const KEY_SIGNATURE = 150;
const KEY_EDGE_SIGNATURE = 65;

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
  const queue: number[] = [];
  for (let p = 0; p < total; p++) {
    if (data[p * 4 + 3] === 0) {
      kind[p] = 1;
      queue.push(p);
      continue;
    }
    signature[p] = keySignature(data, p * 4, key);
    if (signature[p] >= KEY_SIGNATURE) {
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
        (KEY_SIGNATURE - signature[p]) / (KEY_SIGNATURE - KEY_EDGE_SIGNATURE)
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

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
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
 * Remove the background from an image Blob and return a new PNG Blob.
 *
 * @param blob  The source image.
 * @param options  Matte style (see MatteOptions). Defaults to a sharp cut.
 */
export async function removeBackground(
  blob: Blob,
  options: MatteOptions = {}
): Promise<Blob> {
  const img = await loadImageFromBlob(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  keyOutBackground(imageData.data, imageData.width, imageData.height, options);
  ctx.putImageData(imageData, 0, 0);

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
 * matter how much margin the model left.
 */
export async function cropToContent(blob: Blob): Promise<Blob> {
  const img = await loadImageFromBlob(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bounds = findOpaqueBounds(
    imageData.data,
    imageData.width,
    imageData.height
  );
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

  return new Promise<Blob>((resolve, reject) => {
    cropped.toBlob(result => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
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
  const out = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/png')
  );
  return out || blob;
}
