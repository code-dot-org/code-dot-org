var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('@cdo/apps/lodash');

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

    // Missing coverage of the data category here.
    // Most data blocks make network calls and modify data records. To get
    // test coverage of these here, we would probably need to mock portions of that.
    // We do have UI test coverage of data apis in dataBlocks.feature

    // These exercise all of the blocks in Control category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    {
      description: "Control",
      editCode: true,
      xml:
        'var count = 0;' +
        'for (var i = 0; i < 4; i++) {' +
        '  count++;' +
        '}' +
        'i = 5;' +
        'while(i > 0) {' +
        '  count++;' +
        '  i--;' +
        '}' +
        'if (count > 0) {' +
        '  count++;' +
        '}' +
        'if (count < 0) {' +
        '  count++;' +
        '} else {' +
        '  count--;' +
        '}' +
        'getTime();' +
        'var interval = setInterval(function() {' +
        '  count++;' +
        '}, 100);' +
        'clearInterval(interval);' +
        'var timeout = setTimeout(function() {' +
        '  console.log(count);' +
        '  clearTimeout(timeout);' +
        '}, 200);',

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 200, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "9");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    // These exercise all of the blocks in Control category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    {
      description: "Variables",
      editCode: true,
      xml:
        // prompt and promptNum are covered in dropletUtilsTest
        'var x = 1;\n' +
        'var y;\n' +
        'y = 2;\n' +
        'console.log("message");\n' +
        'var str = "Hello World";\n' +
        'var a = str.substring(6, 11);\n' +
        'var b = str.indexOf("World");\n' +
        'var c = str.includes("World");\n' +
        'var d = str.length;\n' +
        'var e = str.toUpperCase();\n' +
        'var f = str.toLowerCase();\n' +
        'var list = ["a", "b", "d"];\n' +
        'var g = list.length;\n' +
        'insertItem(list, 2, "c");\n' +
        'appendItem(list, "f");\n' +
        'removeItem(list, 0);\n',

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, "message");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    // These exercise all of the blocks in canvas category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
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
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    // These exercise all of the blocks in Turtle category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
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
    },

    // These exercise all of the blocks in Turtle category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    {
      description: "Functions",
      editCode: true,
      xml:
        'function myFunction() {\n' +
        '  \n' +
        '}\n' +
        'function myFunction2(n) {\n' +
        '  return n;\n' +
        '}\n' +
        'myFunction();\n' +
        'myFunction2(1);\n',

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
