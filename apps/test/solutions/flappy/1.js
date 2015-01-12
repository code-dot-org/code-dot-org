var testUtils = require('../../util/testUtils');
var studioAppSingleton = require(testUtils.buildPath('base'));

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
        assert(studioAppSingleton.enableShowCode === false);
        assert(studioAppSingleton.enableShowBlockCount === false);
        
        // manually complete rather than wait for timeout
        setTimeout(function () {
          Flappy.onPuzzleComplete();
        }, 1);
      },
      xml: '<xml><block type="flappy_whenClick" deletable="false"></block></xml>'
    }
  ]
};
