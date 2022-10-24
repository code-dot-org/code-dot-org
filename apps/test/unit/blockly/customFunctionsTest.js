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
    const customBlocks = FUNCTION_CATEGORY(undefined, []).map(element =>
      // Filter out randomized ids and uninteresting attributes.
      JSON.stringify(element, ['tagName', 'innerHTML', 'outerHTML'])
    );
    const expectedBlocks = {
      tagName: 'block',
      innerHTML: '<field name="NAME">undefined</field>',
      outerHTML:
        '<block type="procedures_defnoreturn" gap="24"><field name="NAME">undefined</field></block>'
    };
    expect(customBlocks).to.deep.equal([JSON.stringify(expectedBlocks)]);
  });

  it('Category has correct blocks with one defined function', () => {
    const customBlocks = FUNCTION_CATEGORY(undefined, [
      ['myTestFunction', [], false]
    ]).map(element =>
      // Filter out randomized ids and uninteresting attributes.
      JSON.stringify(element, ['tagName', 'innerHTML', 'outerHTML'])
    );
    const expectedBlocks = [
      {
        tagName: 'block',
        innerHTML: '<field name="NAME">undefined</field>',
        outerHTML:
          '<block type="procedures_defnoreturn" gap="24"><field name="NAME">undefined</field></block>'
      },
      {
        tagName: 'block',
        innerHTML: '<mutation name="myTestFunction"></mutation>',
        outerHTML:
          '<block type= "procedures_callnoreturn" gap="16"><mutation name="myTestFunction"></mutation></block>'
      }
    ];
    expect(customBlocks).to.deep.equal(JSON.stringify(expectedBlocks));
  });

  it('Category has correct blocks with multiple defined functions', () => {
    const customBlocks = FUNCTION_CATEGORY(undefined, [
      ['myFirstTestFunction', [], false],
      ['mySecondTestFunction', [], false]
    ]).map(element =>
      // Filter out randomized ids and uninteresting attributes.
      JSON.stringify(element, ['tagName', 'innerHTML', 'outerHTML'])
    );
    const expectedBlocks = [
      '{"tagName":"block","innerHTML":"<field name=\\"NAME\\">undefined</field>","outerHTML":"<block type=\\"procedures_defnoreturn\\" gap=\\"24\\"><field name=\\"NAME\\">undefined</field></block>"}',
      '{"tagName":"block","innerHTML":"<mutation name=\\"myFirstTestFunction\\"></mutation>","outerHTML":"<block type=\\"procedures_callnoreturn\\" gap=\\"16\\"><mutation name=\\"myFirstTestFunction\\"></mutation></block>"}',
      '{"tagName":"block","innerHTML":"<mutation name=\\"mySecondTestFunction\\"></mutation>","outerHTML":"<block type=\\"procedures_callnoreturn\\" gap=\\"16\\"><mutation name=\\"mySecondTestFunction\\"></mutation></block>"}'
    ];
    expect(customBlocks).to.deep.equal(expectedBlocks);
  });
});
