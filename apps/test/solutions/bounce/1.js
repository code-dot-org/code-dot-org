var testUtils = require('../../util/testUtils');
var studioAppSingleton = require(testUtils.buildPath('base'));

module.exports = {
  app: "bounce",
  levelFile: "levels",
  levelId: "1",
  tests: [
    // currently only testing missing blocks
    {
      description: "Expected solution",
      missingBlocks: [],
      xml: '<xml><block type="bounce_whenLeft" deletable="false"><next><block type="bounce_moveLeft"></block></next></block></xml>',
      // TODO (brent) - customValidator only gets used by levelTests. levelTests
      // only called if we have an expected defined. that means right now this
      // function never gets called
      customValidator: function () {
        return studioAppSingleton.enableShowCode === false && studioAppSingleton.enableShowBlockCount === false;
      }
    },
    {
      description: "missing moveLeft block",
      missingBlocks: [
        {'test': 'moveLeft', 'type': 'bounce_moveLeft'}
      ],
      xml: '<xml><block type="bounce_whenLeft" deletable="false"></block></xml>'
    }
  ]
};
