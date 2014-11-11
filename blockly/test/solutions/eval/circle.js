var TestResults = require('../../../src/constants.js').TestResults;
var blockUtils = require('../../../src/block_utils');

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: blockUtils.mathBlockXml('functional_circle', {
      'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'outline' }),
      'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } )
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
    {
      description: "correct answer",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function (assert) {
        var user = document.getElementById('user');
        var circle = user.querySelector('circle');
        var fill = circle.getAttribute('fill');
        var stroke = circle.getAttribute('stroke');
        assert(fill === 'none', 'fill: ' + fill);
        assert(stroke === 'red', 'stroke: ' + stroke);
        assert(circle.getAttribute('cx') === '0');
        assert(circle.getAttribute('cy') === '0');
        assert(circle.getAttribute('transform', ' translate(200, 200)'));
        return true;
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_circle', {
          'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
          'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'outline' }),
          'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } )
        }) +
      '</xml>'
    },
    {
      description: "correct answer with style block",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_circle', {
          'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
          'STYLE': blockUtils.mathBlockXml('functional_style', null, { VAL: 'outline' }),
          'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } )
        }) +
      '</xml>'
    },
    {
      description: "correct answer but rotated 15 degrees",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('rotate', {
          'IMAGE': blockUtils.mathBlockXml('functional_circle', {
            'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
            'STYLE': blockUtils.mathBlockXml('functional_style', null, { VAL: 'outline' }),
            'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } )
          }),
          'DEGREES': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 15 } )
        }) +
      '</xml>'
    },
    {
      description: "wrong color",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_circle', {
          'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'blue' } ),
          'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'outline' }),
          'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } )
        }) +
      '</xml>'
    }
  ]
};
