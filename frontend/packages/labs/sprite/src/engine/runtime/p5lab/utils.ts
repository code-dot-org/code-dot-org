import type {SpriteP5} from '../../../sprites';

// NOTE: min and max are inclusive
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Requires two arrays
export function arrayEquals(a: unknown[], b: unknown[]): boolean {
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

interface SpriteBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export interface SpriteCollider {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// Creates and returns a helper object that represents the outer bounds of a sprite.
// Used for comparing the positions of sprites. For example, checking whether
// one sprite is directly above ("standing on top of") another.
export function createSpriteCollider(sprite: SpriteBounds): SpriteCollider {
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

export function randomColor(p5: SpriteP5): string {
  return p5
    .color('hsb(' + randomInt(0, 359) + ', 100%, 100%)')
    .toString('#rrggbb');
}

export function randomColorFromPalette(palette: string[]): string {
  return palette[randomInt(0, palette.length - 1)];
}

export function formatForPlayspace(value: unknown): string {
  const isScientific = typeof value === 'number' && Math.abs(value) >= 1e21;
  return isScientific ? (value as number).toPrecision(2) : `${value}`;
}
