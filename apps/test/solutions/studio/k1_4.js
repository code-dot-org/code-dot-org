var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;

module.exports = {
  app: "studio",
  skinId: "studio",
  levelFile: "levels",
  levelId: "k1_4",
  tests: [
    {
      description: "Expected solution.",
      xml: '<xml><block type="when_run" deletable="false"><next><block type="studio_moveEastDistance"><title name="SPRITE">0</title></block></next></block><block type="studio_whenSpriteCollided" deletable="false"><title name="SPRITE1">0</title><title name="SPRITE2">1</title><next><block type="studio_saySprite"><title name="SPRITE">1</title><title name="TEXT">hello</title></block></next></block></xml>',
      customValidator: function () {
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
    },
    {
      description: "Dog says hello instead of cat",
      xml: '<xml><block type="when_run" deletable="false"><next><block type="studio_moveEastDistance"><title name="SPRITE">0</title></block></next></block><block type="studio_whenSpriteCollided" deletable="false"><title name="SPRITE1">0</title><title name="SPRITE2">1</title><next><block type="studio_saySprite"><title name="SPRITE">0</title><title name="TEXT">hello</title></block></next></block></xml>',
      customValidator: function () {
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.MISSING_BLOCK_FINISHED
      },
    },
    {
      description: "Cat doesn't change what they say.",
      xml: '<xml><block type="when_run" deletable="false"><next><block type="studio_moveEastDistance"><title name="SPRITE">0</title></block></next></block><block type="studio_whenSpriteCollided" deletable="false"><title name="SPRITE1">0</title><title name="SPRITE2">1</title><next><block type="studio_saySprite"><title name="SPRITE">1</title><title name="TEXT">type here</title></block></next></block></xml>',
      customValidator: function () {
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.MISSING_BLOCK_FINISHED
      }
    }
  ]
};
