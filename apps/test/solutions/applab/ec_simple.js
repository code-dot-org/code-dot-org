var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "Expected solution.",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // room to add tests here

        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Applab.onPuzzleComplete();
        }, 1);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "getText and setText on text labels.",
      editCode: true,
      xml:
          "textLabel('idTxt1', '');" +
          "textLabel('idTxt2', '');" +
          "setText('idTxt1', 'test-value');" +
          "setText('idTxt2', getText('idTxt1'));",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          assert(document.getElementById('idTxt2').innerText === 'test-value');
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "button",
      editCode: true,
      xml: "button('my_button_id', 'my_button_text');",
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          var button = document.getElementById('my_button_id');
          assert(button);
          assert.equal(button.textContent, 'my_button_text');
          assert.equal(button.parentNode.id, 'screen1');

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    // These exercise all of the blocks in UI controls (other than get/setText).
    // It does not validate that they behave correctly, just that we don't end
    // up with an errors
    {
      description: "UI controls",
      editCode: true,
      xml:
          'button("id1", "text");\n' +
          // These two are currently having issues that appear to be specific
          // to the test rig. I validated them manually in the browser
          // 'getXPosition("id1");\n' +
          // 'getYPosition("id1");\n' +
          'onEvent("id1", "click", function(event) {\n' +
          '  \n' +
          '});\n' +
          'textInput("id2", "text");\n' +
          'textLabel("id3", "text");\n' +
          'dropdown("id4", "option1", "etc");\n' +
          'checkbox("id5", false);\n' +
          'getChecked("id5")\n' +
          'setChecked("id5", true);\n' +
          'radioButton("id6", false, "group");\n' +
          'image("id7", "https://code.org/images/logo.png");\n' +
          'setImageURL("id7", "https://code.org/images/logo.png");\n' +
          'getImageURL("id7");\n' +
          'playSound("https://studio.code.org/blockly/media/skins/studio/1_goal.mp3");\n' +
          'setPosition("id7", 0, 0, 100, 100);\n' +
          'showElement("id7");\n' +
          'hideElement("id7");\n' +
          'deleteElement("id7");\n' +
          'write("text")\n;',

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
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
      },
    },

    // These exercise all of the blocks in canvas category
    // It does not validate that they behave correctly, just that we don't end
    // up with an errors
    {
      description: "Canvas",
      editCode: true,
      xml:
        'createCanvas("id", 320, 480);\n' +
        'setActiveCanvas("id");\n' +
        'line(0, 0, 160, 240);\n' +
        'circle(160, 240, 100);\n' +
        'rect(80, 120, 160, 240);\n' +
        'setStrokeWidth(3);\n' +
        'setStrokeColor("red");\n' +
        'setFillColor("yellow");\n' +
        'drawImage("id", 0, 0);\n' +
        'var imgData = getImageData(0, 0, 320, 480);\n' +
        'putImageData(imgData, 0, 0);\n' +
        'clearCanvas();\n' +
        'getRed(imgData, 0, 0);\n' +
        'getGreen(imgData, 0, 0);\n' +
        'getBlue(imgData, 0, 0);\n' +
        'getAlpha(imgData, 0, 0);\n' +
        'setRed(imgData, 0, 0, 255);\n' +
        'setGreen(imgData, 0, 0, 255);\n' +
        'setBlue(imgData, 0, 0, 255);\n' +
        'setAlpha(imgData, 0, 0, 255);\n' +
        'setRGB(imgData, 0, 0, 255, 255, 255);\n',

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "");
        return true;
      }
    },

    // These exercise all of the blocks in Turtle category
    // It does not validate that they behave correctly, just that we don't end
    // up with an errors
    {
      description: "Turtle",
      editCode: true,
      xml:
        'moveForward(25);\n' +
        'moveBackward(25);\n' +
        'move(25, 25);\n' +
        'moveTo(0, 0);\n' +
        'dot(5);\n' +
        'turnRight(90);\n' +
        'turnLeft(90);\n' +
        'turnTo(0);\n' +
        'arcRight(90, 25);\n' +
        'arcLeft(90, 25);\n' +
        'getX();\n' +
        'getY();\n' +
        'getDirection();\n' +
        'penUp();\n' +
        'penDown();\n' +
        'penWidth(3);\n' +
        'penColor("red");\n' +
        'penRGB(120, 180, 200);\n' +
        'show();\n' +
        'hide();\n' +
        'speed(50);\n',

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
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
    }
  ]
};
