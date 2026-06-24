import {ExcalidrawSourceWithExternalFiles} from '@cdo/apps/lab2/types';

import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_STROKE_COLOR,
} from '../elementToolbars/toolbarPalettes';

export type ExcalidrawTheme = 'light' | 'dark';

// sketchlab's palette covers these six hues plus a neutral. The var() names
// mirror the swatches in toolbarPalettes.ts and the custom properties in
// element-toolbar.module.scss.
type SketchlabFamily =
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';

// Excalidraw's element color picker draws from open-color. We capture every
// shade of each family so a stroke or fill picked at any lightness still maps
// onto the matching sketchlab hue. Source: @excalidraw/excalidraw COLOR_PALETTE
// (open-color gray/red/pink/grape/violet/blue/cyan/teal/green/yellow/orange).
const OPEN_COLOR_SHADES: Record<string, string[]> = {
  gray: [
    '#f8f9fa',
    '#f1f3f5',
    '#e9ecef',
    '#dee2e6',
    '#ced4da',
    '#adb5bd',
    '#868e96',
    '#495057',
    '#343a40',
    '#212529',
  ],
  red: [
    '#fff5f5',
    '#ffe3e3',
    '#ffc9c9',
    '#ffa8a8',
    '#ff8787',
    '#ff6b6b',
    '#fa5252',
    '#f03e3e',
    '#e03131',
    '#c92a2a',
  ],
  pink: [
    '#fff0f6',
    '#ffdeeb',
    '#fcc2d7',
    '#faa2c1',
    '#f783ac',
    '#f06595',
    '#e64980',
    '#d6336c',
    '#c2255c',
    '#a61e4d',
  ],
  grape: [
    '#f8f0fc',
    '#f3d9fa',
    '#eebefa',
    '#e599f7',
    '#da77f2',
    '#cc5de8',
    '#be4bdb',
    '#ae3ec9',
    '#9c36b5',
    '#862e9c',
  ],
  violet: [
    '#f3f0ff',
    '#e5dbff',
    '#d0bfff',
    '#b197fc',
    '#9775fa',
    '#845ef7',
    '#7950f2',
    '#7048e8',
    '#6741d9',
    '#5f3dc4',
  ],
  blue: [
    '#e7f5ff',
    '#d0ebff',
    '#a5d8ff',
    '#74c0fc',
    '#4dabf7',
    '#339af0',
    '#228be6',
    '#1c7ed6',
    '#1971c2',
    '#1864ab',
  ],
  cyan: [
    '#e3fafc',
    '#c5f6fa',
    '#99e9f2',
    '#66d9e8',
    '#3bc9db',
    '#22b8cf',
    '#15aabf',
    '#1098ad',
    '#0c8599',
    '#0b7285',
  ],
  teal: [
    '#e6fcf5',
    '#c3fae8',
    '#96f2d7',
    '#63e6be',
    '#38d9a9',
    '#20c997',
    '#12b886',
    '#0ca678',
    '#099268',
    '#087f5b',
  ],
  green: [
    '#ebfbee',
    '#d3f9d8',
    '#b2f2bb',
    '#8ce99a',
    '#69db7c',
    '#51cf66',
    '#40c057',
    '#37b24d',
    '#2f9e44',
    '#2b8a3e',
  ],
  yellow: [
    '#fff9db',
    '#fff3bf',
    '#ffec99',
    '#ffe066',
    '#ffd43b',
    '#fcc419',
    '#fab005',
    '#f59f00',
    '#f08c00',
    '#e67700',
  ],
  orange: [
    '#fff4e6',
    '#ffe8cc',
    '#ffd8a8',
    '#ffc078',
    '#ffa94d',
    '#ff922b',
    '#fd7e14',
    '#f76707',
    '#e8590c',
    '#d9480f',
  ],
};

// sketchlab has no cyan/teal/orange/violet/grape swatch, so those collapse onto
// the nearest available hue.
const FAMILY_TO_SKETCHLAB: Record<string, SketchlabFamily> = {
  red: 'red',
  pink: 'pink',
  grape: 'purple',
  violet: 'purple',
  blue: 'blue',
  cyan: 'blue',
  teal: 'green',
  green: 'green',
  yellow: 'yellow',
  orange: 'yellow',
  gray: 'gray',
};

const HEX_TO_FAMILY: Map<string, SketchlabFamily> = (() => {
  const map = new Map<string, SketchlabFamily>();
  for (const [excalidrawFamily, shades] of Object.entries(OPEN_COLOR_SHADES)) {
    const family = FAMILY_TO_SKETCHLAB[excalidrawFamily];
    for (const shade of shades) {
      map.set(shade, family);
    }
  }
  return map;
})();

const BLACK_HEXES = new Set(['#1e1e1e', '#000000', '#000']);
const WHITE_HEXES = new Set(['#ffffff', '#fff']);
const DARK_CANVAS_HEXES = new Set([...BLACK_HEXES, '#121212']);

// Lowercase and trim all inputs, and expand #rgb to #rrggbb so palette lookups are exact.
// Leaves 'transparent' and any non-hex value untouched.
function normalizeColor(color: string): string {
  const value = color.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return value;
}

export function detectExcalidrawTheme(
  source: ExcalidrawSourceWithExternalFiles
): ExcalidrawTheme {
  const viewBackgroundColor = source.appState?.viewBackgroundColor;
  if (viewBackgroundColor) {
    const normalized = normalizeColor(viewBackgroundColor);
    if (WHITE_HEXES.has(normalized)) return 'light';
    if (DARK_CANVAS_HEXES.has(normalized)) return 'dark';
  }
  if (source.appState?.theme === 'dark') return 'dark';
  return 'light';
}

// The neutral that reads as "ink" in the source theme: black in light, white
// in dark. This is the color that should follow the rendering theme's default
// stroke, so it maps to var(--sketchlab-stroke-default).
function isInkNeutral(normalized: string, theme: ExcalidrawTheme): boolean {
  return theme === 'dark'
    ? WHITE_HEXES.has(normalized)
    : BLACK_HEXES.has(normalized);
}

// True when an element's fill equals the source theme's canvas color (white in
// light, black in dark).
function fillMatchesCanvas(
  normalized: string,
  theme: ExcalidrawTheme
): boolean {
  return theme === 'dark'
    ? BLACK_HEXES.has(normalized)
    : WHITE_HEXES.has(normalized);
}

export function mapStrokeColor(color: string, theme: ExcalidrawTheme): string {
  const normalized = normalizeColor(color);
  if (normalized === 'transparent') return 'transparent';
  if (isInkNeutral(normalized, theme)) return DEFAULT_STROKE_COLOR;
  const family = HEX_TO_FAMILY.get(normalized);
  if (family && family !== 'gray') {
    return `var(--sketchlab-stroke-${family})`;
  }
  return color;
}

export function mapBackgroundColor(
  color: string,
  theme: ExcalidrawTheme
): string {
  const normalized = normalizeColor(color);
  if (normalized === 'transparent') return 'transparent';
  if (fillMatchesCanvas(normalized, theme)) return DEFAULT_BACKGROUND_COLOR;
  const family = HEX_TO_FAMILY.get(normalized);
  if (family) {
    return `var(--sketchlab-bg-${family})`;
  }
  return color;
}
