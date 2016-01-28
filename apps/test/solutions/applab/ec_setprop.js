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
      description: "setProperty on API created Image",
      editCode: true,
      xml:
        'image("my_image", "' + flappyImage + '");' +
        'setProperty("my_image", "width", 11);' +
        'setProperty("my_image", "height", 12);' +
        'setProperty("my_image", "x", 13);' +
        'setProperty("my_image", "y", 14);' +
        'setProperty("my_image", "picture", "' + facebookImage + '");' +
        'setProperty("my_image", "hidden", true);',
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
      description: "setProperty on design mode created Image",
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: none;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><img src="/blockly/media/1x1.gif" data-canonical-image-url="" id="my_image" style="height: 100px; width: 100px; position: absolute; left: 80px; top: 75px; margin: 0px;" /></div></div>',
      xml:
        'setProperty("my_image", "width", 11);' +
        'setProperty("my_image", "height", 12);' +
        'setProperty("my_image", "x", 13);' +
        'setProperty("my_image", "y", 14);' +
        'setProperty("my_image", "picture", "' + facebookImage + '");' +
        'setProperty("my_image", "hidden", true);',
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
      description: "setProperty on API created dropdown",
      editCode: true,
      xml:
        'dropdown("my_drop", "option1", "option2");' +
        'setProperty("my_drop", "options", ["one", "two", "three"]);',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var dropdown = $("#my_drop");

          assert.equal(dropdown.children().length, 3);
          assert.equal(dropdown.children().eq(0).text(), 'one');
          assert.equal(dropdown.children().eq(1).text(), 'two');
          assert.equal(dropdown.children().eq(2).text(), 'three');

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
      description: "setProperty on design mode created dropdown",
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><select id="my_drop" style="width: 200px; height: 30px; font-size: 14px; margin: 0px; color: rgb(255, 255, 255); position: absolute; left: 35px; top: 75px; background-color: rgb(26, 188, 156);"><option>Option 1</option><option>Option 2</option></select></div></div>',
      xml:
        'setProperty("my_drop", "options", ["one", "two", "three"]);',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var dropdown = $("#my_drop");

          assert.equal(dropdown.children().length, 3);
          assert.equal(dropdown.children().eq(0).text(), 'one');
          assert.equal(dropdown.children().eq(1).text(), 'two');
          assert.equal(dropdown.children().eq(2).text(), 'three');

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
        'setProperty("my_image", "cant_set_this", 11);',
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
        'setProperty("my_image", "hidden", "true");',
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
