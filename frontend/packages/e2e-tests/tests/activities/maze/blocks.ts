/**
 * Blockly workspace JSON fixtures for the Maze lab.
 * Source: dashboard/test/ui/features/step_definitions/blockly_initialization_blocks.rb
 */

/** K1 Maze solution: move west, then move west again. */
export const K1_MAZE_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'maze_moveWest',
            next: {block: {type: 'maze_moveWest'}},
          },
        },
      },
    ],
  },
};
