// The built-in appearance assets the DRIVER preloads — its manifest of which
// vendor PNGs are single images vs. spritesheets. The engine owns animation
// timing (rules/animation.ts stock library); this side only says how to load the
// textures. `generate-sprites.mjs` writes the PNGs; a test (`sprites.test.ts`)
// keeps the three lists — this manifest, the generator, and the engine stock —
// in agreement.

/** Frame (and static sprite) edge length, in pixels. */
export const SPRITE_SIZE = 32;

/** Static single-image sprites (loaded via `load.image`). */
export const SPRITE_NAMES = [
  'player',
  'ground',
  'coin',
  'box',
  'ball',
] as const;

export type SpriteName = (typeof SPRITE_NAMES)[number];

/**
 * Spritesheet names (loaded via `load.spritesheet`, `frameWidth = SPRITE_SIZE`).
 * Each also names a stock animation the engine ships under the same id.
 */
export const SPRITESHEET_NAMES = ['coinSpin', 'playerWalk'] as const;
