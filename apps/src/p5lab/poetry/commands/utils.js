import {randomInt, randomColor, randomColorFromPalette} from '../../utils';
import {PALETTES} from '../constants';

export {randomInt, randomColor, randomColorFromPalette};

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
