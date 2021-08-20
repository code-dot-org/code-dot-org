import {PALETTES} from './constants';
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
