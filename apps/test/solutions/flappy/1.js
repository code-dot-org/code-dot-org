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
      // TODO (brent) - customValidator only gets used by levelTests. levelTests
      // only called if we have an expected defined. that means right now this
      // function never gets called
      customValidator: function () {
        return studioAppSingleton.enableShowCode === false && studioAppSingleton.enableShowBlockCount === false;
      }
    },
    {
      description: "missing flap block",
      missingBlocks: [
        {'test': 'flap', 'type': 'flappy_flap'}
      ],
      xml: '<xml><block type="flappy_whenClick" deletable="false"></block></xml>'
    }
  ]
};
