var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');

/**
 * This is based off of the currently version of U3L2_TurtleSquare_right.level,
 * which lives at /s/cspunit3/stage/2/puzzle/3
 */
var levelDefinition = {
  "freePlay": true,
  "editCode": true,
  "sliderSpeed": 0.1,
  "appWidth": 200,
  "appHeight": 200,
  "codeFunctions": {
    "moveForward": {
      "params": [""],
      "paletteParams": [""]
    },
    "turnLeft": {
      "params": [""],
      "paletteParams": [""]
    },
    "penUp": null,
    "penDown": null
  },
  "skin": "applab",
  "embed": false,
  "isK1": false,
  "skipInstructionsPopup": false,
  "disableParamEditing": true,
  "disableVariableEditing": false,
  "useModalFunctionEditor": false,
  "useContractEditor": false,
  "contractHighlight": false,
  "contractCollapse": false,
  "examplesHighlight": false,
  "examplesCollapse": false,
  "definitionHighlight": false,
  "definitionCollapse": false,
  "disableExamples": false,
  "instructions": "Draw a square ABOVE and to the RIGHT of the starting location. (Click to show full instructions)",
  "calloutJson": "[]",
  "aniGifURL": "/script_assets/k_1_images/instruction_gifs/csp/U3L02-rightSquare.png",
  "showTurtleBeforeRun": true,
  "autocompletePaletteApisOnly": true,
  "executePaletteApisOnly": true,
  "textModeAtStart": false,
  "designModeAtStart": false,
  "hideDesignMode": true,
  "beginnerMode": false,
  "markdownInstructions": "<img src=\"https://images.code.org/ad48e7224312a6c41f4fc5727af53cc0-image-1436287265071.png\" align=right> **Warm up 2:** Draw a 1 x 1 square to the front and right of the turtle as efficiently as possible.  The program should stop with turtle in its original position, facing its original direction.\r\n\r\nWhen you're done click the Finish button to move onto the next problem.\r\n\r\n",
  "puzzle_number": 3,
  "stage_total": 7,
  "noPadding": null,
  "lastAttempt": "",
  "levelHtml": "<div xmlns=\"http://www.w3.org/1999/xhtml\" id=\"divApplab\" class=\"appModern\" tabindex=\"1\" style=\"width: 200px; height: 200px;\"><div class=\"screen\" tabindex=\"1\" id=\"screen1\" style=\"display: block; height: 200px; width: 200px; left: 0px; top: 0px; position: absolute; z-index: 0;\"></div></div>",
  "id": "custom",
};



/**
 * Simulates dragging the nth block in the toolbox into the canvas at line
 * targetIndex (assumes all blocks are size 30).
 * @param {number} blockIndex Nth block in toolbox
 * @param {number} targetIndex Nth line in target
 */
function dragToolboxBlock(blockIndex, targetIndex) {
  var start = {
    x: $(".droplet-palette-canvas").eq(0).offset().left + 10,
    y: $(".droplet-palette-canvas").eq(0).offset().top + 10 +
      blockIndex * 30
  };
  var end = {
    x: $(".droplet-main-canvas").eq(0).offset().left,
    y: $(".droplet-main-canvas").eq(0).offset().top +
      targetIndex * 30
  };

  var mousedown = testUtils.createMouseEvent('mousedown', start.x, start.y);
  var drag = testUtils.createMouseEvent('mousemove', end.x, end.y);
  var mouseup = testUtils.createMouseEvent('mouseup', end.x, end.y);

  $(".droplet-drag-cover")[0].dispatchEvent(mousedown);
  $(".droplet-drag-cover")[0].dispatchEvent(drag);
  $(".droplet-drag-cover")[0].dispatchEvent(mouseup);
}

// Extract a list of those pixels that are actually filled
function getColoredPixels(imageData, width, height) {
  var list = [];
  for (var y = 0; y < 400; y++) {
    for (var x = 0; x < 400; x++) {
      // we only care about the alpha bit
      var index = (y * 400 + x) * 4 + 3;
      if (imageData.data[index] !== 0) {
        list.push([x, y]);
      }
    }
  }
  return list;
}

module.exports = {
  app: "applab",
  skinId: "applab",
  tests: [
    {
      description: "Expected solution.",
      editCode: true,
      xml: '',
      delayLoadLevelDefinition: function () {
        return levelDefinition;
      },
      runBeforeClick: function (assert) {
        // Paramaterless moveForward. Moves 25 pixels by default
        var moveForward = 0;
        var turnLeft = 1;

        var nextIndex = 0;
        function appendToolboxBlock(blockIndex) {
          dragToolboxBlock(blockIndex, nextIndex++);
        }

        appendToolboxBlock(moveForward);
        assert.equal(Applab.getCode(), 'moveForward();\n');
        appendToolboxBlock(turnLeft);
        appendToolboxBlock(turnLeft);
        appendToolboxBlock(turnLeft);
        appendToolboxBlock(moveForward);
        appendToolboxBlock(turnLeft);
        appendToolboxBlock(turnLeft);
        appendToolboxBlock(turnLeft);
        appendToolboxBlock(moveForward);
        appendToolboxBlock(turnLeft);
        appendToolboxBlock(turnLeft);
        appendToolboxBlock(turnLeft);
        appendToolboxBlock(moveForward);

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 10, function () {
          var imageData = document.getElementById('turtleCanvas')
            .getContext('2d').getImageData(0, 0, 400, 400);

          var pixels = getColoredPixels(imageData, 400, 400);

          // Diagram of which pixels we expect to be colored.
          //
          //   x->   1           1 1
          //  y    9 0           2 2
          //  |    9 0           4 5
          //  v
          //     0 0 0 0 0   0 0 0 0 0
          //  74 0 1 1 1 1...1 1 1 1 0
          //  75 0 1 1 1 1...1 1 1 1 0
          //  76 0 1 1 0 0   0 0 1 1 0
          //     0 1 1 0 0   0 0 1 1 0
          //       ...           ...
          //     0 1 1 0 0   0 0 1 1 0
          //  98 0 1 1 0 0   0 0 1 1 0
          //  99 0 1 1 1 1...1 1 1 1 0
          // 100 0 1 1 1 1...1 1 1 1 0
          //     0 0 0 0 0   0 0 0 0 0
          //
          var expectedPixels = [];
          var x, y;
          for (y = 74; y <= 75; y++) {
            for (x = 99; x <= 125; x++) {
              expectedPixels.push([x, y]);
            }
          }
          for (y = 76; y <= 98; y++) {
            expectedPixels.push([99, y]);
            expectedPixels.push([100, y]);
            expectedPixels.push([124, y]);
            expectedPixels.push([125, y]);
          }
          for (y = 99; y <= 100; y++) {
            for (x = 99; x <= 125; x++) {
              expectedPixels.push([x, y]);
            }
          }
          assert.deepEqual(pixels, expectedPixels);

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
    {
      description: "Turn right block doesn't work if executePaletteApisOnly is true",
      editCode: true,
      xml: 'turnRight()',
      delayLoadLevelDefinition: function () {
        return levelDefinition;
      },
      runBeforeClick: function () {
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        var errorText = 'Unknown identifier: turnRight';

        var debugOutput = document.getElementById('debug-output');
        assert(debugOutput.textContent.indexOf(errorText) !== -1);
        return true;
      },
      expected: {
        result: false,
        testResult: TestResults.RUNTIME_ERROR_FAIL
      }
    },
    {
      description: "Turn right block does work if executePaletteApisOnly is false",
      editCode: true,
      xml: 'turnRight()',
      delayLoadLevelDefinition: function () {
        // override executePaletteApisOnly
        return $.extend({}, levelDefinition, {
          executePaletteApisOnly: false
        });
      },
      runBeforeClick: function () {
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
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
      description: "Stop execution after error",
      editCode: true,
      xml: '' +
        'button("id", "start");\n' +
        'thisisanerror\n' +
        // shouldn't set end text because of error
        'setText("id", "end");\n',
      delayLoadLevelDefinition: function () {
        // override executePaletteApisOnly
        return $.extend({}, levelDefinition, {
          executePaletteApisOnly: false
        });
      },
      runBeforeClick: function () {
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        var button = document.getElementById('id');
        assert.equal(button.textContent, 'start');
        return true;
      },
      expected: {
        result: false,
        testResult: TestResults.RUNTIME_ERROR_FAIL
      }
    }
  ]
};
