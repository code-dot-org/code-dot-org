import {assert} from '../util/configuredChai';
var testUtils = require('../util/testUtils');
import {setupTestBlockly, getStudioAppSingleton} from './util/testBlockly';

var testCollectionUtils = require('./util/testCollectionUtils');
var sharedFunctionalBlocks = require('@cdo/apps/sharedFunctionalBlocks');
import {TestResults} from '@cdo/apps/constants';

/**
 * Loads blocks into the workspace, then calls
 * checkForEmptyContainerBlockFailure_ and validates
 * that the result matches the expected result.
 */
describe("checkForEmptyContainerBlockFailure_", function () {
  var studioApp;

  testUtils.setExternalGlobals();

  // create our environment
  beforeEach(function () {
    setupTestBlockly();
    var blockInstallOptions = { isK1: false };
    var blocksCommon = require('@cdo/apps/blocksCommon');
    blocksCommon.install(Blockly, blockInstallOptions);

    studioApp = getStudioAppSingleton();
  });

  var checkResultForBlocks = function (args) {
    studioApp.loadBlocks(args.blockXml);

    // make sure we loaded correctly. text wont match exactly, but make sure if
    // we had xml, we loaded something
    var loaded = Blockly.Xml.domToText(
        Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
    assert(!args.blockXml || loaded, "either we didnt have  input xml" +
        "or we did, and we loaded something");

    assert.equal(args.result,
        studioApp.feedback_.checkForEmptyContainerBlockFailure_());
  };

  it("returns ALL_PASS when no blocks are present", function () {
    checkResultForBlocks({
      result: TestResults.ALL_PASS,
      blockXml: '<xml><block type="when_run"><next></next></block></xml>'
    });
  });

  it ("returns ALL_PASS when no container blocks are present", function () {
    checkResultForBlocks({
      result: TestResults.ALL_PASS,
      blockXml: '<xml><block type="when_run"><next><block type="text_print"></block></next></block></xml>'
    });
  });

  it ("returns EMPTY_BLOCK_FAIL when an empty container block is present", function () {
    checkResultForBlocks({
      result: TestResults.EMPTY_BLOCK_FAIL,
      blockXml: '<xml>' +
                  '<block type="when_run"><next>' +
                    '<block type="controls_repeat">' +
                      '<title name="TIMES">4</title>' +
                    '</block>' +
                  '</next></block>' +
                '</xml>'
    });
  });

  it ("returns ALL_PASS when all container blocks are filled", function () {
    checkResultForBlocks({
      result: TestResults.ALL_PASS,
      blockXml: '<xml>' +
                  '<block type="when_run"><next>' +
                    '<block type="controls_repeat">' +
                      '<title name="TIMES">4</title>' +
                      '<statement name="DO">' +
                        '<block type="text_print"></block>' +
                      '</statement>' +
                    '</block>' +
                  '</next></block>' +
                '</xml>'
    });
  });

  it ("returns EMPTY_FUNCTION_BLOCK_FAIL when an empty function block is present", function () {
    checkResultForBlocks({
      result: TestResults.EMPTY_FUNCTION_BLOCK_FAIL,
      blockXml: '<xml>' +
                  '<block type="when_run"><next>' +
                    '<block type="procedures_callnoreturn">' +
                      '<title name="NAME">do something</title>' +
                    '</block>' +
                  '</next></block>' +
                  '<block type="procedures_defnoreturn">' +
                    '<mutation/>' +
                    '<title name="NAME">do something</title>' +
                  '</block>' +
                '</xml>'
    });
  });

  it ("returns ALL_PASS when an empty function block is present, but not called", function () {
    checkResultForBlocks({
      result: TestResults.ALL_PASS,
      blockXml: '<xml>' +
                  '<block type="when_run"><next></next></block>' +
                  '<block type="procedures_defnoreturn">' +
                    '<mutation/>' +
                    '<title name="NAME">do something</title>' +
                  '</block>' +
                '</xml>'
    });
  });

  it ("returns ALL_PASS when all function blocks are filled", function () {
    checkResultForBlocks({
      result: TestResults.ALL_PASS,
      blockXml: '<xml>' +
                  '<block type="when_run"><next></next></block>' +
                  '<block type="procedures_defnoreturn">' +
                    '<mutation/>' +
                    '<title name="NAME">do something</title>' +
                    '<statement name="STACK">' +
                      '<block type="text_print"></block>' +
                    '</statement>' +
                  '</block>' +
                '</xml>'
    });
  });
});

/**
 * Loads blocks into the workspace, then calls
 * checkForEmptyContainerBlockFailure_ and validates
 * that the result matches the expected result.
 */
describe("throwOnInvalidExampleBlocks", function () {
  var studioApp;

  // create our environment
  beforeEach(function () {
    setupTestBlockly();
    studioApp = getStudioAppSingleton();
    sharedFunctionalBlocks.install(Blockly, Blockly.JavaScript, null);
  });

  it("throws on unfilled result", function () {
    studioApp.loadBlocks('<xml>' +
        '  <block type="functional_example" inline="false">' +
        '  <functional_input name="ACTUAL">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="aqua-star">' +
        '        <arg name="radius" type="Number"></arg>' +
        '      </mutation>' +
        '      <functional_input name="ARG0">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '  <functional_input name="EXPECTED">' +
        '    <block type="functional_plus" inline="false"></block>' +
        '  </functional_input>' +
        ' </block>' +
        '</xml>');
    assert.throws(function () {
      var exampleBlock = Blockly.mainBlockSpace.getTopBlocks().filter(function (block) {
        return block.type === "functional_example";
      })[0];
      var actualBlock = exampleBlock.getInputTargetBlock("ACTUAL");
      var expectedBlock = exampleBlock.getInputTargetBlock("EXPECTED");
      studioApp.feedback_.throwOnInvalidExampleBlocks(actualBlock, expectedBlock);
    }, Error, "Result has unfilled inputs");
  });

  it("throws on unfilled call", function () {
    studioApp.loadBlocks('<xml>' +
        '<block type="functional_example" inline="false">' +
        '  <functional_input name="ACTUAL">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="aqua-star">' +
        '        <arg name="radius" type="Number"></arg>' +
        '      </mutation>' +
        '    </block>' +
        '  </functional_input>' +
        '  <functional_input name="EXPECTED">' +
        '    <block type="functional_plus" inline="false">' +
        '      <functional_input name="ARG1">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="ARG2">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '</xml>');
    assert.throws(function () {
      var exampleBlock = Blockly.mainBlockSpace.getTopBlocks().filter(function (block) {
        return block.type === "functional_example";
      })[0];
      var actualBlock = exampleBlock.getInputTargetBlock("ACTUAL");
      var expectedBlock = exampleBlock.getInputTargetBlock("EXPECTED");
      studioApp.feedback_.throwOnInvalidExampleBlocks(actualBlock, expectedBlock);
    }, Error, "Call has unfilled inputs");
  });

  it("doesn't throw on filled call and result blocks", function () {
    studioApp.loadBlocks('<xml>' +
        '  <block type="functional_example" inline="false">' +
        '    <functional_input name="ACTUAL">' +
        '      <block type="functional_call" inline="false">' +
        '        <mutation name="aqua-star">' +
        '          <arg name="radius" type="Number"></arg>' +
        '        </mutation>' +
        '        <functional_input name="ARG0">' +
        '          <block type="functional_math_number">' +
        '            <title name="NUM">1</title>' +
        '          </block>' +
        '        </functional_input>' +
        '      </block>' +
        '    </functional_input>' +
        '    <functional_input name="EXPECTED">' +
        '      <block type="functional_plus" inline="false">' +
        '        <functional_input name="ARG1">' +
        '          <block type="functional_math_number">' +
        '            <title name="NUM">1</title>' +
        '          </block>' +
        '        </functional_input>' +
        '        <functional_input name="ARG2">' +
        '          <block type="functional_math_number">' +
        '            <title name="NUM">1</title>' +
        '          </block>' +
        '        </functional_input>' +
        '      </block>' +
        '    </functional_input>' +
        '  </block>' +
        '</xml>');
    assert.doesNotThrow(function () {
      var exampleBlock = Blockly.mainBlockSpace.getTopBlocks().filter(function (block) {
        return block.type === "functional_example";
      })[0];
      var actualBlock = exampleBlock.getInputTargetBlock("ACTUAL");
      var expectedBlock = exampleBlock.getInputTargetBlock("EXPECTED");
      studioApp.feedback_.throwOnInvalidExampleBlocks(actualBlock, expectedBlock);
    }, Error);
  });
});

describe("getUserBlocks_", function () {
  var studioApp;

  // create our environment
  beforeEach(function () {
    setupTestBlockly();
    studioApp = getStudioAppSingleton();
  });

  function validateNumUserBlocks(blockXml, expectedNum) {
    studioApp.loadBlocks(blockXml);

    // make sure we loaded correctly. text wont match exactly, but make sure if
    // we had xml, we loaded something
    var loaded = Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
    assert(loaded, "we didn't correctly load our test blocks");

    var userBlocks = studioApp.feedback_.getUserBlocks_();
    assert.equal(userBlocks.length, expectedNum);
  }

  it("usually ignores noneditable blocks", function () {
    var testBlockXml = [
      '<xml>',
      '<block editable="false" type="text_print"></block>',
      '<block editable="false" type="text"><title name="TEXT">TextContent</title></block>',
      '<block editable="false" type="math_number"><title name="NUM">10</title></block>',
      '</xml>'
    ];

    validateNumUserBlocks(testBlockXml.join(''), 0);
  });

  it("considers noneditable blocks when Blockly.readOnly === true", function () {
    var testBlockXml = [
      '<xml>',
      '<block editable="false" type="text_print"></block>',
      '<block editable="false" type="text"><title name="TEXT">TextContent</title></block>',
      '<block editable="false" type="math_number"><title name="NUM">10</title></block>',
      '</xml>'
    ];

    var readOnly = Blockly.readOnly;
    Blockly.readOnly = true;
    validateNumUserBlocks(testBlockXml.join(''), 3);
    Blockly.readOnly = readOnly;
  });
});


/**
 * Loads options.startBlocks into the workspace, then calls
 * getMissingBlocks and validates that the result matches the
 * options.expectedResult
 */
describe("getMissingBlocks_ tests", function () {
  var studioApp;

  /**
   * getMissingBlocks_ will return us an array of blocks.  We can't
   * validate these using a simple assert.deepEqual because some blocks
   * contain a members generated functions.  These functions are the
   * same in terms of contents, but do not share the same space in
   * memory, and thus will report as not equal when we want them to
   * report as equal.  This method exists to validate equality in a way
   * that treats those functions as equal.
   */
  function validateMissingBlocks(result, expectedResult) {
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

    function validateKey(key) {
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

    studioApp.loadBlocks(options.userBlockXml);

    // make sure we loaded correctly. text wont match exactly, but make sure if
    // we had xml, we loaded something
    var loaded = Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
    assert(!options.userBlockXml || loaded, "either we didnt have  input xml" +
      "or we did, and we loaded something");

    var missing = studioApp.feedback_.getMissingBlocks_(
        options.requiredBlocks, options.numToFlag);
    validateMissingBlocks(missing.blocksToDisplay, options.expectedResult);
  }

  // create our environment
  beforeEach(function () {
    setupTestBlockly();
    studioApp = getStudioAppSingleton();
  });

  // missing multiple blocks

  describe("required blocks look for existence of string in code", function () {
    var testBlocks = [
      {
        'test': 'someAwesomeVariable',
        'type': 'variables_get'
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
      '<block type="variables_get"><title name="VAR">someAwesomeVariable</title></block>',
      '<block type="text"><title name="TEXT">TextContent</title></block>',
      '<block type="math_number"><title name="NUM">10</title></block>'
    ];
    runTests(testBlocks, testBlockXml);
  });

  describe("required blocks use function to check for existence", function () {
    var testBlocks = [
      {
        'test': function (block) {
          return block.type === 'variables_get';
        },
        'type': 'variables_get'
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
      '<block type="variables_get"><title name="VAR">someAwesomeVariable</title></block>',
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

  function validateMissingBlocksFromLevelTest(testCollection, testData, dataItem) {
    var level = testCollectionUtils.getLevelFromCollection(testCollection,
      testData, dataItem);
    assert(global.Blockly, "Blockly is in global namespace");

    var skinForTests;
    if (testCollection.skinId) {
      var appSkins = require('@cdo/apps/' + testCollection.app + '/skins');
      skinForTests = appSkins.load(studioApp.assetUrl, testCollection.skinId);
    } else {
      skinForTests = {
        assetUrl: function (str) {
          return str;
        }
      };
    }

    var blockInstallOptions = { skin: skinForTests, isK1: false };
    var blocksCommon = require('@cdo/apps/blocksCommon');
    blocksCommon.install(Blockly, blockInstallOptions);
    var blocks = require('@cdo/apps/' + testCollection.app + '/blocks');
    assert(blocks);
    blocks.install(Blockly, blockInstallOptions);
    validateBlocks({
      requiredBlocks: level.requiredBlocks,
      numToFlag: 1,
      userBlockXml: testData.xml,
      expectedResult: testData.missingBlocks,
    });
  }

  describe("required blocks for specific levels", function () {
    var collections = testCollectionUtils.getCollections();
    collections.forEach(function (item) {
      var testCollection = item.data;
      var app = testCollection.app;

      testCollection.tests.forEach(function (testData, index) {
        var dataItem = require('./util/data')(app);

        if (testData.missingBlocks) {
          it('MissingBlocks: ' + testData.description, function () {
            validateMissingBlocksFromLevelTest(testCollection, testData, dataItem);
          });
        }
      });
    });
  });
});

describe("getCountableBlocks_", function () {
  var blocks = require('@cdo/apps/turtle/blocks');
  var blockInstallOptions = {
    skin: {
      assetUrl: function (str) {
        return str;
      }
    },
    isK1: false
  };
  var studioApp;

  // create our environment
  beforeEach(function () {
    setupTestBlockly();
    blocks.install(Blockly, blockInstallOptions);
    studioApp = getStudioAppSingleton();
  });

  var countBlocks = function (xml) {
    studioApp.loadBlocks(xml);
    return studioApp.feedback_.getCountableBlocks_().length;
  };

  it("does not count disabled blocks", function () {
    var count = countBlocks('<xml><block type="text_print" disabled="true"></block></xml>');
    assert.equal(0, count);
  });

  it("does not count draw_colour or alpha blocks or their children", function () {
    var count;

    count = countBlocks('<xml><block type="draw_colour"></block></xml>');
    assert.equal(0, count);

    count = countBlocks('<xml><block type="alpha"></block></xml>');
    assert.equal(0, count);

    count = countBlocks('<xml>' +
        '<block type="alpha">' +
          '<value name="VALUE">' +
            '<block type="math_number">' +
              '<title name="NUM">100</title>' +
            '</block>' +
          '</value>' +
        '</block>' +
      '</xml>');
    assert.equal(0, count);

    count = countBlocks('<xml>' +
        '<block type="draw_colour">' +
          '<value name="COLOUR">' +
            '<block type="colour_picker">' +
              '<title name="COLOUR">#ff0000</title>' +
            '</block>' +
          '</value>' +
        '</block>' +
      '</xml>');
    assert.equal(0, count);
  });

  it("counts all other blocks", function () {
    var count;

    count = countBlocks('<xml>' +
        '<block type="controls_repeat">' +
          '<title name="TIMES">4</title>' +
          '<statement name="DO">' +
            '<block type="text_print"></block>' +
          '</statement>' +
        '</block>' +
      '</xml>');
    assert.equal(2, count);

    count = countBlocks('<xml>' +
        '<block type="procedures_defnoreturn">' +
          '<mutation/>' +
          '<title name="NAME">do something</title>' +
        '</block>' +
      '</xml>');
    assert.equal(3, count);

    count = countBlocks('<xml>' +
        '<block type="procedures_defnoreturn">' +
          '<mutation/>' +
          '<title name="NAME">do something</title>' +
          '<statement name="STACK">' +
            '<block type="text_print"></block>' +
          '</statement>' +
        '</block>' +
      '</xml>');
    assert.equal(5, count);

    count = countBlocks('<xml>' +
      ' <block type="variables_set">' +
      '   <title name="VAR">length</title>' +
      '   <value name="VALUE">' +
      '     <block type="math_number">' +
      '       <title name="NUM">50</title>' +
      '     </block>' +
      '   </value>' +
      '   <next>' +
      '     <block type="controls_repeat_ext">' +
      '       <value name="TIMES">' +
      '         <block type="math_number">' +
      '           <title name="NUM">100</title>' +
      '         </block>' +
      '       </value>' +
      '       <statement name="DO">' +
      '         <block type="controls_repeat_ext">' +
      '           <value name="TIMES">' +
      '             <block type="math_number">' +
      '               <title name="NUM">3</title>' +
      '             </block>' +
      '           </value>' +
      '           <statement name="DO">' +
      '             <block type="draw_move">' +
      '               <title name="DIR">moveForward</title>' +
      '               <value name="VALUE">' +
      '                 <block type="variables_get">' +
      '                   <title name="VAR">length</title>' +
      '                 </block>' +
      '               </value>' +
      '               <next>' +
      '                 <block type="draw_turn">' +
      '                   <title name="DIR">turnLeft</title>' +
      '                   <value name="VALUE">' +
      '                     <block type="math_number">' +
      '                       <title name="NUM">120</title>' +
      '                     </block>' +
      '                   </value>' +
      '                 </block>' +
      '               </next>' +
      '             </block>' +
      '           </statement>' +
      '           <next>' +
      '             <block type="draw_move">' +
      '               <title name="DIR">moveForward</title>' +
      '               <value name="VALUE">' +
      '                 <block type="variables_get">' +
      '                   <title name="VAR">length</title>' +
      '                 </block>' +
      '               </value>' +
      '             </block>' +
      '           </next>' +
      '         </block>' +
      '       </statement>' +
      '     </block>' +
      '   </next>' +
      ' </block>' +
      '</xml>');
    assert.equal(17, count);
  });
});

describe("unusedBlocks", function () {
  var studioApp;
  var blockXml= '<xml><block type="text_print"></block></xml>';

  // create our environment
  beforeEach(function () {
    setupTestBlockly();
    var blockInstallOptions = { isK1: false };
    var blocksCommon = require('@cdo/apps/blocksCommon');
    blocksCommon.install(Blockly, blockInstallOptions);

    studioApp = getStudioAppSingleton();
  });

  afterEach(function () {
    Blockly.showUnusedBlocks = false;
  });

  var checkResultForBlocks = function (args) {
    studioApp.loadBlocks(blockXml);
    Blockly.showUnusedBlocks = args.unusedBlocksEnabled;

    assert.equal(args.result,
        studioApp.feedback_.getTestResults(true, [], [], true, {}));
  };

  it ("fails when unused blocks are disabled", function () {
    checkResultForBlocks({
      result: TestResults.EXTRA_TOP_BLOCKS_FAIL,
      unusedBlocksEnabled: false
    });
  });

  it ("passes when unused blocks are enabled", function () {
    checkResultForBlocks({
      result: TestResults.PASS_WITH_EXTRA_TOP_BLOCKS,
      unusedBlocksEnabled: true
    });
  });

});
