var TestResults = require('../../../src/constants.js').TestResults;
var blockUtils = require('../../../src/block_utils');

var solutionXml = blockUtils.msmBlockXml('overlay', {
  'TOP': blockUtils.msmBlockXml('place_image', {
    'IMAGE': blockUtils.msmBlockXml('functional_circle', {
      'COLOR': blockUtils.msmBlockXml('functional_string', null, { VAL: 'red' } ),
      'STYLE': blockUtils.msmBlockXml('functional_string', null, { VAL: 'outline' }),
      'SIZE': blockUtils.msmBlockXml('functional_math_number', null, { NUM: 50 } )
    }),
    'X': 0,
    'Y': 0
  }),
  'BOTTOM': blockUtils.msmBlockXml('functional_circle', {
    'COLOR': blockUtils.msmBlockXml('functional_string', null, { VAL: 'blue' } ),
    'STYLE': blockUtils.msmBlockXml('functional_string', null, { VAL: 'outline' }),
    'SIZE': blockUtils.msmBlockXml('functional_math_number', null, { NUM: 50 } )
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
        var user = document.getElementById('user');
        var circles = user.querySelectorAll('circle');
        assert(circles.length === 2);
        assert(circles[0].getAttribute('stroke') === 'blue', "blue circle on the bottom");
        assert(circles[1].getAttribute('stroke') === 'red', "red circle on the bottom");
        return true;
      },
      xml: '<xml>' + solutionXml +  '</xml>'
    }
  ]
};
