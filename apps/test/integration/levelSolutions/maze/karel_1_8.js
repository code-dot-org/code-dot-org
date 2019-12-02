import {TestResults} from '@cdo/apps/constants';

module.exports = {
  app: 'maze',
  levelFile: 'karelLevels',
  levelId: '1_8',
  tests: [
    {
      description: 'Top Solve: Repeat 7x { MoveForward } Fill1',
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml:
        '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">7</title><statement name="DO"><block type="maze_moveForward"></block></statement><next><block type="maze_fill"></block></next></block></next></block></xml>'
    },
    {
      description: 'Infinite Loop: While Path Ahead { MoveForward, Left, Left}',
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      customValidator: function() {
        // Don't run all 10,000 steps...
        Maze.executionInfo.steps_.length = 0;
        return Maze.result === 2;
      },
      xml:
        '<xml><block type="when_run"><next><block type="maze_untilBlockedOrNotClear"><title name="DIR">isPathForward</title><statement name="DO"><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></next></block></statement></block></next></block></xml>'
    }
  ]
};
