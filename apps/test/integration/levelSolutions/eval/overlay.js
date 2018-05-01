import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');

var solutionXml = blockUtils.mathBlockXml('overlay', {
  'TOP': blockUtils.mathBlockXml('place_image', {
    'IMAGE': blockUtils.mathBlockXml('functional_circle', {
      'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'red' } ),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'outline' }),
      'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } )
    }),
    'X': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 5 } ),
    'Y': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 10 } )
  }),
  'BOTTOM': blockUtils.mathBlockXml('functional_circle', {
    'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'blue' } ),
    'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'outline' }),
    'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 50 } )
  })
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
        assert(solutionXml);

        var user = document.getElementById('user');
        var g = user.querySelector('g');
        var circles = user.querySelectorAll('circle');
        assert(circles.length === 2);
        assert(circles[0].getAttribute('stroke') === 'blue', "blue circle on the bottom");
        assert(circles[1].getAttribute('stroke') === 'red', "red circle on the bottom");
        assert(circles[0].getAttribute('transform') === ' translate(0 0)');
        assert(circles[1].getAttribute('transform') === ' translate(5 -10)',
          'actual: ' + circles[1].getAttribute('transform'));
        assert(g.getAttribute('transform') === ' translate(200 200)');
        return true;
      },
      xml: '<xml>' + solutionXml +  '</xml>'
    }
  ]
};
