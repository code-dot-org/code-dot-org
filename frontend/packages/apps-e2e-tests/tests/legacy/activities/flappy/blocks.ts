/**
 * Blockly workspace JSON fixtures for the Flappy lab.
 * Source: dashboard/test/ui/features/step_definitions/blockly_initialization_blocks.rb
 */

/** Winning solution for level 1: flap on click. */
export const LEVEL_1_FLAPPY_BLOCKS =
  '{"blocks":{"languageVersion":0,"blocks":[{"type":"flappy_whenClick","x":20,"y":20,"next":{"block":{"type":"flappy_flap"}}}]}}';

/** Winning solution for level 2: flap on click, end game on ground collision. */
export const LEVEL_2_FLAPPY_BLOCKS =
  '{"blocks":{"languageVersion":0,"blocks":[{"type":"flappy_whenClick","x":20,"y":20,"next":{"block":{"type":"flappy_flap"}}},{"type":"flappy_whenCollideGround","x":230,"y":20,"deletable":false,"next":{"block":{"type":"flappy_endGame"}}}]}}';
