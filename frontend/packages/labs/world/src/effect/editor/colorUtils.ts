/**
 * Conversions between the native color input's hex strings and the channel
 * literals the color nodes store. All RGB/S/L channels are 0–1; hue is
 * degrees (0–360), matching the H port learners see.
 */

/** Round to what a learner would type by hand — keeps the .effect JSON tidy. */
function tidy(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function channelHex(value: number): string {
  return Math.round(Math.min(Math.max(value, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${channelHex(r)}${channelHex(g)}${channelHex(b)}`;
}

export function hexToRgb(hex: string): {r: number; g: number; b: number} {
  return {
    r: tidy(parseInt(hex.slice(1, 3), 16) / 255),
    g: tidy(parseInt(hex.slice(3, 5), 16) / 255),
    b: tidy(parseInt(hex.slice(5, 7), 16) / 255),
  };
}

/** Hue in degrees; s and l in 0–1. Matches the GLSL helper the node emits. */
export function hslToRgb(
  h: number,
  s: number,
  l: number,
): {r: number; g: number; b: number} {
  const hue = (((h / 360) % 1) + 1) % 1;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const ramp = (offset: number) =>
    Math.min(Math.max(Math.abs(((hue * 6 + offset) % 6) - 3) - 1, 0), 1);
  return {
    r: (ramp(0) - 0.5) * chroma + l,
    g: (ramp(4) - 0.5) * chroma + l,
    b: (ramp(2) - 0.5) * chroma + l,
  };
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): {h: number; s: number; l: number} {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const range = max - min;

  if (range === 0) {
    return {h: 0, s: 0, l: tidy(l)};
  }

  const s = range / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) {
    h = ((g - b) / range) % 6;
  } else if (max === g) {
    h = (b - r) / range + 2;
  } else {
    h = (r - g) / range + 4;
  }

  return {
    h: Math.round((((h * 60) % 360) + 360) % 360),
    s: tidy(s),
    l: tidy(l),
  };
}
