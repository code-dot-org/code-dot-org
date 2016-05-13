var testUtils = require('../../../util/testUtils');
var studioApp = require('@cdo/apps/StudioApp').singleton;

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
        assert(studioApp.enableShowCode === false);
        assert(studioApp.enableShowBlockCount === false);

        // manually complete rather than wait for timeout
        setTimeout(function () {
          Bounce.onPuzzleComplete();
        }, 100);
      },
      xml: '<xml><block type="bounce_whenLeft" deletable="false"></block></xml>'
    }
  ]
};
