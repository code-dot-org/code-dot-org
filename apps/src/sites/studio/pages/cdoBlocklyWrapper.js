const BlocklyWrapper = function(blocklyInstance) {
  this.blockly_ = blocklyInstance;
  this.Msg = this.blockly_.Msg;
  this.inject = this.blockly_.inject;
  this.wrapReadOnlyProperty = function(propertyName) {
    Object.defineProperty(this, propertyName, {
      get: function() {
        return this.blockly_[propertyName];
      }
    });
    this.wrapSettableProperty = function(propertyName) {
      Object.defineProperty(this, propertyName, {
        get: function() {
          return this.blockly_[propertyName];
        },
        set: function(newValue) {
          this.blockly_[propertyName] = newValue;
        }
      });
    };
  };
};

function initializeBlocklyWrapper(blocklyInstance) {
  const blocklyWrapper = new BlocklyWrapper(blocklyInstance);

  blocklyWrapper.wrapReadOnlyProperty('ALIGN_CENTRE');
  blocklyWrapper.wrapReadOnlyProperty('ALIGN_LEFT');
  blocklyWrapper.wrapReadOnlyProperty('ALIGN_RIGHT');
  blocklyWrapper.wrapReadOnlyProperty('applab_locale');
  blocklyWrapper.wrapReadOnlyProperty('bindEvent_');
  blocklyWrapper.wrapReadOnlyProperty('Block');
  blocklyWrapper.wrapReadOnlyProperty('BlockFieldHelper');
  blocklyWrapper.wrapReadOnlyProperty('Blocks');
  blocklyWrapper.wrapReadOnlyProperty('BlockSpace');
  blocklyWrapper.wrapReadOnlyProperty('BlockSvg');
  blocklyWrapper.wrapReadOnlyProperty('BlockValueType');
  blocklyWrapper.wrapReadOnlyProperty('common_locale');
  blocklyWrapper.wrapReadOnlyProperty('Connection');
  blocklyWrapper.wrapReadOnlyProperty('contractEditor');
  blocklyWrapper.wrapReadOnlyProperty('createSvgElement');
  blocklyWrapper.wrapReadOnlyProperty('Css');
  blocklyWrapper.wrapReadOnlyProperty('disableVariableEditing');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleTextInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldButton');
  blocklyWrapper.wrapReadOnlyProperty('FieldColour');
  blocklyWrapper.wrapReadOnlyProperty('FieldColourDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldIcon');
  blocklyWrapper.wrapReadOnlyProperty('FieldImage');
  blocklyWrapper.wrapReadOnlyProperty('FieldImageDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldLabel');
  blocklyWrapper.wrapReadOnlyProperty('FieldParameter');
  blocklyWrapper.wrapReadOnlyProperty('FieldRectangularDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldTextInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldVariable');
  blocklyWrapper.wrapReadOnlyProperty('findEmptyContainerBlock');
  blocklyWrapper.wrapReadOnlyProperty('fireUiEvent');
  blocklyWrapper.wrapReadOnlyProperty('fish_locale');
  blocklyWrapper.wrapReadOnlyProperty('Flyout');
  blocklyWrapper.wrapReadOnlyProperty('FunctionalBlockUtils');
  blocklyWrapper.wrapReadOnlyProperty('FunctionalTypeColors');
  blocklyWrapper.wrapReadOnlyProperty('FunctionEditor');
  blocklyWrapper.wrapReadOnlyProperty('functionEditor');
  blocklyWrapper.wrapReadOnlyProperty('gamelab_locale');
  blocklyWrapper.wrapReadOnlyProperty('Generator');
  blocklyWrapper.wrapReadOnlyProperty('getRelativeXY');
  blocklyWrapper.wrapReadOnlyProperty('googlecode');
  blocklyWrapper.wrapReadOnlyProperty('hasCategories');
  blocklyWrapper.wrapReadOnlyProperty('html');
  blocklyWrapper.wrapReadOnlyProperty('inject');
  blocklyWrapper.wrapReadOnlyProperty('INPUT_VALUE');
  blocklyWrapper.wrapReadOnlyProperty('js');
  blocklyWrapper.wrapReadOnlyProperty('mainBlockSpace');
  blocklyWrapper.wrapReadOnlyProperty('mainBlockSpaceEditor');
  blocklyWrapper.wrapReadOnlyProperty('modalBlockSpace');
  blocklyWrapper.wrapReadOnlyProperty('Msg');
  blocklyWrapper.wrapReadOnlyProperty('Names');
  blocklyWrapper.wrapReadOnlyProperty('netsim_locale');
  blocklyWrapper.wrapReadOnlyProperty('Procedures');
  blocklyWrapper.wrapReadOnlyProperty('removeChangeListener');
  blocklyWrapper.wrapReadOnlyProperty('RTL');
  blocklyWrapper.wrapReadOnlyProperty('SVG_NS');
  blocklyWrapper.wrapReadOnlyProperty('tutorialExplorer_locale');
  blocklyWrapper.wrapReadOnlyProperty('useContractEditor');
  blocklyWrapper.wrapReadOnlyProperty('useModalFunctionEditor');
  blocklyWrapper.wrapReadOnlyProperty('Variables');
  blocklyWrapper.wrapReadOnlyProperty('weblab_locale');
  blocklyWrapper.wrapReadOnlyProperty('Xml');

  blocklyWrapper.wrapSettableProperty('assetUrl');
  blocklyWrapper.wrapSettableProperty('behaviorEditor');
  blocklyWrapper.wrapSettableProperty('BROKEN_CONTROL_POINTS');
  blocklyWrapper.wrapSettableProperty('BUMP_UNCONNECTED');
  blocklyWrapper.wrapSettableProperty('HSV_SATURATION');
  blocklyWrapper.wrapSettableProperty('JavaScript');
  blocklyWrapper.wrapSettableProperty('readOnly');
  blocklyWrapper.wrapSettableProperty('showUnusedBlocks');
  blocklyWrapper.wrapSettableProperty('SNAP_RADIUS');
  blocklyWrapper.wrapSettableProperty('typeHints');
  blocklyWrapper.wrapSettableProperty('valueTypeTabShapeMap');

  return blocklyWrapper;
}

module.exports = initializeBlocklyWrapper;
