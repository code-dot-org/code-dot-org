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

export const PALETTES = {
  grayscale: [
    '#000000',
    '#333333',
    '#666666',
    '#999999',
    '#CCCCCC',
    '#EEEEEE',
    '#FFFFFF'
  ],
  sky: ['#3878A4', '#82A9B1', '#ECCEC4', '#F8B8A8', '#E4929C', '#7D7095'],
  ocean: ['#7FD0F5', '#3FABE3', '#2C7DBB', '#1D57A0', '#144188', '#061F4B'],
  sunrise: ['#F5DC72', '#F4B94F', '#F48363', '#F15C4C', '#372031'],
  sunset: ['#530075', '#921499', '#E559BB', '#F7B9DD', '#307087', '#123F50'],
  spring: ['#303F06', '#385202', '#547607', '#85AF4C', '#C1E876', '#D7FF6B'],
  summer: ['#FAD0AE', '#F69F88', '#EE6E51', '#BC4946', '#425D19', '#202E14'],
  autumn: ['#484F0C', '#AEA82E', '#EEBB10', '#D46324', '#731B31', '#4A173C'],
  winter: ['#EAECE8', '#E3DDDF', '#D3CEDC', '#A2B6BF', '#626C7D', '#A4C0D0']
};
