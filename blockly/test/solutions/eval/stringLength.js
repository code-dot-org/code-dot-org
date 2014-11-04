var TestResults = require('../../../src/constants.js').TestResults;
var blockUtils = require('../../../src/block_utils');

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: blockUtils.mathBlockXml('functional_string', null, {
      'VAL': '5'
    }),
    requiredBlocks: '',
    freePlay: false
  },
  tests: [
    {
      description: "Nothing",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      xml: '<xml>' +
      '</xml>'
    },
    // todo - requires draw to either take any type, or that we have a number -> string block
    // {
    //   description: "correct answer using string length",
    //   expected: {
    //     result: true,
    //     testResult: TestResults.ALL_PASS
    //   },
    //   xml: '<xml>' +
    //     blockUtils.mathBlockXml('string_length', {
    //       'STR': blockUtils.mathBlockXml('functional_string', null, { 'VAL': 'coder' }),
    //     }) +
    //   '</xml>'
    // }
  ]
};
