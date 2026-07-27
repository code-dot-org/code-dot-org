// The built-in appearance assets — the single source of truth for the driver's
// texture/animation preloading and the Blockly dropdowns. The PNGs are written
// by scripts/generate-sprites.mjs (which keeps its own copies of these lists for
// Node); a test (`sprites.test.ts`) asserts they all agree with each other and
// with the files on disk.

/** Frame (and static sprite) edge length, in pixels. */
export const SPRITE_SIZE = 32;

/** Static single-image sprites. */
export const SPRITE_NAMES = [
  'player',
  'ground',
  'coin',
  'box',
  'ball',
] as const;

export type SpriteName = (typeof SPRITE_NAMES)[number];

/** An animation: a horizontal spritesheet of `frames` cells, played at `frameRate`. */
export interface AnimationSpec {
  frames: number;
  frameRate: number;
}

/** Built-in looping animations, each backed by a `${name}.png` spritesheet. */
export const ANIMATIONS: Record<string, AnimationSpec> = {
  coinSpin: {frames: 6, frameRate: 12},
  playerWalk: {frames: 4, frameRate: 8},
};

export const ANIMATION_NAMES = Object.keys(ANIMATIONS);
