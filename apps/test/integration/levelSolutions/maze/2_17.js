import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_17",
  tests: [
    {
      description: "Top solution: Until Sunflower { if PathAhead Moveward else TurnLeft }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_forever"><statement name="DO"><block type="maze_ifElse"><title name="DIR">isPathForward</title><statement name="DO"><block type="maze_moveForward"></block></statement><statement name="ELSE"><block type="maze_turn"><title name="DIR">turnLeft</title></block></statement></block></statement></block></next></block></xml>'
    }
  ]
};
