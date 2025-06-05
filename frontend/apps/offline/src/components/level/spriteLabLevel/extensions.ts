import * as Blockly from 'blockly/core';

import type {ProcedureBlock, Environment} from '@/blockly/types';

import BlockSvgFrame from './BlockSvgFrame';
import type {FieldSpriteDropdown} from './fields/fieldSpriteDropdown';
import type {SpriteLabLevelEnvironment} from './SpriteLabLevel';

const isStartMode = () => {
  return true;
};

export const behaviorsBlockFrame = {
  name: 'behaviors_block_frame',
  extension: function (this: Blockly.BlockSvg, environment: Environment) {
    const spriteLabEnvironment = environment as SpriteLabLevelEnvironment;
    let functionalSvg: BlockSvgFrame | null = null;

    if (
      this.workspace === spriteLabEnvironment.mainWorkspace &&
      !spriteLabEnvironment.noFunctionBlockFrame
    ) {
      // Used to create and render an SVG frame instance.
      const getColor = () => {
        return this.style?.colourPrimary;
      };
      functionalSvg = new BlockSvgFrame(
        this,
        'Behavior',
        'blocklyFunctionalFrame',
        getColor,
      );

      this.setOnChange(function (this: Blockly.BlockSvg) {
        if (!this.isInFlyout) {
          functionalSvg?.render();
        }
      });
    }
  },
};

export const behaviorsNameValidator = {
  name: 'behaviors_name_validator',
  extension: function (this: Blockly.BlockSvg) {
    const nameField = this.getField('NAME');
    nameField?.setValidator(function (this: Blockly.Field<string>, newValue) {
      // The default validator provided by mainline Blockly. Strips whitespace.
      const rename = Blockly.Procedures.rename.bind(this);
      const legalName = rename(newValue);
      console.log('rename', legalName, newValue);
      const sourceBlock = this.sourceBlock_ as ProcedureBlock & {
        behaviorId: string;
      };
      if (legalName && isStartMode() && sourceBlock.behaviorId !== legalName) {
        sourceBlock.behaviorId = legalName;
      }
      return legalName;
    });
  },
};

export const modalProceduresNoDestroy = {
  name: 'modal_procedures_no_destroy',
  extension: function (this: Blockly.BlockSvg, environment: Environment) {
    const spriteLabEnvironment = environment as SpriteLabLevelEnvironment;
    const originalDestroy = this.destroy?.bind(this);
    const mixin = {
      destroy: function (this: ProcedureBlock) {
        if (
          !spriteLabEnvironment.useModalFunctionEditor &&
          !this.isInsertionMarker()
        ) {
          originalDestroy?.();
        }
      },
    };
    // We can't register this as a mixin since we're overwriting existing methods
    Object.assign(this, mixin);
  },
};

export const spritesFromStartAnimations = {
  name: 'sprites_from_start_animations',
  extension: function (this: Blockly.BlockSvg, environment: Environment) {
    const spriteLabEnvironment = environment as SpriteLabLevelEnvironment;
    const dropdownField = (this.getField('ANIMATION') ||
      this.getField('ANIMATION_NAME')) as FieldSpriteDropdown;
    if (dropdownField) {
      dropdownField.setOptions(environment.animations || [['', '']]);
      console.log(
        'OK',
        this,
        dropdownField,
        dropdownField.getValue(),
        spriteLabEnvironment,
        dropdownField.getOptions(),
      );
      const newValue = dropdownField.getOptions(false)[0][1];
      dropdownField.setValue(newValue);
      console.log(
        'OK',
        dropdownField,
        dropdownField.getValue(),
        spriteLabEnvironment,
        dropdownField.getOptions(),
        newValue,
      );
    }
  },
};
