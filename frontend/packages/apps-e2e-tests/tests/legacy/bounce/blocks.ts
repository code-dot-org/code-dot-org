/**
 * Blockly workspace JSON fixtures for the Bounce lab.
 * Source: dashboard/test/ui/features/step_definitions/blockly_initialization_blocks.rb
 */

/** Winning solution for level 1: move left when left-arrow key is pressed. */
export const LEVEL_1_BOUNCE_BLOCKS =
  '{"blocks":{"languageVersion":0,"blocks":[{"type":"bounce_whenLeft","x":20,"y":20,"next":{"block":{"type":"bounce_moveLeft","id":"moveLeft"}}}]}}';

/** Winning solution for level 3: move up when up-arrow key is pressed. */
export const LEVEL_3_BOUNCE_BLOCKS =
  '{"blocks":{"languageVersion":0,"blocks":[{"type":"bounce_whenUp","x":20,"y":20,"next":{"block":{"type":"bounce_moveUp"}}}]}}';

/** Winning solution for level 5: bounce the ball when paddle collides. */
export const LEVEL_5_BOUNCE_BLOCKS =
  '{"blocks":{"languageVersion":0,"blocks":[{"type":"bounce_whenPaddleCollided","id":"whenPaddleCollided","x":20,"y":20,"next":{"block":{"type":"bounce_bounceBall"}}}]}}';
