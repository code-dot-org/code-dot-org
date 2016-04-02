var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: blockUtils.mathBlockXml('functional_string', null, {
      'VAL': 'onetwo'
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
      description: "correct answer using append",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('string_append', {
          'FIRST': blockUtils.mathBlockXml('functional_string', null, {'VAL': 'one'}),
          'SECOND': blockUtils.mathBlockXml('functional_string', null, {'VAL': 'two'}),
        }) +
      '</xml>'
    }
  ]
};
