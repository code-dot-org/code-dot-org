var wrench = require('wrench');
var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
var canvas = require('canvas');

// Some of our feedback tests need to use Image
global.Image = canvas.Image;
global.Turtle = {};

// needed for Hammerjs in studio
global.navigator = {};

/**
 * Loads options.startBlocks into the workspace, then calls
 * getMissingRequiredBlocks and validates that the result matches the
 * options.expectedResult
 */
describe("getMissingRequiredBlocks tests", function () {
  var feedback;

  /**
   * getMissingRequiredBlocks will return us an array of requiredBlocks.  We
   * can't validate these using a simple assert.deepEqual because some blocks
   * contain a members generated functions.  These functions are the same in
   * terms of contents, but do not share the same space in memory, and thus
   * will report as not equal when we want them to report as equal.  This method
   * exists to validate equality in a way that treats those functions as equal.
   */
  function validateMissingRequiredBlocks(result, expectedResult) {
    var block, expectedBlock;

    if (result.length !== expectedResult.length) {
      // if we get here, we'll always fail, but this has the benefit of showing
      // us the diff in the failure
      assert.deepEqual(result, expectedResult);
    }

    // Convert a function to a string and remove whitespace
    function functionText(f) {
      return f.toString().replace(/\s/gm,"");
    }

    function validateKey (key) {
      assert.equal(typeof(block[key]), typeof(expectedBlock[key]),
        "members are of same type");
      if (typeof(block[key]) === "function") {
        // compare contents of functions rather than whether they are the same
        // object in memory
        assert.equal(functionText(block[key]), functionText(expectedBlock[key]));
      } else {
        assert.deepEqual(block[key], expectedBlock[key],
          "values for '" + key + "' are equal");
      }
    }

    for (var i = 0; i < result.length; i++) {
      block = result[i];
      expectedBlock = expectedResult[i];
      assert.deepEqual(Object.keys(block), Object.keys(expectedBlock),
        "Blocks have same keys");
      Object.keys(block).forEach(validateKey);
    }
  }

  function validateBlocks(options) {
    assert.notEqual(options.requiredBlocks, undefined);
    assert.notEqual(options.numToFlag, undefined);
    assert.notEqual(options.userBlockXml, undefined);
    assert.notEqual(options.expectedResult, undefined);

    // Should probably have these as inputs to getMissingRequiredBlocks instead
    // of fields on BlocklyApps as it's the only place they're used
    // In fact, may want to get rid of NUM_REQUIRED_BLOCKS_TO_FLAG as it's only
    // ever set to 1, or perhaps make it customizable per level
    BlocklyApps.REQUIRED_BLOCKS = options.requiredBlocks;
    BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = options.numToFlag;

    BlocklyApps.loadBlocks(options.userBlockXml);

    // make sure we loaded correctly. text wont match exactly, but make sure if
    // we had xml, we loaded something
    var loaded = Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
    assert(!options.userBlockXml || loaded, "either we didnt have  input xml" +
      "or we did, and we loaded something");

    var missing = feedback.__testonly__.getMissingRequiredBlocks();
    validateMissingRequiredBlocks(missing, options.expectedResult);
  }


  // create our environment
  beforeEach(function () {
    testUtils.setupTestBlockly();
    feedback = testUtils.requireWithGlobalsCheckSrcFolder('/feedback');
  });

  // missing multiple blocks

  describe("required blocks look for existence of string in code", function () {
    var testBlocks = [
      {
        'test': 'window.alert',
        'type': 'text_print'
      },
      {
        'test': 'TextContent',
        'type': 'text'
      },
      {
        'test': '10;',
        'type': 'math_number'
      }
    ];

    var testBlockXml = [
      '<block type="text_print"></block>',
      '<block type="text"><title name="TEXT">TextContent</title></block>',
      '<block type="math_number"><title name="NUM">10</title></block>'
    ];
    runTests(testBlocks, testBlockXml);
  });

  describe("required blocks use function to check for existence", function () {
    var testBlocks = [
      {
        'test': function (block) {
          return block.type === 'text_print';
        },
        'type': 'text_print'
      },
      {
        'test': function (block) {
          return block.type === 'text';
        },
        'type': 'text'
      },
      {
        'test': function (block) {
          return block.type === 'math_number';
        },
        'type': 'math_number'
      }
    ];

    var testBlockXml = [
      '<block type="text_print"></block>',
      '<block type="text"><title name="TEXT">TextContent</title></block>',
      '<block type="math_number"><title name="NUM">10</title></block>'
    ];

    runTests(testBlocks, testBlockXml);
  });

  function runTests(testBlocks, testBlockXml) {
    it ("expect 1 block, empty workspace, told block missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]]
        ],
        numToFlag: 1,
        userBlockXml: "",
        expectedResult: [testBlocks[0]],
      });
    });

    it ("expect 1 block, wrong block present, told block missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]]
        ],
        numToFlag: 1,
        userBlockXml: "<xml>" + testBlockXml[1] + '</xml>',
        expectedResult: [testBlocks[0]]
      });
    });

    it ("expect 1 block, block is there, told no blocks missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]]
        ],
        numToFlag: 1,
        userBlockXml: "<xml>" + testBlockXml[0] + '</xml>',
        expectedResult: []
      });
    });

    it ("expect 2 blocks, numToFlag = 1, both missing, told first block missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]],
          [testBlocks[1]]
        ],
        numToFlag: 1,
        userBlockXml: "",
        expectedResult: [testBlocks[0]]
      });
    });
    it ("expect 2 blocks, numToFlag = 2, both missing, told both missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]],
          [testBlocks[1]]
        ],
        numToFlag: 2,
        userBlockXml: "",
        expectedResult: [testBlocks[0], testBlocks[1]]
      });
    });
    it ("expect 2 blocks, numToFlag = 2, first block missing, told second block missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]],
          [testBlocks[1]]
        ],
        numToFlag: 2,
        userBlockXml: "<xml>" + testBlockXml[0] + '</xml>',
        expectedResult: [testBlocks[1]]
      });
    });
    it ("expect 2 blocks, numToFlag = 2, second block missing, told first block missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[0]],
          [testBlocks[1]]
        ],
        numToFlag: 2,
        userBlockXml: "<xml>" + testBlockXml[0] + testBlockXml[1] + '</xml>',
        expectedResult: [],
        assertMessage: "no blocks missing"
      });
    });

    // todo - maybe also do a combo of both a single a double missing

    it ("expect 1 of 2 blocks, empty workspace, told of both missing blocks", function () {
      // empty workspace
      validateBlocks({
        requiredBlocks: [
          [testBlocks[1], testBlocks[2]] // allow text or number
        ],
        numToFlag: 1,
        userBlockXml: "",
        expectedResult: [testBlocks[1]]
      });
    });

    it ("expect 1 of 2 blocks, first block there, told none missing", function () {
      // should work with either block
      validateBlocks({
        requiredBlocks: [
          [testBlocks[1], testBlocks[2]] // allow text or number
        ],
        numToFlag: 1,
        userBlockXml: "<xml>" + testBlockXml[1] + "</xml>",
        expectedResult: []
      });
    });

    it ("expect 1 of 2 blocks, second block there, told none missing", function () {
      validateBlocks({
        requiredBlocks: [
          [testBlocks[1], testBlocks[2]] // allow text or number
        ],
        numToFlag: 1,
        userBlockXml: "<xml>" + testBlockXml[2] + "</xml>",
        expectedResult: []
      });
    });
  }

  // todo - move this into shared dir
  // Get all json files under directory path
  function getTestCollections (directory) {
    var files = wrench.readdirSyncRecursive(directory);
    var testCollections = [];
    files.forEach(function (file) {
      if (/\.js$/.test(file)) {
        testCollections.push(file);
      }
    });
    return testCollections;
  }

  function validateMissingBlocksFromLevelTest(collection, levelTest) {
    it (levelTest.description, function () {
      assert(global.Blockly, "Blockly is in global namespace");
      var levels = testUtils.requireWithGlobalsCheckSrcFolder(collection.app + '/' +
        collection.levelFile, []);

      var skinForTests;
      if (collection.skinId) {
        var appSkins = testUtils.requireWithGlobalsCheckSrcFolder(collection.app + '/skins');
        skinForTests = appSkins.load(BlocklyApps.assetUrl, collection.skinId);
      } else {
        skinForTests = {
          assetUrl: function (str) { return str; }
        };
      }

      var blockInstallOptions = { skin: skinForTests, isK1: false };
      var blocksCommon = testUtils.requireWithGlobalsCheckSrcFolder('blocksCommon');
      blocksCommon.install(Blockly, blockInstallOptions);
      var blocks = testUtils.requireWithGlobalsCheckSrcFolder(collection.app + '/blocks');
      blocks.install(Blockly, blockInstallOptions);
      validateBlocks({
        requiredBlocks: levels[collection.levelId].requiredBlocks,
        numToFlag: 1,
        userBlockXml: levelTest.xml,
        expectedResult: levelTest.missingBlocks,
      });
    });
  }

  describe("required blocks for specific levels", function () {
    var collections = getTestCollections('./test/solutions');
    collections.forEach(function (path) {
      describe(path, function () {
        var collection = require('./solutions/' + path);
        collection.tests.forEach(function (levelTest) {
          if (levelTest.missingBlocks) {
            validateMissingBlocksFromLevelTest(collection, levelTest);
          }
        });
      });
    });
  });
});
