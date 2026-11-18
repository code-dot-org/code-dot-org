// How the pixel editor scales a picture for display and sizes the
// checkerboard behind it, for a host that shows the same picture with the
// editor closed.

// Internal display-canvas resolution: integer upscale of the backing image,
// as large as fits this budget.
const MAX_DISPLAY_SIZE = 640;
// A checkerboard cell is this many display px outside pixel mode. In pixel
// mode a cell is a whole number of art pixels, at least the smaller size.
const CHECKER_CELL_PX = 16;
const MIN_CHECKER_CELL_PX = 4;

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
