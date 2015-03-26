var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales();

describe("required blocks for specific levels", function () {
  var studioApp;

  beforeEach(function () {
    testUtils.setupTestBlockly();
    studioApp = testUtils.getStudioAppSingleton();
  });

  // Use globify transform to require a directory of files within the browserify bundle
  var collections = require('./solutions/**/*.js', {hash: 'path'});

  Object.keys(collections).forEach(function (path) {
    describe(path, function () {
      var collection = collections[path];
      if(collection.tests) {
        collection.tests.forEach(function (levelTest) {
          if (levelTest.missingBlocks) {
            it (levelTest.description, function () {
              var dataItem = require('./util/data')(collection.app);
              validateMissingBlocksFromLevelTest(studioApp, collection, dataItem, levelTest);
            });
          }
        });
      }
    });
  });
});

function validateMissingBlocksFromLevelTest(studioApp, collection, dataItem, levelTest) {
  assert(global.Blockly, "Blockly is in global namespace");

  var data = dataItem();

  var skinForTests;
  if (collection.skinId) {
    var appSkins = data.skins;
    skinForTests = appSkins.load(studioApp.assetUrl, collection.skinId);
  } else {
    skinForTests = {
      assetUrl: function (str) { return str; }
    };
  }

  var blockInstallOptions = { skin: skinForTests, isK1: false };
  var blocksCommon = require('@cdo/apps/blocksCommon');
  blocksCommon.install(Blockly, blockInstallOptions);

  var blocks = data.blocks;
  blocks.install(Blockly, blockInstallOptions);
  var levels = data.levels[collection.levelFile];

  validateBlocks(studioApp, {
    requiredBlocks: levels[collection.levelId].requiredBlocks,
    numToFlag: 1,
    userBlockXml: levelTest.xml,
    expectedResult: levelTest.missingBlocks
  });
}

function validateBlocks(studioApp, options) {
  assert.notEqual(options.requiredBlocks, undefined);
  assert.notEqual(options.numToFlag, undefined);
  assert.notEqual(options.userBlockXml, undefined);
  assert.notEqual(options.expectedResult, undefined);

  studioApp.loadBlocks(options.userBlockXml);

  // make sure we loaded correctly. text wont match exactly, but make sure if
  // we had xml, we loaded something
  var loaded = Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
  assert(!options.userBlockXml || loaded, "either we didnt have  input xml" +
  "or we did, and we loaded something");

  var missing = studioApp.feedback_.getMissingRequiredBlocks_(
    options.requiredBlocks, options.numToFlag);
  validateMissingRequiredBlocks(missing.blocksToDisplay, options.expectedResult);
}

/**
 * getMissingRequiredBlocks_ will return us an array of requiredBlocks.  We
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
