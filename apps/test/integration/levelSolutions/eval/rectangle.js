import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: blockUtils.mathBlockXml('functional_rectangle', {
      'WIDTH': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } ),
      'HEIGHT': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 100 } ),
      'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'outline' })
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
      description: "correct answer",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function (assert) {
        var user = document.getElementById('user');
        var rect = user.querySelector('rect');
        var fill = rect.getAttribute('fill');
        var stroke = rect.getAttribute('stroke');
        assert(fill === 'none', 'fill: ' + fill);
        assert(stroke === 'red', 'stroke: ' + stroke);
        assert(rect.getAttribute('transform', ' translate(200, 200)'));
        assert(rect.getAttribute('width', 50));
        assert(rect.getAttribute('height', 100));
        return true;
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_rectangle', {
          'WIDTH': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } ),
          'HEIGHT': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 100 } ),
          'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
          'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'outline' })
        }) +
      '</xml>'
    },
    {
      description: "bad style",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_rectangle', {
          'WIDTH': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } ),
          'HEIGHT': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 100 } ),
          'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
          'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'badstyle' })
        }) +
      '</xml>'
    },
    {
      description: "bad color",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_rectangle', {
          'WIDTH': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } ),
          'HEIGHT': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 100 } ),
          'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'badcolor' } ),
          'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'outline' })
        }) +
      '</xml>'
    }
  ]
};
