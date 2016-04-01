var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');

var solutionXml = blockUtils.mathBlockXml('place_image', {
  'IMAGE': blockUtils.mathBlockXml('functional_circle', {
    'COLOR': blockUtils.mathBlockXml('functional_string', null, {VAL: 'red'} ),
    'STYLE': blockUtils.mathBlockXml('functional_string', null, {VAL: 'outline'}),
    'SIZE': blockUtils.mathBlockXml('functional_math_number', null, {NUM: 50} )
  }),
  'X': blockUtils.mathBlockXml('functional_math_number', null, {NUM: 25} ),
  'Y': blockUtils.mathBlockXml('functional_math_number', null, {NUM: 50} )
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
        // origin at center and mapping from cartesian to pixel space means
        // (25, 50) becomes (225, 150)
        assert(circle.getAttribute('transform'), ' translate(225, 150)')  ;
        return true;
      },
      xml: '<xml>' + solutionXml + '</xml>'
    }
  ]
};
