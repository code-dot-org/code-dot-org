import {ObservableProcedureModel} from '@blockly/block-shareable-procedures';
import * as BlocklyCore from 'blockly/core';

import CdoFieldFlyout from '@cdo/apps/blockly/addons/cdoFieldFlyout';
import {getAddParameterButtonWithCallback} from '@cdo/apps/blockly/addons/cdoFieldParameter';
import CdoFieldToggle from '@cdo/apps/blockly/addons/cdoFieldToggle';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import {ProcedureBlock} from '@cdo/apps/blockly/types';
import {SVG_NS} from '@cdo/apps/constants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

import {readBooleanAttribute, FALSEY_DEFAULT} from '../xml/booleanAttributes';

const INPUTS = {
  FLYOUT: 'flyout_input',
  STACK: 'STACK',
};

const PARAMETERS_LABEL = 'PARAMETERS_LABEL';

// Creates and returns a toggle button field. This field should be
// added to the block after other inputs have been created.
// miniToolboxBlocks is a backwards-compatible parameter used in CDO Blockly.
export function initializeMiniToolbox(renderToolboxBeforeStack = false) {
  // Function to create the flyout
  const createFlyoutField = function (block: BlocklyCore.Block) {
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
}

// Adds a toggle button field to a block. Requires other inputs to already exist.
export function appendMiniToolboxToggle(
  parentBlock: BlocklyCore.Block,
  miniToolboxBlocks: string[],
  flyoutToggleButton: CdoFieldToggle,
  renderingInFunctionEditor = false
) {
  // In the function editor, this call prevents a dummy input from being used as a
  // row separator between the function definition in the mini-toolbox.
  parentBlock.setInputsInline(true);

  // We set the inputs to align left so that if the flyout is larger than the
  // inputs will be aligned with the left edge of the block.
  parentBlock.inputList.forEach(input => {
    input.setAlign(Blockly.ALIGN_LEFT);
  });

  // Insert the toggle field at the beginning for the first input row.
  const firstInput = parentBlock.inputList[0];
  firstInput.insertFieldAt(0, flyoutToggleButton, `button_${parentBlock.type}`);

  // These blocks require a renderer that treats dummy inputs like row separators:
  // https://github.com/google/blockly-samples/tree/master/plugins/renderer-inline-row-separators
  const lastInput = parentBlock.inputList[parentBlock.inputList.length - 1];
  // Force add a dummy input at the end of the block, if needed.
  if (
    ![Blockly.inputTypes.END_ROW, Blockly.inputTypes.STATEMENT].includes(
      lastInput.type
    )
  ) {
    parentBlock.appendEndRowInput();
  }

  if (parentBlock.workspace.rendered) {
    (
      parentBlock.workspace as BlocklyCore.WorkspaceSvg
    ).registerToolboxCategoryCallback(
      CdoFieldFlyout.getFlyoutId(parentBlock),
      () => {
        const blocks: BlocklyCore.utils.toolbox.FlyoutItemInfoArray = [];
        miniToolboxBlocks.forEach(blockType => {
          const block: BlocklyCore.utils.toolbox.BlockInfo = {
            kind: 'block',
            type: blockType,
          };
          // The function editor toolbox doesn't need to track its parent.
          if (!renderingInFunctionEditor) {
            block.extraState = {
              imageSourceId: parentBlock.id,
            };
          }
          if (blockType === BLOCK_TYPES.parametersGet) {
            // Set up the "new parameter" button in the mini-toolbox
            const newParamButton = getAddParameterButtonWithCallback(
              parentBlock.workspace as BlocklyCore.WorkspaceSvg,
              (
                parentBlock as ProcedureBlock
              ).getProcedureModel() as ObservableProcedureModel
            );
            blocks.push(newParamButton);
            const parameters = (parentBlock as ProcedureBlock)
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
  parentBlock.saveExtraState = function () {
    // Ex. Add {"extraState": {"useDefaultIcon": false}} to block JSON
    return {
      useDefaultIcon: flyoutToggleButton.useDefaultIcon,
    };
  };
  parentBlock.loadExtraState = function (state) {
    const useDefaultIcon = state['useDefaultIcon'];
    flyoutToggleButton.setIcon(useDefaultIcon);
  };

  // XML serialization hooks
  parentBlock.mutationToDom = function () {
    const container = Blockly.utils.xml.createElement('mutation');
    // Ex. add <mutation useDefaultIcon="false"/> to block XML
    container.setAttribute(
      'useDefaultIcon',
      `${flyoutToggleButton.useDefaultIcon}`
    );
    return container;
  };
  parentBlock.domToMutation = function (xmlElement) {
    const useDefaultIcon =
      // Assume default icon if no XML attribute present
      !xmlElement.hasAttribute('useDefaultIcon') ||
      // Coerce string to Boolean
      readBooleanAttribute(xmlElement, 'useDefaultIcon', FALSEY_DEFAULT);
    flyoutToggleButton.setIcon(useDefaultIcon);
  };
}
