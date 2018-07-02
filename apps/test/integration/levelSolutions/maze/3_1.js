import {TestResults} from '@cdo/apps/constants';

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "3_1",
  tests: [
    {
      description: "Verify solution",
      editCode: true,
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: 'moveForward();moveForward();moveForward();'
    },
    {
      description: "Single move forward block",
      editCode: true,
      expected: {
        result: false,
        testResult: TestResults.TOO_FEW_BLOCKS_FAIL
      },
      xml: 'moveForward();'
    }
  ]
};
