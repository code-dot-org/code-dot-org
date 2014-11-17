var TestResults = require('../../../src/constants.js').TestResults;
var blockUtils = require('../../../src/block_utils');

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: blockUtils.mathBlockXml('functional_string', null, { VAL: '1234' } ),
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
    {
      description: "correct answer with string",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_string', null, { VAL: '1234' } ) +
      '</xml>'
    },
    {
      description: "correct answer with number",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_math_number', null, { NUM: 1234 } ) +
      '</xml>'
    },
    {
      description: "wrong answer, using text instead of string",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_text', {
          'TEXT': blockUtils.mathBlockXml('functional_string', null, { VAL: '1234'} ),
          'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 10 }),
          'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'black' } )
        }) +
      '</xml>'
    }
  ]
};
