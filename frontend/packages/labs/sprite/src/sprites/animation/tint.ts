import type p5 from 'p5';

export type RGBA = [number, number, number, number];

/**
 * Code.org's image tint for one pixel (ANI-34). Components are in [0, 1];
 * the result is unpremultiplied.
 */
export function tintPixel(pixel: RGBA, tint: RGBA): RGBA {
  const a = pixel[3];
  const t = tint[3];
  const alpha = a * (2 - a);
  const out: RGBA = [0, 0, 0, alpha];
  for (let i = 0; i < 3; i++) {
    const c = pixel[i];
    const tinted = (1 - t) * c + t * tint[i];
    const premultiplied =
      a * ((1 - a) * c + a * tinted * c) + a * tinted * (1 - a);
    out[i] = alpha > 0 ? premultiplied / alpha : 0;
  }
  return out;
}

/** Applies tintPixel to 8-bit RGBA image data; `tint` is 8-bit too. */
export function tintImageData(
  data: Uint8ClampedArray,
  tint: RGBA,
): Uint8ClampedArray {
  const t: RGBA = [tint[0] / 255, tint[1] / 255, tint[2] / 255, tint[3] / 255];
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const result = tintPixel(
      [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255, data[i + 3] / 255],
      t,
    );
    out[i] = Math.round(result[0] * 255);
    out[i + 1] = Math.round(result[1] * 255);
    out[i + 2] = Math.round(result[2] * 255);
    out[i + 3] = Math.round(result[3] * 255);
  }
  return out;
}

// Sources are replaced, not edited, so a tinted copy stays valid for its source's life.
const cache = new WeakMap<object, Map<string, p5.Image>>();

/**
 * Returns a copy of `image` tinted by `color`, which must already be in
 * 8-bit RGBA. Images without a canvas are returned untinted.
 */
export function tintedImage(p: p5, image: p5.Image, color: RGBA): p5.Image {
  const source = (image as unknown as {canvas?: HTMLCanvasElement}).canvas;
  if (!source || source.width === 0 || source.height === 0) {
    return image;
  }
  const key = color.join(',');
  let byTint = cache.get(image);
  if (!byTint) {
    byTint = new Map();
    cache.set(image, byTint);
  }
  const hit = byTint.get(key);
  if (hit) {
    return hit;
  }

  const pixels = source
    .getContext('2d')!
    .getImageData(0, 0, source.width, source.height);
  const result = p.createImage(source.width, source.height);
  result.pixelDensity(image.pixelDensity());
  const target = (result as unknown as {canvas: HTMLCanvasElement}).canvas;
  const context = target.getContext('2d')!;
  const data = context.createImageData(source.width, source.height);
  data.data.set(tintImageData(pixels.data, color));
  context.putImageData(data, 0, 0);
  byTint.set(key, result);
  return result;
}
