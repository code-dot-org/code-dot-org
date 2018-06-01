import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');

var solutionXml = blockUtils.mathBlockXml('scale', {
  'IMAGE': blockUtils.mathBlockXml('functional_square', {
    'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } ),
    'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
    'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'solid' })
  }),
  'FACTOR': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 2 } )
});

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: solutionXml,
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
        assert(fill === 'red', 'fill: ' + fill);
        assert(stroke === 'none', 'stroke: ' + stroke);
        assert(rect.getAttribute('transform') === ' translate(200 200) scale(2 2)',
          'actual: ' + rect.getAttribute('transform'));
        assert(rect.getAttribute('width', 50));
        assert(rect.getAttribute('height', 50));
        return true;
      },
      xml: '<xml>' + solutionXml + '</xml>'
    },
    {
      description: "correct answer: smaller size, bigger scale",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('scale', {
          'IMAGE': blockUtils.mathBlockXml('functional_square', {
            'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 25 } ),
            'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
            'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'solid' })
          }),
          'FACTOR': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 4 } )
        }) +
      '</xml>'
    },
    {
      description: "correct answer: bigger size, no scale",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' + blockUtils.mathBlockXml('functional_square', {
        'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 100 } ),
        'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
        'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'solid' })
      }) +
      '</xml>'
    }
  ]
};
