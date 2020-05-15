var BlocklyWrapper = function(blocklyInstance) {
  this.blockly_ = blocklyInstance;
  this.Msg = blocklyInstance.Msg;
  this.inject = this.blockly_.inject;
  this.bindEvent_ = this.blockly_.bindEvent_;

  // Blockspace
  this.getMainBlockSpace = () => this.blockly_.mainBlockSpace;
  this.getMainBlockSpaceEditor = () => this.blockly_.mainBlockSpaceEditor;
  this.SVG_NS = this.blockly_.SVG_NS;
  this.BlockSvg = this.blockly_.BlockSvg;
  this.Block = this.blockly_.Block;
  this.Blocks = this.blockly_.Blocks;
  this.Xml = this.blockly_.Xml;
  this.BlockSpace = this.blockly_.BlockSpace;
  this.findEmptyContainerBlock = this.blockly_.findEmptyContainerBlock;
  this.getReadOnly = () => this.blockly_.readOnly;
  this.setReadOnly = readOnly => (this.blockly_.readOnly = readOnly);

  // Code Generation
  this.Procedures = this.blockly_.Procedures;
  this.Names = this.blockly_.Names;
  this.Generator = this.blockly_.Generator;
  this.Variables = this.blockly_.Variables;
  this.JavaScript = this.blockly_.JavaScript;

  // Fields
  this.BlockFieldHelper = this.blockly_.BlockFieldHelper;
  this.BlockValueType = this.blockly_.BlockValueType;
  this.FieldAngleDropdown = this.blockly_.FieldAngleDropdown;
  this.FieldAngleInput = this.blockly_.FieldAngleInput;
  this.FieldButton = this.blockly_.FieldButton;
  this.FieldColourDropdown = this.blockly_.FieldColourDropdown;
  this.FieldColour = this.blockly_.FieldColour;
  this.FieldDropdown = this.blockly_.FieldDropdown;
  this.FieldIcon = this.blockly_.FieldIcon;
  this.FieldLabel = this.blockly_.FieldLabel;
  this.FieldParameter = this.blockly_.FieldParameter;
  this.FieldRectangularDropdown = this.blockly_.FieldRectangularDropdown;
  this.FieldTextInput = this.blockly_.FieldTextInput;
  this.FieldVariable = this.blockly_.FieldVariable;
  this.Flyout = this.blockly_.Flyout;

  // CS in A
  this.FunctionalBlockUtils = this.blockly_.FunctionalBlockUtils;
  this.FunctionalTypeColors = this.blockly_.FunctionalTypeColors;
  this.contractEditor = this.blockly_.contractEditor;
};
module.exports = BlocklyWrapper;
