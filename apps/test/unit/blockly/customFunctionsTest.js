import {expect} from '../../util/reconfiguredChai';
import {
  newDefinitionBlock,
  allCallBlocks
} from '../../../src/blockly/addons/functionEditor.js';
import xml from '@cdo/apps/xml';

describe('Custom Functions', () => {
  it('Can create a blank function definition block', () => {
    const defBlock = newDefinitionBlock('new function');
    const expectedXML =
      '<block type="procedures_defnoreturn" gap="24"><field name="NAME">new function</field></block>';
    expect(defBlock.isEqualNode(xml.parseElement(expectedXML, true))).to.be
      .true;
  });

  it('Does not create call blocks if there are no defined functions', () => {
    const definedFunctions = [];
    const callBlocks = allCallBlocks(definedFunctions);
    expect(callBlocks).to.be.empty;
  });

  it('Can create a call block for one defined function', () => {
    const definedFunctions = [['myTestFunction', [], false]];
    const callBlock = allCallBlocks(definedFunctions);
    const expectedXML = [
      '<block type="procedures_callnoreturn" gap="16"><mutation name="myTestFunction"></mutation></block>'
    ];

    expect(callBlock[0].isEqualNode(xml.parseElement(expectedXML[0], true))).to
      .be.true;
  });

  it('Can create call blocks for multiple defined functions', () => {
    const definedFunctions = [
      ['myFirstTestFunction', [], false],
      ['mySecondTestFunction', [], false],
      ['myThirdTestFunction', [], false]
    ];
    const callBlocks = allCallBlocks(definedFunctions);
    const expectedXML = [
      '<block type="procedures_callnoreturn" gap="16"><mutation name="myFirstTestFunction"></mutation></block>',
      '<block type="procedures_callnoreturn" gap="16"><mutation name="mySecondTestFunction"></mutation></block>',
      '<block type="procedures_callnoreturn" gap="16"><mutation name="myThirdTestFunction"></mutation></block>'
    ];

    callBlocks.forEach((block, index) => {
      expect(block.isEqualNode(xml.parseElement(expectedXML[index], true))).to
        .be.true;
    });
  });
});
