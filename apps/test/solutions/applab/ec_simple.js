var testUtils = require('../../util/testUtils');
var TestResults = require(testUtils.buildPath('constants.js')).TestResults;
var _ = require(testUtils.buildPath('lodash'));

/**
 * Runs the given function at the provided tick count
 */
function runOnTick(tick, fn) {
  Applab.onTick = _.wrap(Applab.onTick, function (applabOnTick) {
    if (Applab.tickCount === tick) {
      fn();
    }
    applabOnTick();
  });
}

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "Expected solution.",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // room to add tests here

        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Applab.onPuzzleComplete();
        }, 1);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    }
  ]
};
