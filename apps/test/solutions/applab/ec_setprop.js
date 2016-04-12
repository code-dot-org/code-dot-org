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
      description: "setProperty on API created button",
      editCode: true,
      xml:
        'button("my_button", "text");' +
        'setProperty("my_button", "text", "newtext");' +
        'setProperty("my_button", "text-color", "red");' +
        'setProperty("my_button", "background-color", "green");' +
        'setProperty("my_button", "font-size", 21);' +
        'setProperty("my_button", "image", "' + facebookImage + '");',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var button = document.getElementById('my_button');

          assert.equal(button.textContent, 'newtext');
          assert.equal(button.style.color, 'red');
          assert.equal(button.style.backgroundColor, 'green');
          assert.equal(button.style.fontSize, '21px');

          assert(/facebook_purple.png$/.test(button.getAttribute('data-canonical-image-url')));

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
      description: "setProperty on design mode created button",
      editCode: true,
      levelHtml: '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: none;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><button id="my_button" style="padding: 0px; margin: 0px; height: 30px; width: 80px; font-size: 14px; color: rgb(255, 255, 255); position: absolute; left: 55px; top: 85px; background-color: rgb(26, 188, 156);">Button</button></div></div>',
      xml:
        'setProperty("my_button", "text", "newtext");' +
        'setProperty("my_button", "text-color", "red");' +
        'setProperty("my_button", "background-color", "green");' +
        'setProperty("my_button", "font-size", 21);' +
        'setProperty("my_button", "image", "' + facebookImage + '");',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var button = document.getElementById('my_button');

          assert.equal(button.textContent, 'newtext');
          assert.equal(button.style.color, 'red');
          assert.equal(button.style.backgroundColor, 'green');
          assert.equal(button.style.fontSize, '21px');

          assert(/facebook_purple.png$/.test(button.getAttribute('data-canonical-image-url')));

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
      description: "setProperty on API created text input",
      editCode: true,
      xml:
        'textInput("my_text_input", "text");' +
        'setProperty("my_text_input", "placeholder", "placeholdertext");',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var textInput = document.getElementById('my_text_input');

          assert.equal(textInput.getAttribute('placeholder'), 'placeholdertext');
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
      description: "setProperty on design mode slider ",
      editCode: true,
      levelHtml: '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: none;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><input type="range" value="50" min="0" max="100" step="1" id="my_slider" style="margin: 0px; padding: 0px; width: 150px; height: 24px; position: absolute; left: 75px; top: 95px;" /></div></div>',
      xml:
        'setProperty("my_slider", "value", 51);' +
        'setProperty("my_slider", "min", 1);' +
        'setProperty("my_slider", "max", 101);' +
        'setProperty("my_slider", "step", 3);',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var slider = document.getElementById('my_slider');

          assert.equal(slider.getAttribute('value'), '51');
          assert.equal(slider.getAttribute('min'), '1');
          assert.equal(slider.getAttribute('max'), '101');
          assert.equal(slider.getAttribute('step'), '3');
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
        'dropdown("my_drop", "option1", "option2", "option3", "option4", "option5");' +
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
      description: "setProperty on design mode created canvas",
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: none;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><canvas width="100px" height="100px" id="canvas1" style="position: absolute; left: 65px; top: 40px; margin: 0px;"></canvas></div></div>',
      xml:
        'setProperty("canvas1", "width", 12);' +
        'setProperty("canvas1", "height", 13);',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var canvas = $("#canvas1")[0];

          // we set the width/height attributes instead of style.width/height
          assert.equal(canvas.style.width, '');
          assert.equal(canvas.style.height, '');
          assert.equal(canvas.getAttribute('width'), '12px');
          assert.equal(canvas.getAttribute('height'), '13px');

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
      description: "setProperty on design mode created screen",
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern" style="display: none; width: 320px; height: 450px;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"></div></div>',
      xml:
        'setProperty("screen1", "image", "' + flappyImage + '");',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var screen = $("#screen1")[0];

          // we set the width/height attributes instead of style.width/height
          console.log(screen.style.backgroundImage);
          assert(/url\(.*flappy_promo.png\)$/.test(screen.style.backgroundImage));
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
      description: "setProperty on design mode created image",
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: block;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><img src="/blockly/media/1x1.gif" data-canonical-image-url="" id="image1" style="height: 100px; width: 100px; position: absolute; left: 125px; top: 235px; margin: 0px;" /></div></div>',
      xml:
        'setProperty("image1", "picture", "' + flappyImage + '");',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var image = $("#image1")[0];

          // we set the width/height attributes instead of style.width/height
          assert(/flappy_promo.png$/.test(image.getAttribute('data-canonical-image-url')));
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
      description: "setProperty on design mode created radio button",
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: block;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><input type="radio" id="radio_button1" style="width: 12px; height: 12px; margin: 0px; position: absolute; left: 85px; top: 75px;" /></div></div>',
      xml:
        'setProperty("radio_button1", "group-id", "gid1");' +
        'setProperty("radio_button1", "checked", true);',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var radio = $("#radio_button1")[0];

          assert.equal(radio.getAttribute('name'), "gid1");
          assert.equal(radio.getAttribute('checked'), "checked");
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
      description: "setProperty on design mode created text area",
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: block;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><div contenteditable="true" class="textArea" id="text_area1" style="width: 200px; height: 100px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 55px; top: 90px; margin: 0px; background-color: rgb(255, 255, 255);"></div></div></div>',
      xml:
        'setProperty("text_area1", "readonly", true);',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var text = $("#text_area1")[0];

          assert.equal(text.getAttribute('contenteditable'), "false");
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
    },

    {
      description: "setProperty autocomplete",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#show-code-header").click();
        assert.equal($(".ace_autocomplete").is(":visible"), false,
          'no autocomplete to start');

        testUtils.typeAceText('setProperty(');
        assert.equal($(".ace_autocomplete").is(":visible"), true,
          'we have autocomplete options after typing');
        assert.equal($(".ace_autocomplete .ace_content").text(), '"screen1"');

        testUtils.typeAceText('"screen1",');
        assert.equal($(".ace_autocomplete .ace_content").text(), '"background-color""image"',
          'autocompletes filtered list of properties');

      }

    }
  ]
};
