/* global Blockly */
import sinon from 'sinon';
import GoogleBlockly from 'blockly/core';
import initializeGoogleBlocklyWrapper from '@cdo/apps/blockly/googleBlocklyWrapper';
import {expect} from '../../util/reconfiguredChai';
import '@cdo/apps/flappy/flappy'; // Importing the app forces the test to load Blockly
import {FUNCTION_CATEGORY} from '../../../src/blockly/addons/functionBlocks.js';

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

  it('Category has correct blocks with no defined functions', () => {
    const customBlocks = FUNCTION_CATEGORY(undefined, []);
    const customBlocksHTML = customBlocks
      .map(element => element.outerHTML)
      .join();
    const expectedBlocksHTML =
      '<block type="procedures_defnoreturn" gap="24"><field name="NAME">undefined</field></block>';
    expect(customBlocksHTML).to.deep.equal(expectedBlocksHTML);
  });

  it('Category has correct blocks with one defined function', () => {
    const customBlocks = FUNCTION_CATEGORY(undefined, [
      ['myTestFunction', [], false]
    ]);
    const customBlocksHTML = customBlocks
      .map(element => element.outerHTML)
      .join();
    const expectedBlocksHTML = [
      '<block type="procedures_defnoreturn" gap="24"><field name="NAME">undefined</field></block>',
      '<block type="procedures_callnoreturn" gap="16"><mutation name="myTestFunction"></mutation></block>'
    ].join();
    expect(customBlocksHTML).to.equal(expectedBlocksHTML);
  });

  it('Category has correct blocks with multiple defined functions', () => {
    const customBlocks = FUNCTION_CATEGORY(undefined, [
      ['myFirstTestFunction', [], false],
      ['mySecondTestFunction', [], false]
    ]);
    const customBlocksHTML = customBlocks
      .map(element => element.outerHTML)
      .join();
    const expectedBlocksHTML = [
      '<block type="procedures_defnoreturn" gap="24"><field name="NAME">undefined</field></block>',
      '<block type="procedures_callnoreturn" gap="16"><mutation name="myFirstTestFunction"></mutation></block>',
      '<block type="procedures_callnoreturn" gap="16"><mutation name="mySecondTestFunction"></mutation></block>'
    ].join();
    expect(customBlocksHTML).to.deep.equal(expectedBlocksHTML);
  });
});
