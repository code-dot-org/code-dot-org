// NOTE: min and max are inclusive
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Requires two arrays
export function arrayEquals(a, b) {
  if (a.length !== b.length) {
    return false;
  } // compare the value of each element in the array

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

// Creates and returns a helper object that represents the outer bounds of a sprite.
// Used for comparing the positions of sprites. For example, checking whether
// one sprite is directly above ("standing on top of") another.
export function createSpriteCollider(sprite) {
  const {x, y, width, height, scale} = sprite;
  /**
   * Explanation of sprite properties:
   * x: The x position of the center of the sprite.
   * y: The y position of the center of the sprite.
   * width: Height of the sprite's current image in pixels. Default is 100.
   * heigh: Width of the sprite's current image in pixels. Default is 100.
   * scale: The scaling factor applied to the sprite's image. Default is 1.0.
   */
  return {
    top: y - (height * scale) / 2,
    bottom: y + (height * scale) / 2,
    left: x - (width * scale) / 2,
    right: x + (width * scale) / 2,
  };
}

export function randomColor(p5) {
  return p5
    .color('hsb(' + randomInt(0, 359) + ', 100%, 100%)')
    .toString('#rrggbb');
}

export function randomColorFromPalette(palette) {
  return palette[randomInt(0, palette.length - 1)];
}

export function formatForPlayspace(value) {
  const isScientific = typeof value === 'number' && Math.abs(value) >= 1e21;
  return isScientific ? value.toPrecision(2) : `${value}`;
}
