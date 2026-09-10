// The whole color range in one rectangle, and the reading of a point in it.
//
// Two places let somebody choose a color by eye: the image editor's swatch
// (`imageEditor/ColorPicker`) and the `with default` slot on a `define property`
// whose type is a color (`blockly/fields/FieldColorPicker`). They differ in
// everything around the picking — one is a React popover in a modal, the other a
// Blockly dropdown hanging off a block — and agree exactly here, which is why
// this is a module of its own rather than a copy on each side.
//
// Hue runs left to right; lightness runs top to bottom, white through the pure
// hue to black. Every color the eye names is somewhere on it, and a color that
// has to be exact is typed rather than picked.

/** The rectangle's size in CSS pixels; also the canvas's own resolution. */
export const SPECTRUM_WIDTH = 240;
export const SPECTRUM_HEIGHT = 150;

// Gradient stops across the hue axis; enough that adjacent stops differ by
// 30 degrees of hue and the interpolation error is invisible.
const HUE_STOPS = 12;

/** Paint the range into `canvas`, which must already be the size above. */
export function paintSpectrum(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  const hue = ctx.createLinearGradient(0, 0, canvas.width, 0);
  for (let i = 0; i <= HUE_STOPS; i++) {
    hue.addColorStop(i / HUE_STOPS, `hsl(${(i / HUE_STOPS) * 360}, 100%, 50%)`);
  }
  ctx.fillStyle = hue;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const light = ctx.createLinearGradient(0, 0, 0, canvas.height);
  light.addColorStop(0, 'rgba(255, 255, 255, 1)');
  light.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  light.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  light.addColorStop(1, 'rgba(0, 0, 0, 1)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * The color under a pointer, as three bytes — or nothing, if the canvas has no
 * context to read.
 *
 * Read back out of the canvas rather than computed from the position, so what
 * is picked is what was seen: the two gradients above are the definition of the
 * color, and re-deriving it would be a second definition to keep in step.
 */
export function pickSpectrum(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): [number, number, number] | undefined {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return undefined;
  }
  const rect = canvas.getBoundingClientRect();
  const x = Math.min(
    canvas.width - 1,
    Math.max(0, Math.round(clientX - rect.left)),
  );
  const y = Math.min(
    canvas.height - 1,
    Math.max(0, Math.round(clientY - rect.top)),
  );
  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
  return [r, g, b];
}
