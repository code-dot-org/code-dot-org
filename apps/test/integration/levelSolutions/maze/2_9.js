import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_9",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml><block type="when_run"><next><block type="maze_forever" x="27" y="47"><statement name="DO"><block type="maze_moveForward" /></statement></block></next></block></xml>'
    },
    {
      description: "Infinite loop",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      customValidator: function () {
        return Maze.result === 2;
      },
      xml: '<xml><block type="when_run"><next><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></next></block></statement></block></next></block></xml>'
    }
  ]
};
