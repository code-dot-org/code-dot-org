// How big a project image is, without decoding it.
//
// The editor needs image dimensions to say how many cells a spritesheet holds:
// a `.sheet` gives the size of one cell, and the image says how many fit. The
// animation editor has the decoded `<img>` to hand; the Blockly side does not —
// its dropdowns are built from the flattened project, which holds no pixels.
//
// A PNG says so in its own first bytes. The IHDR chunk begins at offset 8 and
// carries width and height as big-endian 32-bit integers at offsets 16 and 20,
// so a `data:` URL can be measured by reading twenty-four bytes of it. No
// decode, no async, no browser.

import type {MultiFileSource} from '@code-dot-org/core/api';

export interface ImageSize {
  width: number;
  height: number;
}

const PNG_PREFIX = 'data:image/png;base64,';

/** The first `count` bytes of a base64 payload. */
function head(base64: string, count: number): Uint8Array | undefined {
  // 4 base64 characters carry 3 bytes; take enough of them and stop.
  const chars = Math.ceil(count / 3) * 4;
  try {
    const binary = atob(base64.slice(0, chars));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.length >= count ? bytes : undefined;
  } catch {
    return undefined; // not base64 at all
  }
}

/** The size a PNG `data:` URL declares, or undefined if it declares none. */
export function pngSize(url: string | undefined): ImageSize | undefined {
  if (!url?.startsWith(PNG_PREFIX)) {
    return undefined;
  }
  const bytes = head(url.slice(PNG_PREFIX.length), 24);
  if (!bytes) {
    return undefined;
  }
  // The signature, then a chunk that must be IHDR for this to be a PNG.
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (signature.some((byte, index) => bytes[index] !== byte)) {
    return undefined;
  }
  if (String.fromCharCode(...bytes.slice(12, 16)) !== 'IHDR') {
    return undefined;
  }
  const int = (at: number) =>
    (bytes[at] << 24) |
    (bytes[at + 1] << 16) |
    (bytes[at + 2] << 8) |
    bytes[at + 3];
  const width = int(16);
  const height = int(20);
  return width > 0 && height > 0 ? {width, height} : undefined;
}

/**
 * The sizes of the project's images, by file name.
 *
 * Only the ones that carry their bytes (`data:` URLs — everything the library
 * imports and everything the image editor saves). An image served from the
 * assets backend has no bytes here, so it has no entry, and a caller that needs
 * one treats the image as a single picture rather than guessing.
 */
export function projectImageSizes(
  source: MultiFileSource | undefined,
): Record<string, ImageSize> {
  const sizes: Record<string, ImageSize> = {};
  for (const file of Object.values(source?.files ?? {})) {
    const size = pngSize(file.url);
    if (size) {
      sizes[file.name] = size;
    }
  }
  return sizes;
}
