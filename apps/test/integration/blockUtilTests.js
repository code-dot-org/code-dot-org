import {parseElement} from '@cdo/apps/xml';

import {assert} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

import {setupTestBlockly} from './util/testBlockly';

var blockUtils = require('@cdo/apps/block_utils');
var requiredBlockUtils = require('@cdo/apps/required_block_utils');

describe('blockUtils', function () {
  beforeEach(function () {
    setupTestBlockly();
  });

  it('can create a block from XML', function () {
    var blockXMLString =
      '<block type="math_number"><field name="NUM">10</field></block>';
    assert(Blockly.mainBlockSpace.getBlockCount() === 0);
    var newBlock = blockUtils.domStringToBlock(blockXMLString);
    assert(Blockly.mainBlockSpace.getBlockCount() === 1);
    assert(newBlock.getFieldValue('NUM') === '10');
    assert(Blockly.cdoUtils.getBlockFields(newBlock).length === 1);
  });

  it('can create a block from XML and remove it from the workspace', function () {
    var blockXMLString =
      '<block type="math_number"><field name="NUM">10</field></block>';
    assert(Blockly.mainBlockSpace.getBlockCount() === 0);
    var newBlock = blockUtils.domStringToBlock(blockXMLString);
    assert(Blockly.mainBlockSpace.getBlockCount() === 1);
    newBlock.dispose();
    assert(Blockly.mainBlockSpace.getBlockCount() === 0);
  });
});

describe('requiredBlockUtils', function () {
  beforeEach(function () {
    setupTestBlockly();
  });

  it('can recognize matching titles in blocks', function () {
    var blockUserString =
      '<block type="math_number"><field name="NUM">10</field></block>';
    var blockUser = blockUtils.domStringToBlock(blockUserString);
    var blockRequiredString =
      '<block type="math_number"><field name="NUM">10</field></block>';
    var blockRequired = blockUtils.domStringToBlock(blockRequiredString);
    assert(Blockly.cdoUtils.getBlockFields(blockUser).length === 1);
    assert(Blockly.cdoUtils.getBlockFields(blockRequired).length === 1);
    assert(requiredBlockUtils.blockFieldsMatch(blockUser, blockRequired));
  });

  it('can recognize non-matching titles in blocks', function () {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="A">10</field></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="A">11</field></block>'
    );
    assert(!requiredBlockUtils.blockFieldsMatch(blockUser, blockRequired));
    assert(!requiredBlockUtils.blocksMatch(blockUser, blockRequired));
  });

  it('can recognize matching entire blocks', function () {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="A">10</field></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="A">10</field></block>'
    );
    assert(requiredBlockUtils.blocksMatch(blockUser, blockRequired));
  });

  it('can recognize mismatching block types', function () {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="logic_boolean"></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="A">10</field></block>'
    );
    assert(!requiredBlockUtils.blocksMatch(blockUser, blockRequired));
  });

  it('can recognize matching titles in blocks with multiple titles', function () {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="A">1</field><field name="B">2</field><field name="C">3</field></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="C">3</field><field name="B">2</field><field name="A">1</field></block>'
    );
    assert(requiredBlockUtils.blockFieldsMatch(blockUser, blockRequired));
  });

  it('can recognize mis-matching titles in blocks with differing Aber of titles', function () {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="A">1</field></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="A">1</field><field name="B">2</field><field name="C">3</field></block>'
    );
    assert(!requiredBlockUtils.blockFieldsMatch(blockUser, blockRequired));
    assert(!requiredBlockUtils.blockFieldsMatch(blockRequired, blockUser));
  });

  it('can recognize mis-matching titles in with multiple titles', function () {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="A">1</field><field name="B">2</field></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><field name="A">2</field><field name="B">1</field></block>'
    );
    assert(!requiredBlockUtils.blockFieldsMatch(blockUser, blockRequired));
  });

  it('can recognize matching blocks with mismatched ignored attributes', function () {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" deletable="false"><field name="A">1</field><field name="B">2</field></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles"><field name="A">1</field><field name="B">2</field></block>'
    );
    assert(
      requiredBlockUtils.elementsEquivalent(
        blockRequired,
        blockUser,
        true /* ignoreChildBlocks */
      )
    );
  });

  it('can recognize non-matching blocks with mismatched ignorarable attributes', function () {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" inputcount="3"><field name="A">1</field><field name="B">2</field></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles" inputcount="2"><field name="A">1</field><field name="B">2</field></block>'
    );
    assert.isFalse(
      requiredBlockUtils.elementsEquivalent(
        blockRequired,
        blockUser,
        true /* ignoreChildBlocks */
      )
    );
  });

  it('can recognize matching blocks with mismatched ignored ignorarable attributes', function () {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" inputcount="3"><field name="A">1</field><field name="B">2</field></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles" inputcount="???"><field name="A">1</field><field name="B">2</field></block>'
    );
    assert(
      requiredBlockUtils.elementsEquivalent(
        blockRequired,
        blockUser,
        true /* ignoreChildBlocks */
      )
    );
  });

  it('can recognize matching blocks with unspecified children', function () {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" inputcount="2"><field name="A">1</field><field name="B">2</field></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles" inputcount="???"></block>'
    );
    assert(
      requiredBlockUtils.elementsEquivalent(
        blockRequired,
        blockUser,
        true /* ignoreChildBlocks */
      )
    );
  });

  it('can recognize non-matching blocks with specified children', function () {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" inputcount="2"><field name="A">1</field><field name="B">2</field></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles" inputcount="2"><field name="A">2</field><field name="B">2</field></block>'
    );
    assert.isFalse(
      requiredBlockUtils.elementsEquivalent(
        blockRequired,
        blockUser,
        true /* ignoreChildBlocks */
      )
    );
  });

  it('can recognize non-matching blocks with missing children', function () {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" inputcount="2"></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles" inputcount="2"><field name="A">2</field><field name="B">2</field></block>'
    );
    assert.isFalse(
      requiredBlockUtils.elementsEquivalent(
        blockRequired,
        blockUser,
        true /* ignoreChildBlocks */
      )
    );
  });
});

describe('forceInsertTopBlock', function () {
  it('no blocks', function () {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false" id="topBlock"/></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false" id="topBlock"/></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });

  it('single block', function () {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '<block type="foo"/>';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false" id="topBlock"><next>' +
      withoutXml +
      '</next></block></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false" id="topBlock"><next>' +
      withoutXml +
      '</next></block></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });

  it('two unattached blocks', function () {
    var withXml, withoutXml, result, expected, msg;
    var block1 = '<block type="foo"/>';
    var block2 = '<block type="foo2"/>';
    withoutXml = block1 + block2;
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false" id="topBlock"><next>' +
      block1 +
      '</next></block>' +
      block2 +
      '</xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false" id="topBlock"><next>' +
      block1 +
      '</next></block>' +
      block2 +
      '</xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });

  it('two attached blocks', function () {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '<block type="foo"><next><block type="foo2"/></next></block>';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false" id="topBlock"><next>' +
      withoutXml +
      '</next></block></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false" id="topBlock"><next>' +
      withoutXml +
      '</next></block></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });

  it('two function blocks', function () {
    var withXml, withoutXml, result, expected, msg;
    var block1 = '<block type="procedures_defnoreturn"/>';
    var block2 = '<block type="procedures_defnoreturn"/>';
    withoutXml = block1 + block2;
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false" id="topBlock"/>' +
      block1 +
      block2 +
      '</xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false" id="topBlock"/>' +
      block1 +
      block2 +
      '</xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });

  it('already has a when_run', function () {
    var withXml, withoutXml, result, expected, msg;
    withoutXml =
      '<block type="when_run" movable="false" deletable="false"><next><block type="foo"/></next></block>';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected = withoutXml;
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected = withXml;
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });
});
