import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "ec_1_2",
  tests: [
    {
      description: "Top solve: Red, Forward, Right, Forward, Right, Forward, Right, Forward",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      editCode: true,
      xml: "penColour('#ff0000');moveForward(100);turnRight(90);moveForward(100);turnRight(90);moveForward(100);turnRight(90);moveForward(100);"
    }
  ]
};
