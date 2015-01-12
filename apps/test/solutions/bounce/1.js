var testUtils = require('../../util/testUtils');
var studioAppSingleton = require(testUtils.buildPath('base'));

module.exports = {
  app: "bounce",
  levelFile: "levels",
  levelId: "1",
  skinId: 'bounce',
  tests: [
    // currently only testing missing blocks
    {
      description: "Expected solution",
      missingBlocks: [],
      xml: '<xml><block type="bounce_whenLeft" deletable="false"><next><block type="bounce_moveLeft"></block></next></block></xml>'
    },
    {
      description: "missing moveLeft block",
      missingBlocks: [
        {'test': 'moveLeft', 'type': 'bounce_moveLeft'}
      ],
      expected: {
        result: false
      },
      runBeforeClick: function (assert) {
        assert(studioAppSingleton.enableShowCode === false);
        assert(studioAppSingleton.enableShowBlockCount === false);

        // manually complete rather than wait for timeout
        setTimeout(function () {
          Bounce.onPuzzleComplete();
        }, 1);
      },
      xml: '<xml><block type="bounce_whenLeft" deletable="false"></block></xml>'
    }
  ]
};
