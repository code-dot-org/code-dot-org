import sinon from 'sinon';
import GoogleBlockly from 'blockly/core';
import initializeGoogleBlocklyWrapper from '@cdo/apps/blockly/googleBlocklyWrapper';
import {expect} from '../../util/reconfiguredChai';
import '@cdo/apps/flappy/flappy'; // Importing the app forces the test to load Blockly

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
    const readOnlyProperties = [
      'ALIGN_CENTRE',
      'ALIGN_LEFT',
      'ALIGN_RIGHT',
      'applab_locale',
      'blockRendering',
      'Block',
      'BlockFieldHelper',
      'Blocks',
      'BlockSvg',
      'common_locale',
      'Connection',
      'ContextMenu',
      'contractEditor',
      'createSvgElement',
      'Css',
      'disableVariableEditing',
      'Events',
      'FieldAngleDropdown',
      'FieldAngleInput',
      'FieldAngleTextInput',
      'FieldColour',
      'FieldColourDropdown',
      'FieldIcon',
      'FieldLabel',
      'FieldParameter',
      'FieldRectangularDropdown',
      'fish_locale',
      'Flyout',
      'FunctionalBlockUtils',
      'FunctionalTypeColors',
      'FunctionEditor',
      'functionEditor',
      'gamelab_locale',
      'Generator',
      'geras',
      'getRelativeXY',
      'googlecode',
      'hasCategories',
      'html',
      'Input',
      'INPUT_VALUE',
      'js',
      'modalBlockSpace',
      'Msg',
      'Names',
      'netsim_locale',
      'Procedures',
      'removeChangeListener',
      'RTL',
      'selected',
      'tutorialExplorer_locale',
      'useContractEditor',
      'useModalFunctionEditor',
      'utils',
      'Trashcan',
      'Variables',
      'weblab_locale',
      'Workspace',
      'WorkspaceSvg',
      'Xml',
    ];
    readOnlyProperties.forEach(property => {
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
