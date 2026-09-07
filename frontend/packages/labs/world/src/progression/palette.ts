// The map's colors, solved rather than chosen.
//
// The first version picked one HSL lightness per role and used it for every
// region: `hsl(var(--hue) 52% 62%)` for a finished tile, white text on top.
// That reads fine for a blue and fails outright for a yellow-green, because
// **HSL lightness is not luminance** — hsl(90 52% 62%) and hsl(245 52% 62%) are
// the same "lightness" and differ by a factor of four in how bright they
// actually are. Measured across the fourteen region hues, white on the finished
// tile ran from 1.79:1 to 4.6:1, against a floor of 4.5.
//
// So a color here is asked for by LUMINANCE, and the lightness that produces it
// is found by bisection. Every region then gets the same contrast whatever its
// hue, and the ratios below hold by construction rather than by inspection —
// which is what `__tests__/palette.test.ts` checks, hue by hue, both themes.

/** Relative luminance of an sRGB color, per WCAG. */
export const luminance = ([r, g, b]: readonly [
  number,
  number,
  number,
]): number => {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** The WCAG contrast ratio between two sRGB colors. */
export const contrast = (
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): number => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

/** `#rrggbb` as a triple. */
export const rgb = (hex: string): [number, number, number] => {
  const value = parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

/** HSL to sRGB, with hue in degrees and the rest in percent. */
const hslToRgb = (
  h: number,
  s: number,
  l: number,
): [number, number, number] => {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r, g, b] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x];
  const m = light - c / 2;
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
};

const toHex = ([r, g, b]: readonly [number, number, number]): string =>
  `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;

/**
 * The color of this hue, at this saturation, that has the luminance asked for.
 *
 * Luminance rises monotonically with HSL lightness at a fixed hue and
 * saturation, so thirty steps of bisection land within a rounding error of the
 * target — and the target is what the contrast ratios were derived from.
 */
export const atLuminance = (
  hue: number,
  saturation: number,
  target: number,
): string => {
  let low = 0;
  let high = 100;
  for (let step = 0; step < 30; step++) {
    const mid = (low + high) / 2;
    if (luminance(hslToRgb(hue, saturation, mid)) < target) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return toHex(hslToRgb(hue, saturation, (low + high) / 2));
};

/**
 * The luminances every color on the map is built from, and what each one is
 * for. Changing a number here changes a contrast ratio, and the palette test
 * says which.
 */
const TARGETS = {
  light: {
    /** The wash behind a region's tiles. A tint; nothing reads directly on it. */
    field: 0.78,
    /** A finished tile. Dark ink on it clears 4.5:1. */
    tone: 0.3,
    /** Outlines, strokes and prerequisite bars. Clears 3:1 on field and surface. */
    line: 0.19,
    /** A region's name, which sits on the page. Clears 4.5:1 there. */
    name: 0.15,
  },
  dark: {
    field: 0.045,
    tone: 0.105,
    line: 0.3,
    name: 0.45,
  },
} as const;

/** Saturation per role. Fixed; the lightness is what moves. */
const SATURATION = {field: 52, tone: 58, line: 55, name: 55} as const;

export type Theme = 'light' | 'dark';

export interface RegionColours {
  field: string;
  tone: string;
  line: string;
  name: string;
}

/** The four colors a region is drawn in, for one theme. */
export const regionColors = (hue: number, theme: Theme): RegionColours => {
  const targets = TARGETS[theme];
  return {
    field: atLuminance(hue, SATURATION.field, targets.field),
    tone: atLuminance(hue, SATURATION.tone, targets.tone),
    line: atLuminance(hue, SATURATION.line, targets.line),
    name: atLuminance(hue, SATURATION.name, targets.name),
  };
};

/**
 * Everything that is not a region's own color: the surfaces the map is drawn
 * on, the ink, and the grays a locked tile uses.
 *
 * Here rather than in the stylesheet because the palette test measures them
 * against the region colors, and a value the test cannot see is a value that
 * can drift out of contrast without anybody noticing.
 */
export const SURFACES = {
  light: {
    page: '#fbfbfc',
    /** An unfinished tile that is ready to start. */
    surface: '#ffffff',
    ink: '#1f1f24',
    shutFill: '#e7e7ec',
    shutInk: '#4d4d55',
    shutLine: '#7c7a8b',
    /** The ring around the tile whose detail is open. */
    ring: '#1b1b20',
    focus: '#17399e',
  },
  dark: {
    page: '#131317',
    surface: '#22222a',
    ink: '#eceff4',
    shutFill: '#1c1c22',
    shutInk: '#9a9aa6',
    shutLine: '#706d7e',
    ring: '#f2f2f6',
    focus: '#88aef9',
  },
} as const;
