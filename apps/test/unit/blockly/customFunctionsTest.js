/* global Blockly */
import sinon from 'sinon';
import GoogleBlockly from 'blockly/core';
import initializeGoogleBlocklyWrapper from '@cdo/apps/blockly/googleBlocklyWrapper';
import {expect} from '../../util/reconfiguredChai';
import '@cdo/apps/flappy/flappy'; // Importing the app forces the test to load Blockly
import {
  newDefinitionBlock,
  allCallBlocks
} from '../../../src/blockly/addons/functionBlocks.js';

describe('Custom Functions', () => {
  const cdoBlockly = Blockly;
  // Reset context menu registry.
  const registry = JSON.parse(
    JSON.stringify(GoogleBlockly.ContextMenuRegistry.registry.registry_)
  );
  beforeEach(() => {
    GoogleBlockly.JavaScript = sinon.spy();
    Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly); // eslint-disable-line no-global-assign
  });
  afterEach(() => {
    // Reset Blockly for other tests.
    Blockly = cdoBlockly; // eslint-disable-line no-global-assign
    // Reset context menu for other tests.
    GoogleBlockly.ContextMenuRegistry.registry.registry_ = JSON.parse(
      JSON.stringify(registry)
    );
  });

  it('Can create a blank function definition block', () => {
    const defBlock = newDefinitionBlock();
    const defBlockHTML = defBlock.map(element => element.outerHTML).join();
    const expectedHTML =
      '<block type="procedures_defnoreturn" gap="24"><field name="NAME">undefined</field></block>';
    expect(defBlockHTML).to.equal(expectedHTML);
  });

  it('Does not create call blocks if there are no defined functions', () => {
    const definedFunctions = [];
    const callBlock = allCallBlocks(definedFunctions);
    const callBlockHTML = callBlock.map(element => element.outerHTML).join();
    const expectedHTML = '';
    expect(callBlockHTML).to.equal(expectedHTML);
  });

  it('Can create a call block for one defined function', () => {
    const definedFunctions = [['myTestFunction', [], false]];
    const callBlock = allCallBlocks(definedFunctions);
    const callBlockHTML = callBlock.map(element => element.outerHTML).join();
    const expectedHTML = [
      '<block type="procedures_callnoreturn" gap="16"><mutation name="myTestFunction"></mutation></block>'
    ].join();
    expect(callBlockHTML).to.equal(expectedHTML);
  });

  it('Can create call blocks for multiple defined functions', () => {
    const definedFunctions = [
      ['myFirstTestFunction', [], false],
      ['mySecondTestFunction', [], false],
      ['myThirdTestFunction', [], false]
    ];
    const callBlocks = allCallBlocks(definedFunctions);
    const callBlocksHTML = callBlocks.map(element => element.outerHTML).join();
    const expectedHTML = [
      '<block type="procedures_callnoreturn" gap="16"><mutation name="myFirstTestFunction"></mutation></block>',
      '<block type="procedures_callnoreturn" gap="16"><mutation name="mySecondTestFunction"></mutation></block>',
      '<block type="procedures_callnoreturn" gap="16"><mutation name="myThirdTestFunction"></mutation></block>'
    ].join();
    expect(callBlocksHTML).to.equal(expectedHTML);
  });
});
