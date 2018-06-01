var tickWrapper = require('../../util/tickWrapper');
import {TestResults} from '@cdo/apps/constants';
var Direction = require('@cdo/apps/studio/constants.js').Direction;

module.exports = {
  app: "studio",
  skinId: "studio",
  levelFile: "levels",
  levelId: "ec_sandbox", // This is the studio freeplay level for course 2
  tests: [
    {
      description: "Expected solution.",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // room to add tests here

        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 100);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "Fireball",
      editCode: true,
      xml:
        "setSprite(2, 'witch');" +
        "throwProjectile(0, 8, 'red_fireball');" +
        "throwProjectile(0, 2, 'blue_fireball');" +
        "throwProjectile(0, 1, 'purple_fireball');",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 1000);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "Fireball collision",
      // actor 1 throws a fireball to the right. it hits actor 2 and actor 2
      // vanishes
      editCode: true,
      timeout: 12000,
      xml:
        "setSprite(0, 'witch');" +
        "setSprite(1, 'witch');" +
        "throwProjectile(0, 2, 'blue_fireball');" +
        "onEvent('whenSpriteCollided-1-any_projectile', function() { vanish(1); });",
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 5, function () {
          assert(Studio.projectiles.length === 1);
          assert(Studio.projectiles[0].dir === Direction.EAST);
          var proj = document.getElementById('studioanimation_clippath_20').nextSibling;
          assert(proj.getAttribute('xlink:href').indexOf('/media/skins/studio/blue_fireball.png') > -1,
            "We have the right image: " + proj.getAttribute('xlink:href'));
          assert(proj.getAttribute('visibility') !== 'hidden',
            "The image isn't hidden");
          assert(Studio.sprite[0].visible, "First sprite is visible");
          assert(Studio.sprite[1].visible, "Second sprite is visible");
        });
        // our fireball should collide at tick 24, and vanish at tick 25, so by
        // tick 26 we should be finished
        tickWrapper.runOnAppTick(Studio, 26, function () {
          assert(Studio.sprite[1].visible === false, "Second sprite has vanished");
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    }
  ]
};
