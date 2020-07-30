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

  blocklyWrapper.wrapProperty('bindEvent_');
  blocklyWrapper.wrapProperty('Block');
  blocklyWrapper.wrapProperty('Blocks');
  blocklyWrapper.wrapProperty('BlockSpace');
  blocklyWrapper.wrapProperty('BlockSvg');
  blocklyWrapper.wrapProperty('BlockValueType');
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
  blocklyWrapper.wrapProperty('Flyout');
  blocklyWrapper.wrapProperty('FunctionalBlockUtils');
  blocklyWrapper.wrapProperty('FunctionalTypeColors');
  blocklyWrapper.wrapProperty('FunctionEditor');
  blocklyWrapper.wrapProperty('Generator');
  blocklyWrapper.wrapProperty('JavaScript');
  blocklyWrapper.wrapProperty('mainBlockSpace');
  blocklyWrapper.wrapProperty('mainBlockSpaceEditor');
  blocklyWrapper.wrapProperty('Names');
  blocklyWrapper.wrapProperty('Procedures');
  blocklyWrapper.wrapProperty('SVG_NS');
  blocklyWrapper.wrapProperty('Variables');
  blocklyWrapper.wrapProperty('Xml');

  return blocklyWrapper;
}

window.Blockly = initializeBlocklyWrapper();
