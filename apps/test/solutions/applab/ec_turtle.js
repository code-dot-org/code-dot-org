var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var levels = require('@cdo/apps/applab/levels');
var $ = require('jquery');

module.exports = {
  app: "applab",
  skinId: "applab",
  levelDefinition: $.extend({}, levels.ec_simple, {
    showTurtleBeforeRun: true
  }),
  tests: [
    {
      description: "showTurtleBeforeRun",
      editCode: true,
      xml:
        'moveForward(25);\n' +
        'turnRight(90);\n' +
        'moveForward(25);\n',
      runBeforeClick: function (assert) {
        // room to add tests here
        assert($('#screen1'));
        assert($('#turtleImage'));
        assert.equal($('.screen').length, 1);
        assert.equal($('#turtleImage').parent().attr('id'), 'screen1');
        assert.equal(Applab.turtle.heading, 0);
        assert.equal(Applab.turtle.x, 160);
        assert.equal(Applab.turtle.y, 240);

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          assert.equal($('.screen').length, 1);
          assert.equal($('#turtleImage').parent().attr('id'), 'screen1');
          assert.equal(Applab.turtle.heading, 90);
          assert.equal(Applab.turtle.x, 185);
          assert.equal(Applab.turtle.y, 215);

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
  ]
};
