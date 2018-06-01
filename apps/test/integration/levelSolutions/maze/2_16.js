import {TestResults} from '@cdo/apps/constants';


var reqBlocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('@cdo/apps/maze/requiredBlocks.js');
};

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_16",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"><next><block type="maze_if"><title name="DIR">isPathRight</title><statement name="DO"><block type="maze_turn"><title name="DIR">turnRight</title></block></statement></block></next></block></statement></block></next></block></xml>'
    },
    {
      description: "Empty workspace",
      missingBlocks: [reqBlocks().MOVE_FORWARD],
      xml: '<xml><block type="when_run"><next></next></block></xml>'
    },
    {
      description: "Move forward block",
      missingBlocks: [reqBlocks().TURN_RIGHT],
      xml: '<xml><block type="when_run"><next><block type="maze_moveForward"></block></next></block></xml>'
    },
    {
      description: "Move forward and turn right",
      missingBlocks: [reqBlocks().IS_PATH_RIGHT],
      xml: '<xml><block type="when_run"><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnRight</title></block></next></block></next></block></xml>'
    },
    {
      description: "Missing while loop",
      missingBlocks: [reqBlocks().WHILE_LOOP],
      xml: '<xml><block type="when_run"><next><block type="maze_moveForward"><next><block type="maze_if"><title name="DIR">isPathRight</title><statement name="DO"><block type="maze_turn"><title name="DIR">turnRight</title></block></statement></block></next></block></next></block></xml>'
    },
    {
      description: "Infinite Loop",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      customValidator: function () {
        return Maze.result === 2;
      },
      xml: '<xml><block type="when_run"><next><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></next></block></statement></block></next></block></xml>'
    },
  ]
};
