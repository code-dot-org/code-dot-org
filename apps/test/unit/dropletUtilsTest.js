const _ = require('lodash');
import {assert} from '../util/configuredChai';
var sinon = require('sinon');

var testUtils = require('./../util/testUtils');
testUtils.setupLocales('applab');
testUtils.setExternalGlobals();

var dropletUtils = require('@cdo/apps/dropletUtils');

var mazeDropletConfig = require('@cdo/apps/maze/dropletConfig');

const BASE_DROPLET_CATEGORIES = Object.freeze({
  "Control": {
    "id": "control",
    "color": "blue",
    "rgb": "#64B5F6",
    "blocks": []
  },
  "Math": {
    "id": "math",
    "color": "orange",
    "rgb": "#FFB74D",
    "blocks": []
  },
  "Variables": {
    "id": "variables",
    "color": "purple",
    "rgb": "#BB77C7",
    "blocks": []
  },
  "Functions": {
    "id": "functions",
    "color": "green",
    "rgb": "#68D995",
    "blocks": []
  },
  "": {
    "id": "default",
    "blocks": []
  }
});

const BASE_DROPLET_CONFIG = Object.freeze({
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
  },
  "paramButtonsForUnknownFunctions": true
});

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
  it('folds in specified blocks to config', function () {
    const expectedOptionsObject = _.merge({}, BASE_DROPLET_CONFIG, {
      functions: {
        "MyTestBlock": {
          "value": true,
          "color": "#COO110",
          "title": "MyTestBlock"
        }
      }
    });
    const appOptionsConfig = {
      dropletConfig: {
        blocks: [
          {func: 'MyTestBlock', category: 'My Test Category', type: 'value' }
        ],
        categories: {
          'My Test Category': {
            color: 'white',
            rgb: '#COO110',
            blocks: []
          }
        }
      },
      level: {
        codeFunctions: {
          MyTestBlock: null
        }
      }
    };
    const result = dropletUtils.generateDropletModeOptions(appOptionsConfig);

    // I got our expected result by running this code and doing a JSON.parse on
    // the result. This does some things like ignore fields set to undefined.
    // In order to be able to do an equality comparison, I stringify/parse
    // this result so that it will match our expected
    const normalizedResult = JSON.parse(JSON.stringify(result));
    assert.deepEqual(normalizedResult, expectedOptionsObject);
  });

  it('generates the expected object for maze', function () {
    const expectedOptionsObject = _.merge({}, BASE_DROPLET_CONFIG, {
      functions: {
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
      }
    });

    const appOptionsConfig = {
      dropletConfig: mazeDropletConfig,
      level: {
        codeFunctions: {
          moveForward: null,
          turnLeft: null,
          turnRight: null
        }
      }
    };
    const result = dropletUtils.generateDropletModeOptions(appOptionsConfig);

    // I got our expected result by running this code and doing a JSON.parse on
    // the result. This does some things like ignore fields set to undefined.
    // In order to be able to do an equality comparison, I stringify/parse
    // this result so that it will match our expected
    const normalizedResult = JSON.parse(JSON.stringify(result));
    assert.deepEqual(normalizedResult, expectedOptionsObject);
  });
});

describe('mergeCategoriesWithConfig', function () {
  var mergeCategoriesWithConfig = dropletUtils.__TestInterface.mergeCategoriesWithConfig;

  it('can merge in specified categories into config', function () {
    const expected = _.merge({}, {
      "My Test Category": {
        "id": "test-category",
        "color": "blue",
        "rgb": '#COO110',
        "blocks": []
      }
    }, BASE_DROPLET_CATEGORIES);

    const dropletConfig = {
      categories: {
        'My Test Category': {
          id: "test-category",
          color: 'blue',
          rgb: '#COO110',
          blocks: []
        }
      }
    };
    const result = mergeCategoriesWithConfig(dropletConfig);
    // I got our expected result by running this code and doing a JSON.parse on
    // the result. This does some things like ignore fields set to undefined.
    // In order to be able to do an equality comparison, I stringify/parse
    // this result so that it will match our expected
    const normalizedResult = JSON.parse(JSON.stringify(result));
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

describe('getFirstParamFromCode', () => {
  const getFirstParamFromCode = dropletUtils.__TestInterface.getFirstParamFromCode;

  it("works with single quotes", () => {
    const code = "myProperty('element1', ";
    assert.equal(getFirstParamFromCode('myProperty', code), 'element1');
  });

  it('works with double quotes', () => {
    const code = 'myProperty("element1", ';
    assert.equal(getFirstParamFromCode('myProperty', code), 'element1');
  });

  it('should return null with mixed quotes', () => {
    const code = 'myProperty("element1\', ';
    assert.equal(getFirstParamFromCode('myProperty', code), null);
  });

  it('works with no trailing space', () => {
    const code = "myProperty('element1',";
    assert.equal(getFirstParamFromCode('myProperty', code), 'element1');
  });

  it('works with multiple `myProperty`s', () => {
    const code = "myProperty('element1', 'width', 100); myProperty('element2', ";
    assert.equal(getFirstParamFromCode('myProperty', code), 'element2');
  });

  it('works with non-quoted strings (variable names)', () => {
    const code = "myProperty(object1, ";
    assert.equal(getFirstParamFromCode('myProperty', code), 'object1');
  });
});
