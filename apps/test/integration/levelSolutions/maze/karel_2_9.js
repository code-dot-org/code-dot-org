import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "2_9",
  tests: [
    {
      description: "Top Solve: Repeat 6x { Remove stack of 4 piles, Forward }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS,
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">6</title><statement name="DO"><block type="procedures_callnoreturn"><mutation name="remove stack of 4 piles"></mutation><next><block type="maze_moveForward"></block></next></block></statement></block></next></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">remove stack of 4 piles</title><statement name="STACK"><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">4</title><statement name="DO"><block type="maze_dig" deletable="false" editable="false"><next><block type="maze_moveForward" deletable="false" editable="false"></block></next></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">4</title><statement name="DO"><block type="maze_moveForward" deletable="false" editable="false"></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>'
    }
  ]
};
