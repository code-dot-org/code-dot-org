// iOS Safari draws nothing on a canvas bigger than this.
const MAX_EXPORT_CANVAS_PIXELS = 16_777_216;

export const capExportPixelRatio = (
  pixelRatio: number,
  width: number,
  height: number
): number =>
  Math.min(pixelRatio, Math.sqrt(MAX_EXPORT_CANVAS_PIXELS / (width * height)));
