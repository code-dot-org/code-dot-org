// We need to use any in this class to generically reference the block type.
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Defines blocks useful in multiple blockly apps
 */

import {ObservableProcedureModel} from '@blockly/block-shareable-procedures';
import * as GoogleBlockly from 'blockly/core';
import {Order} from 'blockly/javascript';

import CdoFieldFlyout from '@cdo/apps/blockly/addons/cdoFieldFlyout';
import {getAddParameterButtonWithCallback} from '@cdo/apps/blockly/addons/cdoFieldParameter';
import CdoFieldToggle from '@cdo/apps/blockly/addons/cdoFieldToggle';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import {
  BlocklyWrapperType,
  ExtendedJavascriptGenerator,
  ProcedureBlock,
} from '@cdo/apps/blockly/types';
import {FALSEY_DEFAULT, readBooleanAttribute} from '@cdo/apps/blockly/utils';
import {SVG_NS} from '@cdo/apps/constants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

const mutatorProperties: string[] = [];

const INPUTS = {
  FLYOUT: 'flyout_input',
  STACK: 'STACK',
};

const PARAMETERS_LABEL = 'PARAMETERS_LABEL';

export const blocks = {
  installJoinBlock(blockly: BlocklyWrapperType) {
    // text_join is included with core Blockly. We register a custom text_join_mutator
    // which adds the plus/minus block UI.
    blockly.Blocks.text_join_simple = blockly.Blocks.text_join;
    blockly.JavaScript.forBlock.text_join_simple =
      blockly.JavaScript.forBlock.text_join;
  },
  // We need to use a custom block so that English users will see "random color".
  installCustomColourRandomBlock(blockly: BlocklyWrapperType) {
    delete blockly.Blocks['colour_random'];
    blockly.common.defineBlocks(
      blockly.common.createBlockDefinitionsFromJsonArray([
        {
          type: BLOCK_TYPES.colourRandom,
          message0: i18n.colourRandom(),
          output: 'Colour',
          style: 'colour_blocks',
        },
      ])
    );
  },
  copyBlockGenerator(
    generator: ExtendedJavascriptGenerator,
    type1: string,
    type2: string
  ) {
    generator.forBlock[type1] = generator.forBlock[type2];
  },
  defineNewBlockGenerator(
    generator: ExtendedJavascriptGenerator,
    type: string,
    generatorFunction: (
      block: GoogleBlockly.Block,
      generator: GoogleBlockly.CodeGenerator
    ) => [string, number] | string | null
  ) {
    generator.forBlock[type] = generatorFunction;
  },
  // For the next 4 functions, this is actually a Block.
  // However we are accessing its properties generically so we type it as a Record.
  mutationToDom(this: Record<string, any>) {
    const container = Blockly.utils.xml.createElement('mutation');
    mutatorProperties.forEach(prop => {
      if (this[prop]) {
        container.setAttribute(prop, this[prop]);
      }
    });
    return container;
  },
  domToMutation(this: Record<string, any>, mutationElement: Element) {
    Array.from(mutationElement.attributes).forEach(attr => {
      const attrName = attr.name;
      const attrValue = attr.value;

      const parsedInt = parseInt(attrValue);
      if (!isNaN(parsedInt)) {
        this[attrName] = parsedInt;
      } else if (
        attrValue.toLowerCase() === 'false' ||
        attrValue.toLowerCase() === 'true'
      ) {
        this[attrName] = readBooleanAttribute(mutationElement, attrName);
      } else {
        this[attrName] = attrValue;
      }
      mutatorProperties.indexOf(attrName) === -1 &&
        mutatorProperties.push(attrName);
    });
  },
  saveExtraState(this: Record<string, any>) {
    const state: Record<string, any> = {};
    mutatorProperties.forEach(prop => {
      if (this[prop]) {
        state[prop] = this[prop];
      }
    });
    return state;
  },
  loadExtraState(this: Record<string, any>, state: Record<string, any>) {
    for (const prop in state) {
      this[prop] = state[prop];
      mutatorProperties.indexOf(prop) === -1 && mutatorProperties.push(prop);
    }
  },
  // Global function to handle serialization hooks
  addSerializationHooksToBlock(block: GoogleBlockly.Block) {
    if (!block.mutationToDom) {
      block.mutationToDom = this.mutationToDom;
    }
    if (!block.domToMutation) {
      block.domToMutation = this.domToMutation;
    }
    if (!block.saveExtraState) {
      block.saveExtraState = this.saveExtraState;
    }
    if (!block.loadExtraState) {
      block.loadExtraState = this.loadExtraState;
    }
  },
  // Copied and modified from core Blockly:
  // https://github.com/google/blockly/blob/1ba0e55e8a61f4228dfcc4d0eb18b7e38666dc6c/generators/javascript/math.ts#L406-L429
  // We need to override this generator in order to continue using the
  // legacy function name from CDO Blockly. Other custom blocks in pools
  // depend on the original name..
  mathRandomIntGenerator(
    block: GoogleBlockly.Block,
    generator: ExtendedJavascriptGenerator
  ) {
    // Random integer between [X] and [Y].
    const argument0 = generator.valueToCode(block, 'FROM', Order.NONE) || '0';
    const argument1 = generator.valueToCode(block, 'TO', Order.NONE) || '0';
    const functionName = generator.provideFunction_(
      'math_random_int', // Core Blockly uses 'mathRandomInt'
      `
  function ${generator.FUNCTION_NAME_PLACEHOLDER_}(a, b) {
    if (a > b) {
      // Swap a and b to ensure a is smaller.
      var c = a;
      a = b;
      b = c;
    }
    return Math.floor(Math.random() * (b - a + 1) + a);
  }
  `
    );
    const code = `${functionName}(${argument0}, ${argument1})`;
    return [code, Order.FUNCTION_CALL];
  },
  // Creates and returns a 3-column colour field with an increased height/width
  // for menu options and the field itself. Used for the K1 Artist colour picker block.
  getColourDropdownField(colours: string[]) {
    const configOptions = {
      colourOptions: colours,
      columns: 3,
    };
    const defaultColour = colours[0];
    const optionalValidator = undefined;
    const isK1 = true;
    return new Blockly.FieldColour(
      defaultColour,
      optionalValidator,
      configOptions,
      isK1
    );
  },
  // Creates and returns a toggle button field. This field should be
  // added to the block after other inputs have been created.
  // miniToolboxBlocks is a backwards-compatible parameter used in CDO Blockly.
  initializeMiniToolbox(
    _miniToolboxBlocks: string[],
    renderToolboxBeforeStack = false
  ) {
    // Function to create the flyout
    const createFlyoutField = function (block: GoogleBlockly.Block) {
      const flyoutKey = CdoFieldFlyout.getFlyoutId(block);
      const flyoutField = new Blockly.FieldFlyout('', {
        flyoutKey: flyoutKey,
        name: 'FLYOUT',
      });

      const newDummyInput = block.appendDummyInput(INPUTS.FLYOUT);
      if (block.type === BLOCK_TYPES.procedureDefinition) {
        newDummyInput.appendField(i18n.parameters(), PARAMETERS_LABEL);
      }
      newDummyInput.appendField(flyoutField, flyoutKey);
      // By default, the flyout is added after the stack input (at the bottom of the block).
      // This flag is used by behavior and function definitions, mainly in the modal function editor,
      // to add the flyout before the stack input (at the top of the block).
      if (
        renderToolboxBeforeStack &&
        block.getInput(INPUTS.FLYOUT) &&
        block.getInput(INPUTS.STACK)
      ) {
        block.moveInputBefore(INPUTS.FLYOUT, INPUTS.STACK);
      }
      return flyoutField;
    };

    // Function to toggle the flyout visibility, which actually creates or
    // deletes the flyout depending on the current visibility.
    const toggleFlyout = function (this: CdoFieldToggle) {
      const block = this.getSourceBlock();
      if (!block) {
        return;
      }
      if (!block.getInput(INPUTS.FLYOUT)) {
        const flyoutField = createFlyoutField(block);
        flyoutField.showEditor();
      } else {
        block.removeInput(INPUTS.FLYOUT);
      }
    };

    const defaultIcon = document.createElementNS(SVG_NS, 'tspan');
    defaultIcon.style.fontFamily = 'FontAwesome';
    defaultIcon.textContent = '\uf067 '; // plus icon

    const alternateIcon = document.createElementNS(SVG_NS, 'tspan');
    alternateIcon.style.fontFamily = 'FontAwesome';
    alternateIcon.textContent = '\uf068 '; // minus icon

    const colorOverrides = {
      icon: Button.ButtonColor.white,
      button: Button.ButtonColor.blue,
    };

    const flyoutToggleButton = new Blockly.FieldToggle({
      onClick: toggleFlyout,
      defaultIcon,
      alternateIcon,
      useDefaultIcon: true,
      callback: createFlyoutField,
      colorOverrides,
    });

    return flyoutToggleButton;
  },

  // Adds a toggle button field to a block. Requires other inputs to already exist.
  appendMiniToolboxToggle(
    this: GoogleBlockly.Block,
    miniToolboxBlocks: string[],
    flyoutToggleButton: CdoFieldToggle,
    renderingInFunctionEditor = false
  ) {
    // In the function editor, this call prevents a dummy input from being used as a
    // row separator between the function definition in the mini-toolbox.
    this.setInputsInline(true);

    // We set the inputs to align left so that if the flyout is larger than the
    // inputs will be aligned with the left edge of the block.
    this.inputList.forEach(input => {
      input.setAlign(Blockly.ALIGN_LEFT);
    });

    // Insert the toggle field at the beginning for the first input row.
    const firstInput = this.inputList[0];
    firstInput.insertFieldAt(0, flyoutToggleButton, `button_${this.type}`);

    // These blocks require a renderer that treats dummy inputs like row separators:
    // https://github.com/google/blockly-samples/tree/master/plugins/renderer-inline-row-separators
    const lastInput = this.inputList[this.inputList.length - 1];
    // Force add a dummy input at the end of the block, if needed.
    if (
      ![Blockly.inputTypes.END_ROW, Blockly.inputTypes.STATEMENT].includes(
        lastInput.type
      )
    ) {
      this.appendEndRowInput();
    }

    if (this.workspace.rendered) {
      (
        this.workspace as GoogleBlockly.WorkspaceSvg
      ).registerToolboxCategoryCallback(
        CdoFieldFlyout.getFlyoutId(this),
        () => {
          const blocks: GoogleBlockly.utils.toolbox.FlyoutItemInfoArray = [];
          miniToolboxBlocks.forEach(blockType => {
            const block: GoogleBlockly.utils.toolbox.BlockInfo = {
              kind: 'block',
              type: blockType,
            };
            // The function editor toolbox doesn't need to track its parent.
            if (!renderingInFunctionEditor) {
              block.extraState = {
                imageSourceId: this.id,
              };
            }
            if (blockType === BLOCK_TYPES.parametersGet) {
              // Set up the "new parameter" button in the mini-toolbox
              const newParamButton = getAddParameterButtonWithCallback(
                this.workspace as GoogleBlockly.WorkspaceSvg,
                (
                  this as ProcedureBlock
                ).getProcedureModel() as ObservableProcedureModel
              );
              blocks.push(newParamButton);
              const parameters = (this as ProcedureBlock)
                .getProcedureModel()
                .getParameters();
              parameters.forEach(parameter => {
                blocks.push({
                  ...block,
                  fields: {
                    VAR: {
                      name: parameter.getName(),
                      type: '',
                    },
                  },
                });
              });
            } else {
              blocks.push(block);
            }
          });
          return blocks;
        }
      );
    }

    // Blockly mutators are extensions add custom serialization to a block.
    // Serialize the state of the toggle icon to determine whether a
    // flyout field is needed immediately upon loading the block.
    // If we're just rendering the block in the function editor, we don't
    // need to serialize the state.
    if (renderingInFunctionEditor) {
      return;
    }

    // JSON serialization hooks
    this.saveExtraState = function () {
      // Ex. Add {"extraState": {"useDefaultIcon": false}} to block JSON
      return {
        useDefaultIcon: flyoutToggleButton.useDefaultIcon,
      };
    };
    this.loadExtraState = function (state) {
      const useDefaultIcon = state['useDefaultIcon'];
      flyoutToggleButton.setIcon(useDefaultIcon);
    };

    // XML serialization hooks
    this.mutationToDom = function () {
      const container = Blockly.utils.xml.createElement('mutation');
      // Ex. add <mutation useDefaultIcon="false"/> to block XML
      container.setAttribute(
        'useDefaultIcon',
        `${flyoutToggleButton.useDefaultIcon}`
      );
      return container;
    };
    this.domToMutation = function (xmlElement) {
      const useDefaultIcon =
        // Assume default icon if no XML attribute present
        !xmlElement.hasAttribute('useDefaultIcon') ||
        // Coerce string to Boolean
        readBooleanAttribute(xmlElement, 'useDefaultIcon', FALSEY_DEFAULT);
      flyoutToggleButton.setIcon(useDefaultIcon);
    };
  },
};
