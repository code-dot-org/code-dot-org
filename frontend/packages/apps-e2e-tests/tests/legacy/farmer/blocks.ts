/**
 * Blockly workspace JSON fixtures for the Farmer lab.
 * Source: dashboard/test/ui/features/step_definitions/blockly_initialization_blocks.rb
 */

/** Winning solution for level 1: move forward, turn left, move forward, fill until no holes. */
export const WINNING_FARMER_BLOCKS =
  '{"blocks":{"languageVersion":0,"blocks":[{"type":"when_run","id":"topBlock","x":16,"y":16,"deletable":false,"movable":false,"extraState":{},"next":{"block":{"type":"maze_moveForward","id":"{]tdKa=Q_//(4?vywqiJ","next":{"block":{"type":"maze_turn","id":"S~toDj^DIe!*F5ysj+p5","fields":{"DIR":"<field name=\\"DIR\\">turnLeft</field>"},"next":{"block":{"type":"maze_moveForward","id":"77)f;+g+7uVC4#6q?41g","next":{"block":{"type":"maze_untilBlockedOrNotClear","id":"z5NK`MFxtwupxl/uf6w/","fields":{"DIR":"<field name=\\"DIR\\">holePresent</field>"},"inputs":{"DO":{"block":{"type":"maze_fill","id":"voUV%?~q7myl6)O4#gB8"}}}}}}}}}}}}]}}';

/** Losing solution for level 1: three sequential move-forward blocks — misses the hole. */
export const LOSING_FARMER_BLOCKS =
  '{"blocks":{"languageVersion":0,"blocks":[{"type":"when_run","x":16,"y":16,"next":{"block":{"type":"maze_moveForward","id":"startBlock","next":{"block":{"type":"maze_moveForward","next":{"block":{"type":"maze_moveForward"}}}}}}}]}}';
