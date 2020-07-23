import {assert} from '../util/deprecatedChai';
import {setupTestBlockly} from './util/testBlockly';
import {parseElement} from '@cdo/apps/xml';

var requiredBlockUtils = require('@cdo/apps/required_block_utils');
var blockUtils = require('@cdo/apps/block_utils');

describe('blockUtils', function() {
  beforeEach(function() {
    setupTestBlockly();
  });

  it('can create a block from XML', function() {
    var blockXMLString =
      '<block type="math_number"><title name="NUM">10</title></block>';
    assert(Blockly.mainBlockSpace.getBlockCount() === 0);
    var newBlock = blockUtils.domStringToBlock(blockXMLString);
    assert(Blockly.mainBlockSpace.getBlockCount() === 1);
    assert(newBlock.getTitleValue('NUM') === '10');
    assert(newBlock.getTitles().length === 1);
  });

  it('can create a block from XML and remove it from the workspace', function() {
    var blockXMLString =
      '<block type="math_number"><title name="NUM">10</title></block>';
    assert(Blockly.mainBlockSpace.getBlockCount() === 0);
    var newBlock = blockUtils.domStringToBlock(blockXMLString);
    assert(Blockly.mainBlockSpace.getBlockCount() === 1);
    newBlock.dispose();
    assert(Blockly.mainBlockSpace.getBlockCount() === 0);
  });
});

describe('requiredBlockUtils', function() {
  beforeEach(function() {
    setupTestBlockly();
  });

  it('can recognize matching titles in blocks', function() {
    var blockUserString =
      '<block type="math_number"><title name="NUM">10</title></block>';
    var blockUser = blockUtils.domStringToBlock(blockUserString);
    var blockRequiredString =
      '<block type="math_number"><title name="NUM">10</title></block>';
    var blockRequired = blockUtils.domStringToBlock(blockRequiredString);
    assert(blockUser.getTitles().length === 1);
    assert(blockRequired.getTitles().length === 1);
    assert(requiredBlockUtils.blockTitlesMatch(blockUser, blockRequired));
  });

  it('can recognize non-matching titles in blocks', function() {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="A">10</title></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="A">11</title></block>'
    );
    assert(!requiredBlockUtils.blockTitlesMatch(blockUser, blockRequired));
    assert(!requiredBlockUtils.blocksMatch(blockUser, blockRequired));
  });

  it('can recognize matching entire blocks', function() {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="A">10</title></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="A">10</title></block>'
    );
    assert(requiredBlockUtils.blocksMatch(blockUser, blockRequired));
  });

  it('can recognize mismatching block types', function() {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="logic_boolean"></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="A">10</title></block>'
    );
    assert(!requiredBlockUtils.blocksMatch(blockUser, blockRequired));
  });

  it('can recognize matching titles in blocks with multiple titles', function() {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="A">1</title><title name="B">2</title><title name="C">3</title></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="C">3</title><title name="B">2</title><title name="A">1</title></block>'
    );
    assert(requiredBlockUtils.blockTitlesMatch(blockUser, blockRequired));
  });

  it('can recognize mis-matching titles in blocks with differing Aber of titles', function() {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="A">1</title></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="A">1</title><title name="B">2</title><title name="C">3</title></block>'
    );
    assert(!requiredBlockUtils.blockTitlesMatch(blockUser, blockRequired));
    assert(!requiredBlockUtils.blockTitlesMatch(blockRequired, blockUser));
  });

  it('can recognize mis-matching titles in with multiple titles', function() {
    var blockUser = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="A">1</title><title name="B">2</title></block>'
    );
    var blockRequired = blockUtils.domStringToBlock(
      '<block type="block_with_3_titles"><title name="A">2</title><title name="B">1</title></block>'
    );
    assert(!requiredBlockUtils.blockTitlesMatch(blockUser, blockRequired));
  });

  it('can recognize matching blocks with mismatched ignored attributes', function() {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" deletable="false"><title name="A">1</title><title name="B">2</title></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles"><title name="A">1</title><title name="B">2</title></block>'
    );
    assert(requiredBlockUtils.elementsEquivalent(blockRequired, blockUser));
  });

  it('can recognize non-matching blocks with mismatched ignorarable attributes', function() {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" inputcount="3"><title name="A">1</title><title name="B">2</title></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles" inputcount="2"><title name="A">1</title><title name="B">2</title></block>'
    );
    assert.isFalse(
      requiredBlockUtils.elementsEquivalent(blockRequired, blockUser)
    );
  });

  it('can recognize matching blocks with mismatched ignored ignorarable attributes', function() {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" inputcount="3"><title name="A">1</title><title name="B">2</title></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles" inputcount="???"><title name="A">1</title><title name="B">2</title></block>'
    );
    assert(requiredBlockUtils.elementsEquivalent(blockRequired, blockUser));
  });

  it('can recognize matching blocks with unspecified children', function() {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" inputcount="2"><title name="A">1</title><title name="B">2</title></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles" inputcount="???"></block>'
    );
    assert(requiredBlockUtils.elementsEquivalent(blockRequired, blockUser));
  });

  it('can recognize non-matching blocks with specified children', function() {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" inputcount="2"><title name="A">1</title><title name="B">2</title></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles" inputcount="2"><title name="A">2</title><title name="B">2</title></block>'
    );
    assert.isFalse(
      requiredBlockUtils.elementsEquivalent(blockRequired, blockUser)
    );
  });

  it('can recognize non-matching blocks with missing children', function() {
    var blockUser = parseElement(
      '<block type="block_with_3_titles" inputcount="2"></block>'
    );
    var blockRequired = parseElement(
      '<block type="block_with_3_titles" inputcount="2"><title name="A">2</title><title name="B">2</title></block>'
    );
    assert.isFalse(
      requiredBlockUtils.elementsEquivalent(blockRequired, blockUser)
    );
  });
});

describe('forceInsertTopBlock', function() {
  it('no blocks', function() {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false"/></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false"/></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });

  it('single block', function() {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '<block type="foo"/>';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false"><next>' +
      withoutXml +
      '</next></block></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false"><next>' +
      withoutXml +
      '</next></block></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });

  it('two unattached blocks', function() {
    var withXml, withoutXml, result, expected, msg;
    var block1 = '<block type="foo"/>';
    var block2 = '<block type="foo2"/>';
    withoutXml = block1 + block2;
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false"><next>' +
      block1 +
      '</next></block>' +
      block2 +
      '</xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false"><next>' +
      block1 +
      '</next></block>' +
      block2 +
      '</xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });

  it('two attached blocks', function() {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '<block type="foo"><next><block type="foo2"/></next></block>';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false"><next>' +
      withoutXml +
      '</next></block></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false"><next>' +
      withoutXml +
      '</next></block></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });

  it('two function blocks', function() {
    var withXml, withoutXml, result, expected, msg;
    var block1 = '<block type="procedures_defnoreturn"/>';
    var block2 = '<block type="procedures_defnoreturn"/>';
    withoutXml = block1 + block2;
    result = blockUtils.forceInsertTopBlock(withoutXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false"/>' +
      block1 +
      block2 +
      '</xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'when_run');
    expected =
      '<xml><block type="when_run" movable="false" deletable="false"/>' +
      block1 +
      block2 +
      '</xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });

  it('already has a when_run', function() {
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

  it('insert functional_compute', function() {
    var withXml, withoutXml, result, expected, msg;
    withoutXml = '<block type="foo"/>';
    result = blockUtils.forceInsertTopBlock(withoutXml, 'functional_compute');
    expected =
      '<xml><block type="functional_compute" movable="false" deletable="false">' +
      '<functional_input name="ARG1">' +
      withoutXml +
      '</functional_input></block></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);

    withXml = '<xml>' + withoutXml + '</xml>';
    result = blockUtils.forceInsertTopBlock(withXml, 'functional_compute');
    expected =
      '<xml><block type="functional_compute" movable="false" deletable="false">' +
      '<functional_input name="ARG1">' +
      withoutXml +
      '</functional_input></block></xml>';
    msg = '\n' + 'result: ' + result + '\n' + 'expect: ' + expected + '\n';
    assert(result === expected, msg);
  });
});
