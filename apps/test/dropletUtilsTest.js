var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;
var sinon = require('sinon');

var testUtils = require('./util/testUtils');
testUtils.setupLocales('applab');
testUtils.setExternalGlobals();

var dropletUtils = require('@cdo/apps/dropletUtils');

var applabDropletConfig = require('@cdo/apps/applab/dropletConfig');
var mazeDropletConfig = require('@cdo/apps/maze/dropletConfig');

describe('promptNum', function () {
  afterEach(function () {
    if (window.prompt.restore) {
      window.prompt.restore();
    }
  });

  it('returns a number if I enter a number', function () {
    var prompt = sinon.stub(window, 'prompt');
    prompt.returns('123');

    var val = dropletUtils.promptNum('Enter a value');
    assert.strictEqual(prompt.callCount, 1);
    assert.strictEqual(val, 123);
  });

  it('reprompts if I enter a non-numerical value', function () {
    var prompt = sinon.stub(window, 'prompt');
    prompt.onCall(0).returns('onetwothree');
    prompt.onCall(1).returns('123');

    var val = dropletUtils.promptNum('Enter a value');
    assert.strictEqual(prompt.callCount, 2);
    assert.strictEqual(val, 123);
  });
});

describe('generateDropletModeOptions', function () {
  it('generates the expected object for applab', function () {
    var expected = {
      "functions": {
        "getTime": {
          "value": true,
          "color": "#64B5F6",
          "title": "getTime"
        },
        "randomNumber": {
          "value": true,
          "color": "#FFB74D",
          "title": "randomNumber"
        },
        "prompt": {
          "value": true,
          "color": "#BB77C7",
          "title": "prompt"
        },
        "promptNum": {
          "value": true,
          "color": "#BB77C7",
          "title": "promptNum"
        },
        "Math.random": {
          "color": "#FFB74D",
          "title": "Math.random",
          "value": true
        },
        "Math.round": {
          "value": true,
          "color": "#FFB74D",
          "title": "Math.round"
        },
        "Math.abs": {
          "value": true,
          "color": "#FFB74D",
          "title": "Math.abs"
        },
        "Math.max": {
          "value": true,
          "color": "#FFB74D",
          "title": "Math.max"
        },
        "Math.min": {
          "value": true,
          "color": "#FFB74D",
          "title": "Math.min"
        },
        "onEvent": {
          "color": "#FFF176",
          "dropdown": {
            "1": ["\"click\"", "\"change\"", "\"keyup\"", "\"keydown\"", "\"keypress\"", "\"mousemove\"", "\"mousedown\"", "\"mouseup\"", "\"mouseover\"", "\"mouseout\"", "\"input\""]
          },
          "title": "onEvent"
        },
        "button": {
          "color": "#FFF176",
          "title": "button"
        },
        "textInput": {
          "color": "#FFF176",
          "title": "textInput"
        },
        "textLabel": {
          "color": "#FFF176",
          "title": "textLabel"
        },
        "dropdown": {
          "color": "#FFF176",
          "title": "dropdown"
        },
        "getText": {
          "value": true,
          "color": "#FFF176",
          "dropdown": {},
          "title": "getText"
        },
        "setText": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "setText"
        },
        "getNumber": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "getNumber",
          "value": true
        },
        "setNumber": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "setNumber"
        },
        "checkbox": {
          "color": "#FFF176",
          "dropdown": {
            "1": ["true", "false"]
          },
          "title": "checkbox"
        },
        "radioButton": {
          "color": "#FFF176",
          "dropdown": {
            "1": ["true", "false"]
          },
          "title": "radioButton"
        },
        "getChecked": {
          "value": true,
          "color": "#FFF176",
          "title": "getChecked"
        },
        "setChecked": {
          "color": "#FFF176",
          "dropdown": {
            "1": ["true", "false"]
          },
          "title": "setChecked"
        },
        "image": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "image"
        },
        "getImageURL": {
          "value": true,
          "color": "#FFF176",
          "dropdown": {},
          "title": "getImageURL"
        },
        "setImageURL": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "setImageURL"
        },
        "playSound": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "playSound"
        },
        "showElement": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "showElement"
        },
        "hideElement": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "hideElement"
        },
        "deleteElement": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "deleteElement"
        },
        "setPosition": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "setPosition"
        },
        "setSize": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "setSize"
        },
        "setProperty": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "setProperty"
        },
        "write": {
          "color": "#FFF176",
          "title": "write"
        },
        "getXPosition": {
          "value": true,
          "color": "#FFF176",
          "dropdown": {},
          "title": "getXPosition"
        },
        "getYPosition": {
          "value": true,
          "color": "#FFF176",
          "dropdown": {},
          "title": "getYPosition"
        },
        "setScreen": {
          "color": "#FFF176",
          "dropdown": {},
          "title": "setScreen"
        },
        "createCanvas": {
          "color": "#F78183",
          "title": "createCanvas"
        },
        "setActiveCanvas": {
          "color": "#F78183",
          "dropdown": {},
          "title": "setActiveCanvas"
        },
        "line": {
          "color": "#F78183",
          "title": "line"
        },
        "circle": {
          "color": "#F78183",
          "title": "circle"
        },
        "rect": {
          "color": "#F78183",
          "title": "rect"
        },
        "setStrokeWidth": {
          "color": "#F78183",
          "title": "setStrokeWidth"
        },
        "setStrokeColor": {
          "color": "#F78183",
          "dropdown": {
            "0": ["\"red\"", "\"rgb(255,0,0)\"", "\"rgba(255,0,0,0.5)\"", "\"#FF0000\""]
          },
          "title": "setStrokeColor"
        },
        "setFillColor": {
          "color": "#F78183",
          "dropdown": {
            "0": ["\"yellow\"", "\"rgb(255,255,0)\"", "\"rgba(255,255,0,0.5)\"", "\"#FFFF00\""]
          },
          "title": "setFillColor"
        },
        // This block was deprecated, and now gets the color of our advance category
        "drawImage": {
          "color": "#F78183",
          "dropdown": {},
          "title": "drawImage"
        },
        "drawImageURL": {
          "color": "#F78183",
          "title": "drawImageURL"
        },
        "getImageData": {
          "value": true,
          "color": "#F78183",
          "title": "getImageData"
        },
        "putImageData": {
          "color": "#F78183",
          "title": "putImageData"
        },
        "clearCanvas": {
          "color": "#F78183",
          "title": "clearCanvas"
        },
        "getRed": {
          "value": true,
          "color": "#F78183",
          "title": "getRed"
        },
        "getGreen": {
          "value": true,
          "color": "#F78183",
          "title": "getGreen"
        },
        "getBlue": {
          "value": true,
          "color": "#F78183",
          "title": "getBlue"
        },
        "getAlpha": {
          "value": true,
          "color": "#F78183",
          "title": "getAlpha"
        },
        "setRed": {
          "color": "#F78183",
          "title": "setRed"
        },
        "setGreen": {
          "color": "#F78183",
          "title": "setGreen"
        },
        "setBlue": {
          "color": "#F78183",
          "title": "setBlue"
        },
        "setAlpha": {
          "color": "#F78183",
          "title": "setAlpha"
        },
        "setRGB": {
          "color": "#F78183",
          "title": "setRGB"
        },
        "startWebRequest": {
          "color": "#D3E965",
          "title": "startWebRequest"
        },
        "setKeyValue": {
          "color": "#D3E965",
          "title": "setKeyValue"
        },
        "setKeyValueSync": {
          "color": "#D3E965",
          "title": "setKeyValueSync"
        },
        "getKeyValue": {
          "color": "#D3E965",
          "title": "getKeyValue"
        },
        "getKeyValueSync": {
          "color": "#D3E965",
          "title": "getKeyValueSync",
          "value": true
        },
        "createRecord": {
          "color": "#D3E965",
          "title": "createRecord"
        },
        "readRecords": {
          "color": "#D3E965",
          "title": "readRecords"
        },
        "updateRecord": {
          "color": "#D3E965",
          "title": "updateRecord"
        },
        "deleteRecord": {
          "color": "#D3E965",
          "title": "deleteRecord"
        },
        "onRecordEvent": {
          "color": "#D3E965",
          "title": "onRecordEvent"
        },
        "getUserId": {
          "value": true,
          "color": "#D3E965",
          "title": "getUserId"
        },
        "drawChart": {
          "color": "#D3E965",
          "dropdown": {},
          "title": "drawChart"
        },
        "drawChartFromRecords": {
          "color": "#D3E965",
          "dropdown": {},
          "title": "drawChartFromRecords"
        },
        "moveForward": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["25", "50", "100", "200"]
          },
          "title": "moveForward"
        },
        "moveBackward": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["25", "50", "100", "200"]
          },
          "title": "moveBackward"
        },
        "move": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["25", "50", "100", "200"],
            "1": ["25", "50", "100", "200"]
          },
          "title": "move"
        },
        "moveTo": {
          "color": "#4DD0E1",
          "title": "moveTo"
        },
        "dot": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["1", "5", "10"]
          },
          "title": "dot"
        },
        "turnRight": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["30", "45", "60", "90"]
          },
          "title": "turnRight"
        },
        "turnLeft": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["30", "45", "60", "90"]
          },
          "title": "turnLeft"
        },
        "turnTo": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["0", "90", "180", "270"]
          },
          "title": "turnTo"
        },
        "arcRight": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["30", "45", "60", "90"],
            "1": ["25", "50", "100", "200"]
          },
          "title": "arcRight"
        },
        "arcLeft": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["30", "45", "60", "90"],
            "1": ["25", "50", "100", "200"]
          },
          "title": "arcLeft"
        },
        "getX": {
          "value": true,
          "color": "#4DD0E1",
          "title": "getX"
        },
        "getY": {
          "value": true,
          "color": "#4DD0E1",
          "title": "getY"
        },
        "getDirection": {
          "value": true,
          "color": "#4DD0E1",
          "title": "getDirection"
        },
        "penUp": {
          "color": "#4DD0E1",
          "title": "penUp"
        },
        "penDown": {
          "color": "#4DD0E1",
          "title": "penDown"
        },
        "penWidth": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["1", "3", "5"]
          },
          "title": "penWidth"
        },
        "penColor": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["\"red\"", "\"rgb(255,0,0)\"", "\"rgba(255,0,0,0.5)\"", "\"#FF0000\""]
          },
          "title": "penColor"
        },
        "penRGB": {
          "color": "#4DD0E1",
          "title": "penRGB"
        },
        "show": {
          "color": "#4DD0E1",
          "title": "show"
        },
        "hide": {
          "color": "#4DD0E1",
          "title": "hide"
        },
        "speed": {
          "color": "#4DD0E1",
          "dropdown": {
            "0": ["25", "50", "75", "100"]
          },
          "title": "speed"
        },
        "setTimeout": {
          "value": true,
          "command": true,
          "color": "#64B5F6",
          "title": "setTimeout"
        },
        "clearTimeout": {
          "color": "#64B5F6",
          "title": "clearTimeout"
        },
        "setInterval": {
          "value": true,
          "command": true,
          "color": "#64B5F6",
          "title": "setInterval"
        },
        "clearInterval": {
          "color": "#64B5F6",
          "title": "clearInterval"
        },
        "console.log": {
          "color": "#BB77C7",
          "title": "console.log"
        },
        "declareAssign_str_hello_world": {
          "color": "#BB77C7",
          "title": "declareAssign_str_hello_world"
        },
        "*.substring": {
          "value": true,
          "color": "#BB77C7",
          "title": "*.substring"
        },
        "*.includes": {
          "color": "#BB77C7",
          "title": "*.includes",
          "value": true
        },
        "*.indexOf": {
          "value": true,
          "color": "#BB77C7",
          "title": "*.indexOf"
        },
        "*.length": {
          "color": "#BB77C7",
          "title": "*.length",
          "value": true,
          "property": true
        },
        "*.toUpperCase": {
          "value": true,
          "color": "#BB77C7",
          "title": "*.toUpperCase"
        },
        "*.toLowerCase": {
          "value": true,
          "color": "#BB77C7",
          "title": "*.toLowerCase"
        },
        "declareAssign_list_abd": {
          "color": "#BB77C7",
          "title": "declareAssign_list_abd"
        },
        "listLength": {
          "color": "#BB77C7",
          "title": "listLength",
          "value": true,
          "property": true
        },
        "insertItem": {
          "color": "#BB77C7",
          "title": "insertItem"
        },
        "appendItem": {
          "color": "#BB77C7",
          "title": "appendItem"
        },
        "removeItem": {
          "color": "#BB77C7",
          "title": "removeItem"
        },
        "imageUploadButton": {
          "color": "#19C3E1",
          "title": "imageUploadButton"
        },
        "container": {
          "color": "#19C3E1",
          "title": "container"
        },
        "innerHTML": {
          "color": "#19C3E1",
          "title": "innerHTML"
        },
        "setParent": {
          "color": "#19C3E1",
          "title": "setParent"
        },
        "setStyle": {
          "color": "#19C3E1",
          "title": "setStyle"
        },
        "getAttribute": {
          "value": true,
          "color": "#19C3E1",
          "title": "getAttribute"
        },
        "setAttribute": {
          "color": "#19C3E1",
          "title": "setAttribute"
        }
      },
      "categories": {
        "arithmetic": {
          "color": "#FFB74D"
        },
        "logic": {
          "color": "#FFB74D"
        },
        "conditionals": {
          "color": "#64B5F6"
        },
        "loops": {
          "color": "#64B5F6",
          "beginner": false
        },
        "functions": {
          "color": "#68D995"
        },
        "returns": {
          "color": "#68D995"
        },
        "comments": {
          "color": "#FFFFFF"
        },
        "containers": {
          "color": "#BB77C7"
        },
        "value": {
          "color": "#BB77C7"
        },
        "command": {
          "color": "#68D995"
        },
        "assignments": {
          "color": "#BB77C7"
        }
      }
    };
    var config = {
      dropletConfig: applabDropletConfig,
      level: {}
    };
    var result = dropletUtils.generateDropletModeOptions(config);

    // I got our expected result by running this code and doing a JSON.parse on
    // the result. This does some things like ignore fields set to undefined.
    // In order to be able to do an equality comparison, I stringify/parse
    // this result so that it will match our expected
    var normalizedResult = JSON.parse(JSON.stringify(result));
    assert.deepEqual(normalizedResult, expected);
  });

  it('generates the expected object for maze', function () {
    var expected = {
      "functions": {
        "getTime": {
          "value": true,
          "color": "#64B5F6",
          "title": "getTime"
        },
        "randomNumber": {
          "value": true,
          "color": "#FFB74D",
          "title": "randomNumber"
        },
        "prompt": {
          "value": true,
          "color": "#BB77C7",
          "title": "prompt"
        },
        "promptNum": {
          "value": true,
          "color": "#BB77C7",
          "title": "promptNum"
        },
        "Math.random": {
          "color": "#FFB74D",
          "title": "Math.random",
          "value": true
        },
        "Math.round": {
          "value": true,
          "color": "#FFB74D",
          "title": "Math.round"
        },
        "Math.abs": {
          "value": true,
          "color": "#FFB74D",
          "title": "Math.abs"
        },
        "Math.max": {
          "value": true,
          "color": "#FFB74D",
          "title": "Math.max"
        },
        "Math.min": {
          "value": true,
          "color": "#FFB74D",
          "title": "Math.min"
        },
        "moveForward": {
          "color": "red",
          "title": "moveForward"
        },
        "turnLeft": {
          "color": "red",
          "title": "turnLeft"
        },
        "turnRight": {
          "color": "red",
          "title": "turnRight"
        }
      },
      "categories": {
        "arithmetic": {
          "color": "#FFB74D"
        },
        "logic": {
          "color": "#FFB74D"
        },
        "conditionals": {
          "color": "#64B5F6"
        },
        "loops": {
          "color": "#64B5F6",
          "beginner": false
        },
        "functions": {
          "color": "#68D995"
        },
        "returns": {
          "color": "#68D995"
        },
        "comments": {
          "color": "#FFFFFF"
        },
        "containers": {
          "color": "#BB77C7"
        },
        "value": {
          "color": "#BB77C7"
        },
        "command": {
          "color": "#68D995"
        },
        "assignments": {
          "color": "#BB77C7"
        }
      }
    };
    var config = {
      dropletConfig: mazeDropletConfig,
      level: {}
    };
    var result = dropletUtils.generateDropletModeOptions(config);

    // I got our expected result by running this code and doing a JSON.parse on
    // the result. This does some things like ignore fields set to undefined.
    // In order to be able to do an equality comparison, I stringify/parse
    // this result so that it will match our expected
    var normalizedResult = JSON.parse(JSON.stringify(result));
    assert.deepEqual(normalizedResult, expected);
  });
});

describe('mergeCategoriesWithConfig', function () {
  var mergeCategoriesWithConfig = dropletUtils.__TestInterface.mergeCategoriesWithConfig;

  it('asdf', function () {
    var expected = {
      "UI controls": {
        "color": "yellow",
        "rgb": "#FFF176",
        "blocks": []
      },
      "Canvas": {
        "color": "red",
        "rgb": "#F78183",
        "blocks": []
      },
      "Data": {
        "color": "lightgreen",
        "rgb": "#D3E965",
        "blocks": []
      },
      "Turtle": {
        "color": "cyan",
        "rgb": "#4DD0E1",
        "blocks": []
      },
      "Advanced": {
        "color": "blue",
        "rgb": "#19C3E1",
        "blocks": []
      },
      "Control": {
        "color": "blue",
        "rgb": "#64B5F6",
        "blocks": []
      },
      "Math": {
        "color": "orange",
        "rgb": "#FFB74D",
        "blocks": []
      },
      "Variables": {
        "color": "purple",
        "rgb": "#BB77C7",
        "blocks": []
      },
      "Functions": {
        "color": "green",
        "rgb": "#68D995",
        "blocks": []
      },
      "": {
        "blocks": []
      }
    };

    var result = mergeCategoriesWithConfig(applabDropletConfig);
    // I got our expected result by running this code and doing a JSON.parse on
    // the result. This does some things like ignore fields set to undefined.
    // In order to be able to do an equality comparison, I stringify/parse
    // this result so that it will match our expected
    var normalizedResult = JSON.parse(JSON.stringify(result));
    assert.deepEqual(normalizedResult, expected);
    assert.deepEqual(Object.keys(expected), Object.keys(normalizedResult));
  });

  it('returns cloned categories', function () {
    var appConfig = {
      blocks: [
        {func: 'penUp', parent: {}, category: 'Turtle' }
      ],
      categories: {
        Turtle: {
          color: 'cyan',
          rgb: '#4DD0E1',
          blocks: []
        }
      }
    };

    var result = mergeCategoriesWithConfig(appConfig);

    // Make sure that the returned merged object is a clone. Otherwise, if we
    // were to be modifying result.Turtle.blocks (something that happens in
    // generateDropletPalette), we end up modifying the base config unintentionally
    assert(result.Turtle !== appConfig.categories.Turtle);
    assert(result.Turtle.blocks !== appConfig.categories.Turtle.blocks);
  });
});

describe('filteredBlocksFromConfig', function () {
  var filteredBlocksFromConfig = dropletUtils.__TestInterface.filteredBlocksFromConfig;

  var codeFunctions = {
    sourceBlock: null
  };

  var dropletConfig = {
    blocks: [
      {func: 'sourceBlock', category: 'Math', type: 'value', docFunc: 'targetBlock'},
      {func: 'targetBlock', category: 'Math', type: 'value'},
      {func: 'thirdBlock',  category: 'Math', type: 'value'}
    ]
  };

  it('returns source and target when paletteOnly is true', function () {
    var mergedBlocks = filteredBlocksFromConfig(codeFunctions, dropletConfig, null, { paletteOnly: true });
    assert.deepEqual(mergedBlocks, [
      {func: 'sourceBlock', category: 'Math', type: 'value', docFunc: 'targetBlock'},
      {func: 'targetBlock', category: 'Math', type: 'value'}
    ]);
  });

  it('returns all blocks when paletteOnly is false', function () {
    var mergedBlocks = filteredBlocksFromConfig(codeFunctions, dropletConfig, null);
    assert.deepEqual(mergedBlocks, dropletConfig.blocks);
  });

  it('doesnt return target when source is not in codeFunctions', function () {
    var codeFunctions = {
      thirdBlock: null
    };
    var mergedBlocks = filteredBlocksFromConfig(codeFunctions, dropletConfig, null, { paletteOnly: true });
    assert.deepEqual(mergedBlocks, [
      {func: 'thirdBlock',  category: 'Math', type: 'value'}
    ]);
  });
});
