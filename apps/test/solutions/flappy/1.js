module.exports = {
  app: "flappy",
  skinId: "flappy",
  levelFile: "levels",
  levelId: "1",
  tests: [
    // currently only testing missing blocks
    {
      description: "Expected solution",
      missingBlocks: [],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap"></block></next></block></xml>',
    },
    {
      description: "missing flap block",
      expected: {
        result: false
      },
      missingBlocks: [
        {'test': 'flap', 'type': 'flappy_flap'}
      ],
      runBeforeClick: function (assert) {
        var studioApp = require('@cdo/apps/StudioApp').singleton;
        assert(studioApp.enableShowCode === false);
        assert(studioApp.enableShowBlockCount === false);

        // manually complete rather than wait for timeout
        setTimeout(function () {
          var Flappy = require('@cdo/apps/flappy/flappy');
          Flappy.onPuzzleComplete();
        }, 1);
      },
      xml: '<xml><block type="flappy_whenClick" deletable="false"></block></xml>'
    }
  ]
};
