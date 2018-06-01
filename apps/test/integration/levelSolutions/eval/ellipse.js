import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: blockUtils.mathBlockXml('functional_ellipse', {
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
        var ellipse = user.querySelector('ellipse');
        var fill = ellipse.getAttribute('fill');
        var stroke = ellipse.getAttribute('stroke');
        assert(fill === 'none', 'fill: ' + fill);
        assert(stroke === 'red', 'stroke: ' + stroke);
        assert(ellipse.getAttribute('transform', ' translate(200, 200)'));
        assert(ellipse.getAttribute('rx', 25));
        assert(ellipse.getAttribute('ry', 50));
        return true;
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_ellipse', {
          'WIDTH': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } ),
          'HEIGHT': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 100 } ),
          'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
          'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'outline' })
        }) +
      '</xml>'
    }
  ]
};
