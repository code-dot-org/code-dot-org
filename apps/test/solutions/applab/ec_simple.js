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
