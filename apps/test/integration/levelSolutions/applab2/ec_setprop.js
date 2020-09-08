import $ from 'jquery';
var testUtils = require('../../../util/testUtils');
var tickWrapper = require('../../util/tickWrapper');
import {TestResults} from '@cdo/apps/constants';
import {expect} from '../../../util/deprecatedChai';

// take advantage of the fact that we expose the filesystem via
// localhost
const flappyImage = '/base/static/flappy_promo.png';
const facebookImage = '/base/static/facebook_purple.png';

module.exports = {
  app: 'applab',
  skinId: 'applab',
  levelFile: 'levels',
  levelId: 'ec_simple',
  tests: [
    {
      description: 'setProperty on API created button',
      editCode: true,
      xml: `button("my_button", "text");
        setProperty("my_button", "text", "newtext");
        console.log("text: " + getProperty("my_button", "text"));
        setProperty("my_button", "text-color", "red");
        console.log("text-color: " + getProperty("my_button", "text-color"));
        setProperty("my_button", "background-color", "green");
        console.log("background-color: " + getProperty("my_button", "background-color"));
        setProperty("my_button", "font-size", 21);
        console.log("font-size: " + getProperty("my_button", "font-size"));
        setProperty("my_button", "image", "${facebookImage}");
        console.log("image: " + getProperty("my_button", "image"));
        setProperty("my_button", "icon-color", "blue");
        console.log("icon-color: " + getProperty("my_button", "icon-color"));
`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var button = document.getElementById('my_button');

          assert.equal(button.textContent, 'newtext');
          assert.equal(button.style.color, 'red');
          assert.equal(button.style.backgroundColor, 'green');
          assert.equal(button.style.fontSize, '21px');

          assert(
            /facebook_purple.png$/.test(
              button.getAttribute('data-canonical-image-url')
            )
          );
          assert(/blue/.test(button.getAttribute('data-icon-color')));

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');

        expect(debugOutput.textContent).to.contain('"text: newtext"');
        expect(debugOutput.textContent).to.contain('"text-color: red"');
        expect(debugOutput.textContent).to.contain('"background-color: green"');
        expect(debugOutput.textContent).to.contain('"font-size: 21"');
        expect(debugOutput.textContent).to.match(
          /"image: .*facebook_purple.png"/
        );
        expect(debugOutput.textContent).to.contain('"icon-color: blue"');

        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on design mode created button',
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: none;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><button id="my_button" style="padding: 0px; margin: 0px; height: 30px; width: 80px; font-size: 14px; color: rgb(255, 255, 255); position: absolute; left: 55px; top: 85px; background-color: rgb(26, 188, 156);">Button</button></div></div>',
      xml: `setProperty("my_button", "text", "newtext");
        console.log("text: " + getProperty("my_button", "text"));
        setProperty("my_button", "text-color", "red");
        console.log("text-color: " + getProperty("my_button", "text-color"));
        setProperty("my_button", "background-color", "green");
        console.log("background-color: " + getProperty("my_button", "background-color"));
        setProperty("my_button", "font-size", 21);
        console.log("font-size: " + getProperty("my_button", "font-size"));
        setProperty("my_button", "image", "${facebookImage}");
        console.log("image: " + getProperty("my_button", "image"));
        setProperty("my_button", "icon-color", "blue");
        console.log("icon-color: " + getProperty("my_button", "icon-color"));
`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var button = document.getElementById('my_button');

          assert.equal(button.textContent, 'newtext');
          assert.equal(button.style.color, 'red');
          assert.equal(button.style.backgroundColor, 'green');
          assert.equal(button.style.fontSize, '21px');

          assert(
            /facebook_purple.png$/.test(
              button.getAttribute('data-canonical-image-url')
            )
          );
          assert(/blue/.test(button.getAttribute('data-icon-color')));

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');

        expect(debugOutput.textContent).to.contain('text: newtext');
        expect(debugOutput.textContent).to.contain('text-color: red');
        expect(debugOutput.textContent).to.contain('background-color: green');
        expect(debugOutput.textContent).to.contain('font-size: 21');
        expect(debugOutput.textContent).to.match(
          /"image: .*facebook_purple.png"/
        );
        expect(debugOutput.textContent).to.contain('icon-color: blue');

        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty with image names which require escaping',
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: none;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">' +
        '<button id="button1" style="padding: 0px; margin: 0px; height: 30px; width: 80px; font-size: 14px; color: rgb(255, 255, 255); position: absolute; left: 55px; top: 85px; background-color: rgb(26, 188, 156);">Button</button>' +
        '<img src="/blockly/media/1x1.gif" data-canonical-image-url="" data-object-fit="contain" id="image1" style="height: 100px; width: 100px; object-fit: contain; font-family: &quot;object-fit: contain;&quot;; position: static; left: 20px; top: 30px; margin: 0px;">' +
        '</div></div>',
      xml: `
        var unescapedImage = 'ñ#?( "\\'.jpg';
        
        setProperty("image1", "image", unescapedImage);
        console.log('image1 image: ' + getProperty("image1", "image"));
        
        setProperty("button1", "image", unescapedImage);
        console.log('button1 image: ' + getProperty("button1", "image"));
        
        setProperty("screen1", "image", unescapedImage);
        console.log('screen1 image: ' + getProperty("screen1", "image"));
`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          // the single quote is escaped additionally in CSS strings when
          // running tests on PhantomJS. Chrome and Firefox do not seem to do this.
          // We check for both, below, while we are supporting tests in both browsers.
          const cssEscapedImageSuffix = "/%C3%B1%23%3F(%20%22\\'.jpg";
          const escapedImageSuffix = "/%C3%B1%23%3F(%20%22'.jpg";

          const imageSrc = $('#image1').attr('src');
          assert(imageSrc.includes(escapedImageSuffix), 'image src');

          const buttonImage = $('#button1')[0].style.backgroundImage;
          assert(
            // Chrome or Firefox
            buttonImage.includes(escapedImageSuffix) ||
              // Phantom
              buttonImage.includes(cssEscapedImageSuffix),
            'button image'
          );

          const screenImage = $('#screen1')[0].style.backgroundImage;
          assert(
            // Chrome or Firefox
            screenImage.includes(escapedImageSuffix) ||
              //Phantom
              screenImage.includes(cssEscapedImageSuffix),
            'screen image'
          );

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        const debugOutput = document.getElementById('debug-output');
        expect(debugOutput.textContent).to.contain(`image1 image: ñ#?( "'.jpg`);
        expect(debugOutput.textContent).to.contain(
          `button1 image: ñ#?( "'.jpg`
        );
        expect(debugOutput.textContent).to.contain(
          `screen1 image: ñ#?( "'.jpg`
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on API created text input',
      editCode: true,
      xml: `textInput("my_text_input", "text");
        setProperty("my_text_input", "placeholder", "placeholdertext");
        console.log("placeholder: " + getProperty("my_text_input", "placeholder"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var textInput = document.getElementById('my_text_input');

          assert.equal(
            textInput.getAttribute('placeholder'),
            'placeholdertext'
          );
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '"placeholder: placeholdertext"');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on design mode slider ',
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: none;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><input type="range" value="50" min="0" max="100" step="1" id="my_slider" style="margin: 0px; padding: 0px; width: 150px; height: 24px; position: absolute; left: 75px; top: 95px;" /></div></div>',
      xml: `setProperty("my_slider", "value", 52);
        console.log("value: " + getProperty("my_slider", "value"));
        setProperty("my_slider", "min", 1);
        console.log("min: " + getProperty("my_slider", "min"));
        setProperty("my_slider", "max", 101);
        console.log("max: " + getProperty("my_slider", "max"));
        setProperty("my_slider", "step", 3);
        console.log("step: " + getProperty("my_slider", "step"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var slider = document.getElementById('my_slider');

          assert.equal(slider.value, '52');
          assert.equal(slider.getAttribute('min'), '1');
          assert.equal(slider.getAttribute('max'), '101');
          assert.equal(slider.getAttribute('step'), '3');
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"value: 52"' + '"min: 1"' + '"max: 101"' + '"step: 3"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on API created Image',
      editCode: true,
      xml: `image("my_image", "${flappyImage}");
        setProperty("my_image", "width", 11);
        console.log("width: " + getProperty("my_image", "width"));
        setProperty("my_image", "height", 12);
        console.log("height: " + getProperty("my_image", "height"));
        setProperty("my_image", "x", 13);
        console.log("x: " + getProperty("my_image", "x"));
        setProperty("my_image", "y", 14);
        console.log("y: " + getProperty("my_image", "y"));
        setProperty("my_image", "picture", "${facebookImage}");
        console.log("picture: " + getProperty("my_image", "picture"));
        setProperty("my_image", "hidden", true);
        console.log("hidden: " + getProperty("my_image", "hidden"));
        setProperty("my_image", "icon-color", "blue");
        console.log("icon-color: " + getProperty("my_image", "icon-color"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var image = document.getElementById('my_image');

          // we set style.width/height instead of the width/height attributes
          assert.equal(image.style.width, '11px');
          assert.equal(image.style.height, '12px');
          assert.equal(image.getAttribute('width'), null);
          assert.equal(image.getAttribute('height'), null);

          assert.equal(image.style.left, '13px');
          assert.equal(image.style.top, '14px');

          assert(/facebook_purple.png$/.test(image.src));
          assert(/blue/.test(image.getAttribute('data-icon-color')));

          // visibility is set via a class, so use getComputedStyle
          assert(window.getComputedStyle(image).visibility, 'hidden');

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');

        expect(debugOutput.textContent).to.contain('width: 11');
        expect(debugOutput.textContent).to.contain('height: 12');
        expect(debugOutput.textContent).to.contain('x: 13');
        expect(debugOutput.textContent).to.contain('y: 14');
        expect(debugOutput.textContent).to.match(
          /"picture: .*facebook_purple.png"/
        );
        expect(debugOutput.textContent).to.contain('hidden: true');
        expect(debugOutput.textContent).to.contain('icon-color: blue');

        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on design mode created Image 1',
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: none;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><img src="/blockly/media/1x1.gif" data-canonical-image-url="" id="my_image" style="height: 100px; width: 100px; position: absolute; left: 80px; top: 75px; margin: 0px;" /></div></div>',
      xml: `setProperty("my_image", "width", 11);
        console.log("width: " + getProperty("my_image", "width"));
        setProperty("my_image", "height", 12);
        console.log("height: " + getProperty("my_image", "height"));
        setProperty("my_image", "x", 13);
        console.log("x: " + getProperty("my_image", "x"));
        setProperty("my_image", "y", 14);
        console.log("y: " + getProperty("my_image", "y"));
        setProperty("my_image", "picture", "${facebookImage}");
        console.log("picture: " + getProperty("my_image", "picture"));
        setProperty("my_image", "hidden", true);
        console.log("hidden: " + getProperty("my_image", "hidden"));
        setProperty("my_image", "icon-color", "blue");
        console.log("icon-color: " + getProperty("my_image", "icon-color"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var image = document.getElementById('my_image');

          // we set style.width/height instead of the width/height attributes
          assert.equal(image.style.width, '11px');
          assert.equal(image.style.height, '12px');
          assert.equal(image.getAttribute('width'), null);
          assert.equal(image.getAttribute('height'), null);

          assert.equal(image.style.left, '13px');
          assert.equal(image.style.top, '14px');

          assert(/facebook_purple.png$/.test(image.src));
          assert(/blue/.test(image.getAttribute('data-icon-color')));

          // visibility is set via a class, so use getComputedStyle
          assert(window.getComputedStyle(image).visibility, 'hidden');

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');

        expect(debugOutput.textContent).to.contain('width: 11');
        expect(debugOutput.textContent).to.contain('height: 12');
        expect(debugOutput.textContent).to.contain('x: 13');
        expect(debugOutput.textContent).to.contain('y: 14');
        expect(debugOutput.textContent).to.match(
          /"picture: .*facebook_purple.png"/
        );
        expect(debugOutput.textContent).to.contain('hidden: true');
        expect(debugOutput.textContent).to.contain('icon-color: blue');

        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on API created dropdown',
      editCode: true,
      xml: `dropdown("my_drop", "option1", "option2", "option3", "option4", "option5");
        setProperty("my_drop", "options", ["one", "two", "three"]);
        console.log("options: " + getProperty("my_drop", "options"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var dropdown = $('#my_drop');

          assert.equal(dropdown.children().length, 3);
          assert.equal(
            dropdown
              .children()
              .eq(0)
              .text(),
            'one'
          );
          assert.equal(
            dropdown
              .children()
              .eq(1)
              .text(),
            'two'
          );
          assert.equal(
            dropdown
              .children()
              .eq(2)
              .text(),
            'three'
          );

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '"options: one,two,three"');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on design mode created dropdown',
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><select id="my_drop" style="width: 200px; height: 30px; font-size: 14px; margin: 0px; color: rgb(255, 255, 255); position: absolute; left: 35px; top: 75px; background-color: rgb(26, 188, 156);"><option>Option 1</option><option>Option 2</option></select></div></div>',
      xml: `setProperty("my_drop", "options", ["one", "two", "three"]);
        console.log("options: " + getProperty("my_drop", "options"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var dropdown = $('#my_drop');

          assert.equal(dropdown.children().length, 3);
          assert.equal(
            dropdown
              .children()
              .eq(0)
              .text(),
            'one'
          );
          assert.equal(
            dropdown
              .children()
              .eq(1)
              .text(),
            'two'
          );
          assert.equal(
            dropdown
              .children()
              .eq(2)
              .text(),
            'three'
          );

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '"options: one,two,three"');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on design mode created canvas',
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: none;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><canvas width="100px" height="100px" id="canvas1" style="position: absolute; left: 65px; top: 40px; margin: 0px;"></canvas></div></div>',
      xml: `setProperty("canvas1", "width", 12);
        console.log("width: " + getProperty("canvas1", "width"));
        setProperty("canvas1", "height", 13);
        console.log("height: " + getProperty("canvas1", "height"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var canvas = $('#canvas1')[0];

          // we set the width/height attributes instead of style.width/height
          assert.equal(canvas.style.width, '');
          assert.equal(canvas.style.height, '');
          assert.equal(canvas.getAttribute('width'), '12px');
          assert.equal(canvas.getAttribute('height'), '13px');

          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '"width: 12"' + '"height: 13"');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on design mode created screen',
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern" style="display: none; width: 320px; height: 450px;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"></div></div>',
      xml: `setProperty("screen1", "image", "${flappyImage}");
        console.log("image: " + getProperty("screen1", "image"));
        setProperty("screen1", "icon-color", "blue");
        console.log("icon-color: " + getProperty("screen1", "icon-color"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var screen = $('#screen1')[0];

          // we set the width/height attributes instead of style.width/height
          console.log(screen.style.backgroundImage);
          assert(
            /url\(.*flappy_promo.png['"]?\)$/.test(
              screen.style.backgroundImage
            ),
            'screen background image should be flappy_promo.png. Instead: ' +
              screen.style.backgroundImage
          );
          assert(/blue/.test(screen.getAttribute('data-icon-color')));
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');
        expect(debugOutput.textContent).to.match(/"image: .*flappy_promo.png"/);
        expect(debugOutput.textContent).to.contain('icon-color: blue');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on design mode created image 2',
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: block;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><img src="/blockly/media/1x1.gif" data-canonical-image-url="" id="image1" style="height: 100px; width: 100px; position: absolute; left: 125px; top: 235px; margin: 0px;" /></div></div>',
      xml: `setProperty("image1", "picture", "${flappyImage}");
        console.log("picture: " + getProperty("image1", "picture"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var image = $('#image1')[0];

          // we set the width/height attributes instead of style.width/height
          assert(
            /flappy_promo.png$/.test(
              image.getAttribute('data-canonical-image-url')
            )
          );
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');
        expect(debugOutput.textContent).to.match(
          /"picture: .*flappy_promo.png"/
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on design mode created radio button',
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: block;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><input type="radio" id="radio_button1" style="width: 12px; height: 12px; margin: 0px; position: absolute; left: 85px; top: 75px;" /></div></div>',
      xml: `setProperty("radio_button1", "group-id", "gid1");
        console.log("group-id: " + getProperty("radio_button1", "group-id"));
        setProperty("radio_button1", "checked", true);
        console.log("checked: " + getProperty("radio_button1", "checked"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var radio = $('#radio_button1')[0];

          assert.equal(radio.getAttribute('name'), 'gid1');
          assert.equal(radio.getAttribute('checked'), 'checked');
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"group-id: gid1"' + '"checked: true"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty on design mode created text area',
      editCode: true,
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" class="appModern withCrosshair" style="width: 320px; height: 450px; display: block;"><div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;"><div contenteditable="true" class="textArea" id="text_area1" style="width: 200px; height: 100px; font-size: 14px; color: rgb(0, 0, 0); position: absolute; left: 55px; top: 90px; margin: 0px; background-color: rgb(255, 255, 255);"></div></div></div>',
      xml: `console.log("readonly: " + JSON.stringify(getProperty("text_area1", "readonly")));
        setProperty("text_area1", "readonly", false);
        console.log("readonly: " + JSON.stringify(getProperty("text_area1", "readonly")));
        setProperty("text_area1", "readonly", true);
        console.log("readonly: " + JSON.stringify(getProperty("text_area1", "readonly")));
        setProperty("text_area1", "text-align", "right");
        console.log("text-align: " + getProperty("text_area1", "text-align"));`,
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          var text = $('#text_area1')[0];

          assert.equal(text.getAttribute('contenteditable'), 'false');
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"readonly: false"' +
            '"readonly: false"' +
            '"readonly: true"' +
            '"text-align: right"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty invalid prop',
      editCode: true,
      xml:
        'image("my_image", "' +
        flappyImage +
        '");' +
        'setProperty("my_image", "cant_set_this", 11);',
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          'ERROR: Line: 1: There is no property named "cant_set_this" for element "my_image". Make sure you choose a property from the dropdown.'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty invalid value',
      editCode: true,
      xml:
        'image("my_image", "' +
        flappyImage +
        '");' +
        'setProperty("my_image", "hidden", "true");',
      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 2, function() {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          'WARNING: Line: 1: setProperty() value parameter value (true) is not a boolean.'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'setProperty autocomplete',
      editCode: true,
      xml: '',
      runBeforeClick: function(assert) {
        $('#show-code-header').click();
        assert.equal(
          $('.ace_autocomplete').is(':visible'),
          false,
          'no autocomplete to start'
        );

        testUtils.typeAceText('setProp');
        assert.equal(
          $('.ace_autocomplete').is(':visible'),
          true,
          'setProperty shows up in autocomplete'
        );
        expect($('.ace_autocomplete').text()).to.match(/setProperty/);

        // For some reason, testUtils.typeAceText triggers the autocomplete menu
        // when typing a partial command name (e.g. above), but does now show arguments
        // when typing the opening paren after typing a valid command name as it does
        // when running the app in a real browser. If this is resolved, the following
        // commented-out test code should be enabled, here and in getProperty autocomplete.

        // testUtils.typeAceText('erty(');
        // assert.equal($(".ace_autocomplete").is(":visible"), true,
        //   'we have autocomplete options after typing');
        // assert.equal($(".ace_autocomplete .ace_content").text(), '"screen1"');

        // testUtils.typeAceText('"screen1",');
        // assert.equal($(".ace_autocomplete").is(":visible"), true,
        //   'we have autocomplete options after typing');
        // assert.equal($(".ace_autocomplete .ace_content").text(), '"background-color""image"',
        //   'autocompletes filtered list of properties');

        // clear contents before run
        testUtils.setAceText('');

        tickWrapper.runOnAppTick(Applab, 2, function() {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'getProperty autocomplete',
      editCode: true,
      xml: '',
      runBeforeClick: function(assert) {
        $('#show-code-header').click();
        assert.equal(
          $('.ace_autocomplete').is(':visible'),
          false,
          'no autocomplete to start'
        );

        testUtils.typeAceText('getProp');
        assert.equal(
          $('.ace_autocomplete').is(':visible'),
          true,
          'getProperty shows up in autocomplete'
        );
        expect($('.ace_autocomplete').text()).to.match(/getProperty/);

        // clear contents before run
        testUtils.setAceText('');

        tickWrapper.runOnAppTick(Applab, 2, function() {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
