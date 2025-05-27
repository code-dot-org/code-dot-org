import * as Blockly from 'blockly/core';

const isStartMode = () => {
  return true;
};

export const behaviorsBlockFrame = {
  name: 'behaviors_block_frame',
  extension: function (this: Blockly.Block) {
    if (
      this.workspace === Blockly.getMainWorkspace() &&
      !this.workspace.noFunctionBlockFrame
    ) {
      // Used to create and render an SVG frame instance.
      const getColor = () => {
        return this.style?.colourPrimary;
      };
      this.functionalSvg_ = new BlockSvgFrame(
        this,
        commonI18n.behaviorEditorHeader(),
        'blocklyFunctionalFrame',
        getColor,
      );

      this.setOnChange(function (this: ExtendedBlockSvg) {
        if (!this.isInFlyout) {
          this.functionalSvg_?.render();
        }
      });
    }
  },
};

export const behaviorsNameValidator = {
  name: 'behaviors_name_validator',
  extension: function (this: Blockly.Block) {
    const nameField = this.getField('NAME');
    nameField?.setValidator(function (this: Blockly.Field<string>, newValue) {
      // The default validator provided by mainline Blockly. Strips whitespace.
      const rename = Blockly.Procedures.rename.bind(this);
      console.log('rename', rename, newValue);
      const legalName = rename(newValue);
      const sourceBlock = this.sourceBlock_ as ProcedureBlock;
      if (legalName && isStartMode() && sourceBlock.behaviorId !== legalName) {
        sourceBlock.behaviorId = legalName;
      }
      return legalName;
    });
  },
};
