import _ from 'lodash';
import {assert, expect} from '../util/deprecatedChai';
import sinon from 'sinon';
import * as testUtils from './../util/testUtils';
import * as dropletUtils from '@cdo/apps/dropletUtils';
import {globalFunctions} from '@cdo/apps/dropletUtilsGlobalFunctions';
import * as mazeDropletConfig from '@cdo/apps/maze/dropletConfig';
import color from '@cdo/apps/util/color';

const BASE_DROPLET_CATEGORIES = Object.freeze({
  Control: {
    id: 'control',
    color: 'blue',
    rgb: '#64B5F6',
    blocks: []
  },
  Math: {
    id: 'math',
    color: 'orange',
    rgb: '#FFB74D',
    blocks: []
  },
  Variables: {
    id: 'variables',
    color: 'purple',
    rgb: '#BB77C7',
    blocks: []
  },
  Functions: {
    id: 'functions',
    color: 'green',
    rgb: '#68D995',
    blocks: []
  },
  '': {
    id: 'default',
    blocks: []
  }
});

const BASE_DROPLET_CONFIG = Object.freeze({
  functions: {
    getTime: {
      value: true,
      color: '#64B5F6',
      title: 'getTime'
    },
    randomNumber: {
      value: true,
      color: '#FFB74D',
      title: 'randomNumber'
    },
    prompt: {
      value: true,
      color: '#BB77C7',
      title: 'prompt'
    },
    promptNum: {
      value: true,
      color: '#BB77C7',
      title: 'promptNum'
    },
    'Math.random': {
      color: '#FFB74D',
      title: 'Math.random',
      value: true
    },
    'Math.round': {
      value: true,
      color: '#FFB74D',
      title: 'Math.round'
    },
    'Math.abs': {
      value: true,
      color: '#FFB74D',
      title: 'Math.abs'
    },
    'Math.max': {
      value: true,
      color: '#FFB74D',
      title: 'Math.max'
    },
    'Math.min': {
      value: true,
      color: '#FFB74D',
      title: 'Math.min'
    },
    'Math.pow': {
      value: true,
      color: '#FFB74D',
      title: 'Math.pow'
    },
    'Math.sqrt': {
      value: true,
      color: '#FFB74D',
      title: 'Math.sqrt'
    }
  },
  categories: {
    arithmetic: {
      color: '#FFB74D'
    },
    logic: {
      color: '#FFB74D'
    },
    conditionals: {
      color: '#64B5F6'
    },
    loops: {
      color: '#64B5F6',
      beginner: false
    },
    functions: {
      color: '#68D995'
    },
    returns: {
      color: '#68D995'
    },
    comments: {
      color: '#FFFFFF'
    },
    containers: {
      color: '#BB77C7'
    },
    value: {
      color: '#BB77C7'
    },
    command: {
      color: '#68D995'
    },
    assignments: {
      color: '#BB77C7'
    }
  },
  paramButtonsForUnknownFunctions: true
});

describe('dropletUtils', () => {
  testUtils.setExternalGlobals();

  describe('promptNum', () => {
    afterEach(() => {
      if (window.prompt.restore) {
        window.prompt.restore();
      }
    });

    it('returns a number if I enter a number', () => {
      const prompt = sinon.stub(window, 'prompt');
      prompt.returns('123');

      const val = globalFunctions.promptNum('Enter a value');
      assert.strictEqual(prompt.callCount, 1);
      assert.strictEqual(val, 123);
    });

    it('can handle non-integer numbers', () => {
      const prompt = sinon.stub(window, 'prompt');
      prompt.returns('1.23');

      const val = globalFunctions.promptNum('Enter a value');
      assert.strictEqual(prompt.callCount, 1);
      assert.strictEqual(val, 1.23);
    });

    it('reprompts if I enter a non-numerical value', () => {
      const prompt = sinon.stub(window, 'prompt');
      prompt.onCall(0).returns('onetwothree');
      prompt.onCall(1).returns('123');

      const val = globalFunctions.promptNum('Enter a value');
      assert.strictEqual(prompt.callCount, 2);
      assert.strictEqual(val, 123);
    });
  });

  describe('generateDropletModeOptions', () => {
    it('folds in specified blocks to config', () => {
      const expectedOptionsObject = _.merge({}, BASE_DROPLET_CONFIG, {
        functions: {
          MyTestBlock: {
            value: true,
            color: '#COO110',
            title: 'MyTestBlock'
          }
        }
      });
      const appOptionsConfig = {
        dropletConfig: {
          blocks: [
            {func: 'MyTestBlock', category: 'My Test Category', type: 'value'}
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

    it('generates the expected object for maze', () => {
      const expectedOptionsObject = _.merge({}, BASE_DROPLET_CONFIG, {
        functions: {
          moveForward: {
            color: 'red',
            title: 'moveForward'
          },
          turnLeft: {
            color: 'red',
            title: 'turnLeft'
          },
          turnRight: {
            color: 'red',
            title: 'turnRight'
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

  describe('mergeCategoriesWithConfig', () => {
    var mergeCategoriesWithConfig =
      dropletUtils.__TestInterface.mergeCategoriesWithConfig;

    it('can merge in specified categories into config', () => {
      const expected = _.merge(
        {},
        {
          'My Test Category': {
            id: 'test-category',
            color: 'blue',
            rgb: '#COO110',
            blocks: []
          }
        },
        BASE_DROPLET_CATEGORIES
      );

      const dropletConfig = {
        categories: {
          'My Test Category': {
            id: 'test-category',
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

    it('returns cloned categories', () => {
      var appConfig = {
        blocks: [{func: 'penUp', parent: {}, category: 'Turtle'}],
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

  describe('filteredBlocksFromConfig', () => {
    var filteredBlocksFromConfig =
      dropletUtils.__TestInterface.filteredBlocksFromConfig;

    var codeFunctions = {
      sourceBlock: null
    };

    var dropletConfig = {
      blocks: [
        {
          func: 'sourceBlock',
          category: 'Math',
          type: 'value',
          docFunc: 'targetBlock'
        },
        {func: 'targetBlock', category: 'Math', type: 'value'},
        {func: 'thirdBlock', category: 'Math', type: 'value'}
      ]
    };

    it('returns source and target when paletteOnly is true', () => {
      var mergedBlocks = filteredBlocksFromConfig(
        codeFunctions,
        dropletConfig,
        null,
        {paletteOnly: true}
      );
      assert.deepEqual(mergedBlocks, [
        {
          func: 'sourceBlock',
          category: 'Math',
          type: 'value',
          docFunc: 'targetBlock'
        },
        {func: 'targetBlock', category: 'Math', type: 'value'}
      ]);
    });

    it('returns all blocks when paletteOnly is false', () => {
      var mergedBlocks = filteredBlocksFromConfig(
        codeFunctions,
        dropletConfig,
        null
      );
      assert.deepEqual(mergedBlocks, dropletConfig.blocks);
    });

    it('doesnt return target when source is not in codeFunctions', () => {
      var codeFunctions = {
        thirdBlock: null
      };
      var mergedBlocks = filteredBlocksFromConfig(
        codeFunctions,
        dropletConfig,
        null,
        {paletteOnly: true}
      );
      assert.deepEqual(mergedBlocks, [
        {func: 'thirdBlock', category: 'Math', type: 'value'}
      ]);
    });
  });

  describe('getParamFromCodeAtIndex', () => {
    const getParamFromCodeAtIndex =
      dropletUtils.__TestInterface.getParamFromCodeAtIndex;

    it('works with single quotes', () => {
      const code = "myProperty('element1', ";
      assert.equal(getParamFromCodeAtIndex(0, 'myProperty', code), 'element1');
    });

    it('works with single quotes for 2 params', () => {
      const code = "myProperty('element1', 'element2',";
      assert.equal(getParamFromCodeAtIndex(1, 'myProperty', code), 'element2');
    });

    it('works with single quotes on the 1st param and a parenthetical expression for the 2nd param', () => {
      const code = "myProperty('element1', (a + b),";
      assert.equal(getParamFromCodeAtIndex(1, 'myProperty', code), '(a + b)');
    });

    it('works with single quotes for 2 params and embedded commas', () => {
      const code = "myProperty('element1', 'value,with,commas',";
      assert.equal(
        getParamFromCodeAtIndex(1, 'myProperty', code),
        'value,with,commas'
      );
    });

    it('works with double quotes', () => {
      const code = 'myProperty("element1", ';
      assert.equal(getParamFromCodeAtIndex(0, 'myProperty', code), 'element1');
    });

    it('works with double quotes with 2 params', () => {
      const code = 'myProperty("element1", "element2",';
      assert.equal(getParamFromCodeAtIndex(1, 'myProperty', code), 'element2');
    });

    it('works with double quotes on the 1st param and a parenthetical expression for the 2nd param', () => {
      const code = 'myProperty("element1", (a + b),';
      assert.equal(getParamFromCodeAtIndex(1, 'myProperty', code), '(a + b)');
    });

    it('works with double quotes for 2 params and embedded commas', () => {
      const code = 'myProperty("element1", "value,with,commas",';
      assert.equal(
        getParamFromCodeAtIndex(1, 'myProperty', code),
        'value,with,commas'
      );
    });

    it('works with single quotes on the 1st param and double quotes on the 2nd param', () => {
      const code = 'myProperty(\'element1\', "element2",';
      assert.equal(getParamFromCodeAtIndex(1, 'myProperty', code), 'element2');
    });

    it('works with double quotes on the 1st param and single quotes on the 2nd param', () => {
      const code = 'myProperty("element1", \'element2\',';
      assert.equal(getParamFromCodeAtIndex(1, 'myProperty', code), 'element2');
    });

    it('should return single parameter with mixed quotes and embedded comma', () => {
      const code = 'myProperty("element1\', ';
      assert.equal(getParamFromCodeAtIndex(0, 'myProperty', code), 'element1,');
    });

    it('works with no trailing space', () => {
      const code = "myProperty('element1',";
      assert.equal(getParamFromCodeAtIndex(0, 'myProperty', code), 'element1');
    });

    it('works with multiple `myProperty`s', () => {
      const code =
        "myProperty('element1', 'width', 100); myProperty('element2', ";
      assert.equal(getParamFromCodeAtIndex(0, 'myProperty', code), 'element2');
    });

    it('works with non-quoted strings (variable names)', () => {
      const code = 'myProperty(object1, ';
      assert.equal(getParamFromCodeAtIndex(0, 'myProperty', code), 'object1');
    });

    it('works with non-quoted strings (variable names) and double quotes on the 2nd param', () => {
      const code = 'myProperty(object1, "element2",';
      assert.equal(getParamFromCodeAtIndex(1, 'myProperty', code), 'element2');
    });

    it('works with non-quoted strings (variable names) and single quotes on the 2nd param', () => {
      const code = "myProperty(object1, 'element2',";
      assert.equal(getParamFromCodeAtIndex(1, 'myProperty', code), 'element2');
    });
  });

  describe('makeDisabledConfig', () => {
    let originalConfig;

    beforeEach(() => {
      originalConfig = {
        categories: {
          'A category': {
            color: 'cyan',
            rgb: '#00cccc',
            blocks: []
          }
        },
        blocks: [
          {
            func: 'pinMode',
            parent: {},
            category: 'A category',
            paletteParams: ['pin', 'mode'],
            params: ['13', '"output"'],
            dropdown: {1: ['"output"', '"input"', '"analog"']}
          },
          {
            func: 'digitalWrite',
            parent: {},
            category: 'A category',
            paletteParams: ['pin', 'value'],
            params: ['13', '1'],
            dropdown: {1: ['1', '0']}
          },
          {
            func: 'digitalRead',
            parent: {},
            category: 'A category',
            type: 'value',
            nativeIsAsync: true,
            paletteParams: ['pin'],
            params: ['"D4"']
          }
        ],
        additionalPredefValues: ['buttonL', 'buttonR'],
        autocompleteFunctionsWithSemicolon: true
      };
    });

    // Given a stating config, generates a "disabled" droplet config that has the
    // following properties:
    it('does not mutate the original config', () => {
      const originalConfigCopy = _.cloneDeep(originalConfig);
      dropletUtils.makeDisabledConfig(originalConfig);
      expect(originalConfigCopy).to.deep.equal(originalConfig);
    });

    it('removes all categories', () => {
      const disabledConfig = dropletUtils.makeDisabledConfig(originalConfig);
      expect(Object.keys(originalConfig.categories)).not.to.be.empty;
      expect(Object.keys(disabledConfig.categories)).to.be.empty;
    });

    it('removes all blocks from categories', () => {
      const disabledConfig = dropletUtils.makeDisabledConfig(originalConfig);
      assert(originalConfig.blocks.some(block => block.category !== undefined));
      assert(
        disabledConfig.blocks.every(block => block.category === undefined)
      );
    });

    it('turns all blocks gray', () => {
      const disabledConfig = dropletUtils.makeDisabledConfig(originalConfig);
      assert(
        originalConfig.blocks.some(block => block.color !== color.light_gray)
      );
      assert(
        disabledConfig.blocks.every(block => block.color === color.light_gray)
      );
    });

    it('removes all blocks from autocomplete', () => {
      const disabledConfig = dropletUtils.makeDisabledConfig(originalConfig);
      assert(originalConfig.blocks.some(block => !block.noAutocomplete));
      assert(disabledConfig.blocks.every(block => block.noAutocomplete));
    });

    it('removes all additional defines', () => {
      const disabledConfig = dropletUtils.makeDisabledConfig(originalConfig);
      expect(originalConfig.additionalPredefValues).not.to.be.empty;
      expect(disabledConfig.additionalPredefValues).to.be.empty;
    });
  });
});
