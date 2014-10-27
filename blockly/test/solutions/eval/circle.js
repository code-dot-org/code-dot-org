var TestResults = require('../../../src/constants.js').TestResults;
var blockUtils = require('../../../src/block_utils');

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: '<block type="functional_circle" inline="false"><functional_input name="COLOR"><block type="functional_string"><title name="VAL">red</title></block></functional_input><functional_input name="SIZE"><block type="functional_math_number"><title name="NUM">50</title></block></functional_input></block>',
    requiredBlocks: '',
    freePlay: false
  },
  tests: [
    {
      description: "Nothing",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      xml: '<xml>' +
      '</xml>'
    }
  ]
};
