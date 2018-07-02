import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_7",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml><block type="when_run"><next><block type="controls_repeat" x="28" y="48"><title name="TIMES">4</title><statement name="DO"><block type="maze_moveForward" /></statement><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="controls_repeat"><title name="TIMES">5</title><statement name="DO"><block type="maze_moveForward" /></statement></block></next></block></next></block></next></block></xml>'
    }
  ]
};
