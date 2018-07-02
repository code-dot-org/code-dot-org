import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "2_2",
  tests: [
    {
      description: "Top Solve: MoveForward, Fill5",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_moveForward"><next><block type="procedures_callnoreturn"><mutation name="fill 5"></mutation></block></next></block></next></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">fill 5</title><statement name="STACK"><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">5</title><statement name="DO"><block type="maze_fill" deletable="false" editable="false"></block></statement></block></statement></block></xml>'
    }
  ]
};
