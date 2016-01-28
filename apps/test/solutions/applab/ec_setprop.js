var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');

// take advantage of the fact that we expose the filesystem via
// localhost:8001
var flappyImage = '//localhost:8001/apps/static/flappy_promo.png';
var facebookImage = '//localhost:8001/apps/static/facebook_purple.png';

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "setProperty on Image",
      editCode: true,
      xml:
        'image("my_image", "' + flappyImage + '");' +
        'setProperty("my_image", "width", 11);' +
        'setProperty("my_image", "height", 12);' +
        'setProperty("my_image", "x", 13);' +
        'setProperty("my_image", "y", 14);' +
        'setProperty("my_image", "picture", "' + facebookImage + '");' +
        'setProperty("my_image", "hidden", true);'
      ,
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var image = document.getElementById('my_image');

          // we set style.width/height instead of the width/height attributes
          assert.equal(image.style.width, '11px');
          assert.equal(image.style.height, '12px');
          assert.equal(image.getAttribute('width'), null);
          assert.equal(image.getAttribute('height'), null);

          assert.equal(image.style.left, '13px');
          assert.equal(image.style.top, '14px');

          assert(/facebook_purple.png$/.test(image.src));

          // visibility is set via a class, so use getComputedStyle
          assert(window.getComputedStyle(image).visibility, 'hidden');

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "setProperty invalid prop",
      editCode: true,
      xml:
        'image("my_image", "' + flappyImage + '");' +
        'setProperty("my_image", "cant_set_this", 11);'
      ,
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var image = document.getElementById('my_image');

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent,
          'ERROR: Line: 1: Cannot set property "cant_set_this" on element "my_image".');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: "setProperty invalid value",
      editCode: true,
      xml:
        'image("my_image", "' + flappyImage + '");' +
        'setProperty("my_image", "hidden", "true");'
      ,
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var image = document.getElementById('my_image');

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent,
          'WARNING: Line: 1: setProperty() value parameter value (true) is not a boolean.');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
