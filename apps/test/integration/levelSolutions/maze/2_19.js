import {TestResults} from '@cdo/apps/constants';

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_19",
  tests: [
    {
      description: "Top solution: Add blocks MoveForward, TurnRight, TurnLeft",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_forever" deletable="false" editable="false"><statement name="DO"><block type="maze_ifElse" deletable="false" editable="false"><title name="DIR">isPathForward</title><statement name="DO"><block type="maze_moveForward"></block></statement><statement name="ELSE"><block type="maze_ifElse" deletable="false" editable="false"><title name="DIR">isPathRight</title><statement name="DO"><block type="maze_turn"><title name="DIR">turnRight</title></block></statement><statement name="ELSE"><block type="maze_turn"><title name="DIR">turnLeft</title></block></statement></block></statement></block></statement></block></next></block></xml>'
    }
  ]
};
