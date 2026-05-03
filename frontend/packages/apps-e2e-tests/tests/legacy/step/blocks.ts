/**
 * Two maze_moveForward blocks chained after when_run.
 * Used for step failure, stepping, and reset scenarios.
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
            next: {block: {type: 'maze_moveForward', id: 'moveForward'}},
          },
        },
      },
    ],
  },
};

/**
 * Three maze_moveForward blocks chained after when_run.
 * Provides enough moves to complete level 1 of the step course.
 */
export const COMPLETE_STEP_BLOCKS = {
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
                next: {block: {type: 'maze_moveForward'}},
              },
            },
          },
        },
      },
    ],
  },
};
