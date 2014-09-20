
var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "studio",
  skinId: "studio",
  levelFile: "levels",
  levelId: "click_hello",
  tests: [
    {
      description: "Expected solution.",
      xml: '<xml><block type="when_run" deletable="false"></block><block type="studio_whenSpriteClicked" deletable="false"><next><block type="studio_saySprite"><title name="TEXT">hello</title></block></next></block></xml>',
      runBeforeClick: function (assert) {
        // Make sure we reordered our start avatars
        assert(Studio.startAvatars.length, 23);
        assert(Studio.startAvatars[0] === 'octopus');

        // simulate a click so that level gets completed
        setTimeout(function () {
          var e = {
            preventDefault: function () { }
          };
          Studio.onSpriteClicked(e, 0);
        }, 1);
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
    }
  ]
};
