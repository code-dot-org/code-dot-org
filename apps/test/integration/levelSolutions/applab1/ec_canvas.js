var tickWrapper = require('../../util/tickWrapper');
import {TestResults} from '@cdo/apps/constants';

// take advantage of the fact that we expose the filesystem via
var imageUrl = '/base/static/flappy_promo.png';

module.exports = {
  app: 'applab',
  skinId: 'applab',
  levelFile: 'levels',
  levelId: 'ec_simple',
  tests: [
    // These exercise all of the blocks in canvas category
    // It does not validate that they behave correctly, just that we don't end
    // up with an errors
    {
      description: 'Canvas',
      editCode: true,
      xml:
        'createCanvas("id", 320, 480);\n' +
        'setActiveCanvas("id");\n' +
        'line(0, 0, 160, 240);\n' +
        'circle(160, 240, 100);\n' +
        'rect(80, 120, 160, 240);\n' +
        'setStrokeWidth(3);\n' +
        'setStrokeColor("red");\n' +
        'setFillColor(rgb(255,0,0));\n' +
        'drawImageURL("' +
        imageUrl +
        '");\n' +
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

      runBeforeClick: function(assert) {
        // add a completion on timeout since this is a freeplay level
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
      description: 'drawImageURL with callback',
      editCode: true,
      xml:
        'createCanvas("canvas", 320, 450);\n' +
        'textLabel("result1", "");\n' +
        'textLabel("result2", "");\n' +
        'drawImageURL("' +
        imageUrl +
        '", function (success) {\n' +
        '  setText("result1", success);\n' +
        '});\n' +
        'drawImageURL("nonexistent.jpg", function (success) {\n' +
        '  setText("result2", success);\n' +
        '});\n',
      runBeforeClick: function(assert) {
        tickWrapper
          .tickAppUntil(Applab, canvasAndResultsPopulated)
          .then(function() {
            assert.equal(
              document.getElementById('result1').textContent,
              'true'
            );
            assert.equal(
              document.getElementById('result2').textContent,
              'false'
            );
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
      description: 'drawImageURL with extra args and callback',
      editCode: true,
      xml:
        'createCanvas("canvas", 320, 450);\n' +
        'textLabel("result1", "");\n' +
        'textLabel("result2", "");\n' +
        'drawImageURL("' +
        imageUrl +
        '", 5, 10, 15, 20, function (success) {\n' +
        '  setText("result1", success);\n' +
        '});\n' +
        'drawImageURL("nonexistent.jpg", 5, 10, 15, 20, function (success) {\n' +
        '  setText("result2", success);\n' +
        '});\n',
      runBeforeClick: function(assert) {
        tickWrapper
          .tickAppUntil(Applab, canvasAndResultsPopulated)
          .then(function() {
            assert.equal(
              document.getElementById('result1').textContent,
              'true'
            );
            assert.equal(
              document.getElementById('result2').textContent,
              'false'
            );
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

function canvasAndResultsPopulated() {
  var canvas = document.getElementById('canvas');
  var result1 = document.getElementById('result1');
  var result2 = document.getElementById('result2');
  var result1Populated = result1 && result1.textContent.length > 0;
  var result2Populated = result2 && result2.textContent.length > 0;
  return canvas && result1Populated && result2Populated;
}
