// Internal display-canvas resolution: integer upscale of the backing image,
// as large as fits this budget.
const MAX_DISPLAY_SIZE = 640;
// A checkerboard cell is this many display px outside pixel mode. In pixel
// mode a cell is a whole number of art pixels, at least the smaller size.
const CHECKER_CELL_PX = 16;
const MIN_CHECKER_CELL_PX = 4;

/**
 * The side of one art pixel in the picture's own pixels, or null for a
 * picture that is not pixel art. A known grid counts only when it divides
 * the picture cleanly; a resize elsewhere would otherwise smear the
 * downsample.
 */
export function pixelGridFor(
  width: number,
  height: number,
  knownGrid?: number
): number | null {
  return knownGrid && width % knownGrid === 0 && height % knownGrid === 0
    ? knownGrid
    : null;
}

/** Display pixels per pixel of a backing image of this size. */
export function displayScale(width: number, height: number): number {
  return Math.max(1, Math.floor(MAX_DISPLAY_SIZE / Math.max(width, height)));
}

/** A checkerboard cell's side, in display pixels. */
export function checkerCellSize(scale: number, pixelMode: boolean): number {
  return pixelMode
    ? scale * Math.max(1, Math.ceil(MIN_CHECKER_CELL_PX / scale))
    : CHECKER_CELL_PX;
}

/** A checkerboard cell's side, as a fraction of the picture's longer side. */
export function checkerCellFraction(
  width: number,
  height: number,
  pixelMode: boolean
): number {
  const scale = displayScale(width, height);
  return checkerCellSize(scale, pixelMode) / (Math.max(width, height) * scale);
}
