import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');

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
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      xml: '<xml>' +
      '</xml>'
    },
    {
      description: "correct answer using string length",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('string_length', {
          'STR': blockUtils.mathBlockXml('functional_string', null, { 'VAL': 'coder' }),
        }) +
      '</xml>'
    }
  ]
};
