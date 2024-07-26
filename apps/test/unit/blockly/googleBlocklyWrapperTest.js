import GoogleBlockly from 'blockly/core';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {READ_ONLY_PROPERTIES} from '@cdo/apps/blockly/constants';
import initializeGoogleBlocklyWrapper from '@cdo/apps/blockly/googleBlocklyWrapper';
import '@cdo/apps/flappy/flappy'; // Importing the app forces the test to load Blockly

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('Google Blockly Wrapper', () => {
  const cdoBlockly = Blockly;
  beforeEach(() => {
    GoogleBlockly.JavaScript = sinon.spy();
    Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly); // eslint-disable-line no-global-assign
  });
  afterEach(() => {
    // Dispose navigation controller before initializing the wrapper again.
    Blockly.navigationController.dispose();
    // Reset Blockly for other tests.
    Blockly = cdoBlockly; // eslint-disable-line no-global-assign
    // Reset context menu for other tests.
    GoogleBlockly.ContextMenuRegistry.registry.reset();
  });

  it('readOnly properties cannot be set', () => {
    READ_ONLY_PROPERTIES.forEach(property => {
      expect(() => {
        Blockly[property] = 'NEW VALUE';
      }).to.throw('Cannot set property');
    });
  });

  it('getGenerator returns the JS Generator', () => {
    expect(Blockly.getGenerator()).to.deep.equal(Blockly.blockly_.JavaScript);
  });

  it('Setting SNAP_RADIUS also sets CONNECTING_SNAP_RADIUS', () => {
    Blockly.SNAP_RADIUS = 0;
    expect(Blockly.blockly_.CONNECTING_SNAP_RADIUS).to.equal(0);
    Blockly.SNAP_RADIUS = 100;
    expect(Blockly.blockly_.CONNECTING_SNAP_RADIUS).to.equal(100);
  });
});
