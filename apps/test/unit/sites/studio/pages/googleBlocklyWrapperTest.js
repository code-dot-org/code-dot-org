/* global Blockly */
import GoogleBlockly from 'blockly/core';
import initializeGoogleBlocklyWrapper from '@cdo/apps/sites/studio/pages/googleBlocklyWrapper';
import {expect} from '../../../../util/reconfiguredChai';
import '@cdo/apps/flappy/flappy'; // Importing the app forces the test to load Blockly

describe('Google Blockly Wrapper', () => {
  const cdoBlockly = Blockly;
  beforeEach(() => {
    Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly); // eslint-disable-line no-global-assign
  });
  afterEach(() => {
    // reset Blockly for other tests
    Blockly = cdoBlockly; // eslint-disable-line no-global-assign
  });

  it('readOnly properties cannot be set', () => {
    const readOnlyProperties = [
      'ALIGN_CENTRE',
      'ALIGN_LEFT',
      'ALIGN_RIGHT',
      'applab_locale',
      'bindEvent_',
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
      'FieldButton',
      'FieldColour',
      'FieldColourDropdown',
      'FieldDropdown',
      'FieldIcon',
      'FieldImage',
      'FieldImageDropdown',
      'FieldLabel',
      'FieldParameter',
      'FieldRectangularDropdown',
      'FieldTextInput',
      'FieldVariable',
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
      'Xml'
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

  it('fieldToDom_ creates title tags', () => {
    const field = new Blockly.blockly_.Field(null);
    field.SERIALIZABLE = true;
    field.name = 'test';
    const expectedXml = `<title xmlns="https://developers.google.com/blockly/xml" name="test"></title>`;
    expect(Blockly.Xml.domToText(Blockly.Xml.fieldToDom_(field))).to.equal(
      expectedXml
    );
  });
});
