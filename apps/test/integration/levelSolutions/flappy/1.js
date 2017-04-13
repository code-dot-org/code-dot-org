var studioApp = require('@cdo/apps/StudioApp').singleton;

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
        assert(studioApp().enableShowCode === false);
        assert(studioApp().enableShowBlockCount === false);

        // manually complete rather than wait for timeout
        setTimeout(function () {
          Flappy.onPuzzleComplete();
        }, 100);
      },
      xml: '<xml><block type="flappy_whenClick" deletable="false"></block></xml>'
    }
  ]
};
