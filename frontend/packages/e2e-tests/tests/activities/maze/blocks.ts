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

/**
 * Puzzle 1 solution: two chained "move forward" blocks. Block ids are
 * load-bearing literals — the maze_signed_out port re-finds 'startBlock' and
 * 'moveForward' directly to assert their parent-child DOM relationship.
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
              block: {type: 'maze_moveForward', id: 'moveForward'},
            },
          },
        },
      },
    ],
  },
};
