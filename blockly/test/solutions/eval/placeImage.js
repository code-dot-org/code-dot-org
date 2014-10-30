var TestResults = require('../../../src/constants.js').TestResults;
var blockUtils = require('../../../src/block_utils');

var solutionXml = blockUtils.mathBlockXml('place_image', {
  'IMAGE': blockUtils.mathBlockXml('functional_circle', {
    'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
    'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'outline' }),
    'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } )
  }),
  'X': 0,
  'Y': 0
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
        // 0 in cartesian space maps to 400 in pixel space
        assert(circle.getAttribute('transform', ' translate(0, 400)'));
        return true;
      },
      xml: '<xml>' + solutionXml + '</xml>'
    }
  ]
};
