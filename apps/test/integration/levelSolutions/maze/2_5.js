import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_5",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml><block type="when_run"><next><block type="controls_repeat" x="39" y="50"><title name="TIMES">5</title><statement name="DO"><block type="maze_moveForward" /></statement></block></next></block></xml>'
    }
  ]
};
