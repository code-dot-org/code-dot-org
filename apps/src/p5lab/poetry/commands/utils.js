import {PALETTES} from '../constants';

// NOTE: min and max are inclusive
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomColor(p5) {
  return p5
    .color('hsb(' + randomInt(0, 359) + ', 100%, 100%)')
    .toString('#rrggbb');
}

export function randomColorFromPalette(palette) {
  return PALETTES[palette][randomInt(0, PALETTES[palette].length - 1)];
}

export function lerpColorFromPalette(p5, paletteName, amount) {
  const palette = PALETTES[paletteName];
  const n = Math.floor(amount);
  const remainder = amount - n;

  const prev = palette[n % palette.length];
  const next = palette[(n + 1) % palette.length];

  return p5.lerpColor(p5.color(prev), p5.color(next), remainder);
}

export function hexToRgb(hexColor) {
  const R = parseInt(hexColor.substr(1, 2), 16);
  const G = parseInt(hexColor.substr(3, 2), 16);
  const B = parseInt(hexColor.substr(5, 2), 16);
  return {R, G, B};
}
