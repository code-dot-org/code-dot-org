import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');

module.exports = {
  app: 'eval',
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: blockUtils.mathBlockXml('functional_string', null, {
      VAL: '123'
    }),
    requiredBlocks: '',
    freePlay: false
  },
  tests: [
    {
      description: 'Nothing',
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      xml: '<xml>' + '</xml>'
    },
    {
      description: 'correct answer with string',
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml:
        '<xml>' +
        blockUtils.mathBlockXml('functional_string', null, {VAL: '123'}) +
        '</xml>'
    },
    {
      description: 'correct answer with number',
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml:
        '<xml>' +
        blockUtils.mathBlockXml('functional_math_number', null, {NUM: 123}) +
        '</xml>'
    },
    {
      description: 'wrong answer, using text instead of string',
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      xml:
        '<xml>' +
        blockUtils.mathBlockXml('functional_text', {
          TEXT: blockUtils.mathBlockXml('functional_string', null, {
            VAL: '123'
          }),
          SIZE: blockUtils.mathBlockXml('functional_math_number', null, {
            NUM: 10
          }),
          COLOR: blockUtils.mathBlockXml('functional_string', null, {
            VAL: 'black'
          })
        }) +
        '</xml>'
    }
  ]
};
