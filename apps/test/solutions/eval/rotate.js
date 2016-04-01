var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');

var solutionXml = blockUtils.mathBlockXml('rotate', {
  'IMAGE': blockUtils.mathBlockXml('functional_rectangle', {
    'WIDTH': blockUtils.mathBlockXml('functional_math_number', null, {NUM: 50} ),
    'HEIGHT': blockUtils.mathBlockXml('functional_math_number', null, {NUM: 100} ),
    'COLOR': blockUtils.mathBlockXml('functional_string', null, {VAL: 'red'} ),
    'STYLE': blockUtils.mathBlockXml('functional_string', null, {VAL: 'outline'})
  }),
  'DEGREES': blockUtils.mathBlockXml('functional_math_number', null, {NUM: 45} )
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
        assert(fill === 'none', 'fill: ' + fill);
        assert(stroke === 'red', 'stroke: ' + stroke);
        assert(rect.getAttribute('transform') === ' translate(200 200) rotate(45)',
          'actual: ' + rect.getAttribute('transform'));
        assert(rect.getAttribute('width', 50));
        assert(rect.getAttribute('height', 100));
        return true;
      },
      xml: '<xml>' + solutionXml + '</xml>'
    },
    {
      description: "correct answer, rotated an extra 360 degrees",
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
        assert(rect.getAttribute('transform') === ' translate(200 200) rotate(405)',
          'actual: ' + rect.getAttribute('transform'));
        assert(rect.getAttribute('width', 50));
        assert(rect.getAttribute('height', 100));
        return true;
      },
      xml: '<xml>' + solutionXml.replace('45', '405') + '</xml>'
    }
  ]
};
