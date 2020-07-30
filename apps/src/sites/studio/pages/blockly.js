import Blockly from '@code-dot-org/blockly';

const BlocklyWrapper = function(blocklyInstance) {
  this.blockly_ = blocklyInstance;
  this.Msg = blocklyInstance.Msg;
  this.inject = this.blockly_.inject;
  this.wrapProperty = function(propertyName) {
    Object.defineProperty(this, propertyName, {
      get: function() {
        return this.blockly_[propertyName];
      }
    });
  };
};

function initializeBlocklyWrapper() {
  const blocklyWrapper = new BlocklyWrapper(Blockly);

  blocklyWrapper.wrapProperty('ALIGN_CENTRE');
  blocklyWrapper.wrapProperty('ALIGN_LEFT');
  blocklyWrapper.wrapProperty('ALIGN_RIGHT');
  blocklyWrapper.wrapProperty('assetUrl');
  blocklyWrapper.wrapProperty('behaviorEditor');
  blocklyWrapper.wrapProperty('bindEvent_');
  blocklyWrapper.wrapProperty('Block');
  blocklyWrapper.wrapProperty('Blocks');
  blocklyWrapper.wrapProperty('BlockSpace');
  blocklyWrapper.wrapProperty('BlockSvg');
  blocklyWrapper.wrapProperty('BlockValueType');
  blocklyWrapper.wrapProperty('BROKEN_CONTROL_POINTS');
  blocklyWrapper.wrapProperty('BUMP_UNCONNECTED');
  blocklyWrapper.wrapProperty('Connection');
  blocklyWrapper.wrapProperty('contractEditor');
  blocklyWrapper.wrapProperty('createSvgElement');
  blocklyWrapper.wrapProperty('Css');
  blocklyWrapper.wrapProperty('disableVariableEditing');
  blocklyWrapper.wrapProperty('FieldAngleDropdown');
  blocklyWrapper.wrapProperty('FieldAngleInput');
  blocklyWrapper.wrapProperty('FieldButton');
  blocklyWrapper.wrapProperty('FieldColour');
  blocklyWrapper.wrapProperty('FieldColourDropdown');
  blocklyWrapper.wrapProperty('FieldDropdown');
  blocklyWrapper.wrapProperty('FieldIcon');
  blocklyWrapper.wrapProperty('FieldImage');
  blocklyWrapper.wrapProperty('FieldImageDropdown');
  blocklyWrapper.wrapProperty('FieldLabel');
  blocklyWrapper.wrapProperty('FieldParameter');
  blocklyWrapper.wrapProperty('FieldRectangularDropdown');
  blocklyWrapper.wrapProperty('FieldTextInput');
  blocklyWrapper.wrapProperty('FieldVariable');
  blocklyWrapper.wrapProperty('findEmptyContainerBlock');
  blocklyWrapper.wrapProperty('fireUIEvent');
  blocklyWrapper.wrapProperty('Flyout');
  blocklyWrapper.wrapProperty('FunctionalBlockUtils');
  blocklyWrapper.wrapProperty('FunctionalTypeColors');
  blocklyWrapper.wrapProperty('FunctionEditor');
  blocklyWrapper.wrapProperty('functionEditor');
  blocklyWrapper.wrapProperty('Generator');
  blocklyWrapper.wrapProperty('getRelativeXY');
  blocklyWrapper.wrapProperty('hasCategories');
  blocklyWrapper.wrapProperty('HSV_SATURATION');
  blocklyWrapper.wrapProperty('inject');
  blocklyWrapper.wrapProperty('INPUT_VALUE');
  blocklyWrapper.wrapProperty('JavaScript');
  blocklyWrapper.wrapProperty('mainBlockSpace');
  blocklyWrapper.wrapProperty('mainBlockSpaceEditor');
  blocklyWrapper.wrapProperty('modalBlockSpace');
  blocklyWrapper.wrapProperty('Msg');
  blocklyWrapper.wrapProperty('Names');
  blocklyWrapper.wrapProperty('Procedures');
  blocklyWrapper.wrapProperty('removeChangeListener');
  blocklyWrapper.wrapProperty('RTL');
  blocklyWrapper.wrapProperty('showUnusedBlocks');
  blocklyWrapper.wrapProperty('SNAP_RADIUS');
  blocklyWrapper.wrapProperty('SVG_NS');
  blocklyWrapper.wrapProperty('typeHints');
  blocklyWrapper.wrapProperty('useContractEditor');
  blocklyWrapper.wrapProperty('useModalFunctionEditor');
  blocklyWrapper.wrapProperty('valueTypeTabShapeMap');
  blocklyWrapper.wrapProperty('Variables');
  blocklyWrapper.wrapProperty('Xml');

  return blocklyWrapper;
}

window.Blockly = initializeBlocklyWrapper();

module.exports = initializeBlocklyWrapper;
