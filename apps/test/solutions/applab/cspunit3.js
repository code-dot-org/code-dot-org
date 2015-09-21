var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');

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
  "showTurtleBeforeRun": false,
  "autocompletePaletteApisOnly": true,
  "textModeAtStart": false,
  "designModeAtStart": false,
  "hideDesignMode": true,
  "beginnerMode": false,
  "markdownInstructions": "<img src=\"https://images.code.org/ad48e7224312a6c41f4fc5727af53cc0-image-1436287265071.png\" align=right> **Warm up 2:** Draw a 1 x 1 square to the front and right of the turtle as efficiently as possible.  The program should stop with turtle in its original position, facing its original direction.\r\n\r\nWhen you're done click the Finish button to move onto the next problem.\r\n\r\n",
  "puzzle_number": 3,
  "stage_total": 7,
  "noPadding": null,
  "lastAttempt": "moveForward();\n",
  "levelHtml": "<div xmlns=\"http://www.w3.org/1999/xhtml\" id=\"divApplab\" class=\"appModern\" tabindex=\"1\" style=\"width: 200px; height: 200px;\"><div class=\"screen\" tabindex=\"1\" id=\"screen1\" style=\"display: block; height: 200px; width: 200px; left: 0px; top: 0px; position: absolute; z-index: 0;\"></div></div>",
  "id": "custom"
};

function dragApplabBlock() {
  var start = { x: 532, y: 165 };
  var end = { x: 850, y: 150 };

  var mousedown = new MouseEvent('mousedown', {
    which: 1,
    clientX: start.x,
    clientY: start.y
  });

  var drag = new MouseEvent('mousemove', {
    which: 0,
    bubbles: true,
    cancelable: false,
    clientX: end.x,
    clientY: end.y
  });

  var mouseup = new MouseEvent('mousedown', {
    which: 1,
    bubbles: true,
    cancelable: true,
    clientX: end.x,
    clientY: end.y
  });

  $(".droplet-drag-cover")[0].dispatchEvent(mousedown);
  $(".droplet-drag-cover")[0].dispatchEvent(drag);
  // $(".droplet-drag-cover")[0].dispatchEvent(mouseup);
}

function foo () {
  function mouseEvent(type, sx, sy, cx, cy) {
    var evt;
    var e = {
      bubbles: true,
      cancelable: (type != "mousemove"),
      view: window,
      detail: 0,
      screenX: sx,
      screenY: sy,
      clientX: cx,
      clientY: cy,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      button: 0,
      relatedTarget: undefined
    };
    if (typeof( document.createEvent ) == "function") {
      evt = document.createEvent("MouseEvents");
      evt.initMouseEvent(type,
        e.bubbles, e.cancelable, e.view, e.detail,
        e.screenX, e.screenY, e.clientX, e.clientY,
        e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
        e.button, document.body.parentNode);
    } else if (document.createEventObject) {
      evt = document.createEventObject();
      for (prop in e) {
      evt[prop] = e[prop];
    }
      evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
    }
    return evt;
  }
  function dispatchEvent (el, evt) {
    if (el.dispatchEvent) {
      el.dispatchEvent(evt);
    } else if (el.fireEvent) {
      el.fireEvent('on' + type, evt);
    }
    return evt;
  }

  var evt = mouseEvent("mousemove", 540, 176, 540, 176);
  dispatchEvent($(".droplet-drag-cover")[0], evt);
}

module.exports = {
  app: "applab",
  skinId: "applab",
  levelDefinition: levelDefinition,
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
    }
  ]
};
