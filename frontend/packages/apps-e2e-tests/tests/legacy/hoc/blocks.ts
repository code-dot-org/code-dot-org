/**
 * Blockly workspace JSON fixtures for Hour of Code (hoc/N) levels.
 * Extracted from blockly_initialization_blocks.rb.
 */

/**
 * Two maze_moveForward blocks chained after when_run.
 * Solves hoc/1 (the bird reaches the pig in two steps).
 * Source: "I've initialized the workspace with two move forward blocks"
 */
export const TWO_MOVE_FORWARD_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        id: 'topBlock',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'maze_moveForward',
            id: 'startBlock',
            next: {
              block: {
                type: 'maze_moveForward',
                id: 'moveForward',
              },
            },
          },
        },
      },
    ],
  },
};
