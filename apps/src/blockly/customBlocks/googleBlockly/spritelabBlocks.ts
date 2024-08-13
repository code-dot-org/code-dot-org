import {ObservableProcedureModel} from '@blockly/block-shareable-procedures';
import {Block, Field, WorkspaceSvg} from 'blockly';
import {Abstract} from 'blockly/core/events/events_abstract';
import {BlockChange} from 'blockly/core/events/events_block_change';
import {BlockCreate} from 'blockly/core/events/events_block_create';
import {BlockDrag} from 'blockly/core/events/events_block_drag';
import {BlockInfo, FlyoutItemInfoArray} from 'blockly/core/utils/toolbox';

import CdoFieldDropdown from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import CdoFieldFlyout from '@cdo/apps/blockly/addons/cdoFieldFlyout';
import CdoFieldImage from '@cdo/apps/blockly/addons/cdoFieldImage';
import {getAddParameterButtonWithCallback} from '@cdo/apps/blockly/addons/cdoFieldParameter';
import CdoFieldToggle from '@cdo/apps/blockly/addons/cdoFieldToggle';
import {updatePointerBlockImage} from '@cdo/apps/blockly/addons/cdoSpritePointer';
import {BLOCK_TYPES, NO_OPTIONS_MESSAGE} from '@cdo/apps/blockly/constants';
import {ExtendedBlockSvg, ProcedureBlock} from '@cdo/apps/blockly/types';
import {FALSEY_DEFAULT, readBooleanAttribute} from '@cdo/apps/blockly/utils';
import {SVG_NS} from '@cdo/apps/constants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {spriteLabPointers} from '@cdo/apps/p5lab/spritelab/blockly/constants';
import {commonI18n} from '@cdo/apps/types/locale';
import {getAlphanumericId} from '@cdo/apps/utils';

import {blocks as behaviorBlocks} from './behaviorBlocks';
import {
  editButtonHandler,
  toolboxConfigurationSupportsEditButton,
} from './proceduresBlocks';

const INPUTS = {
  FLYOUT: 'flyout_input',
  STACK: 'STACK',
};

// This file contains customizations to Google Blockly Sprite Lab blocks.
export const blocks = {
  // Creates and returns a toggle button field. This field should be
  // added to the block after other inputs have been created.
  // miniToolboxBlocks is a backwards-compatible parameter used in CDO Blockly.
  initializeMiniToolbox(
    _miniToolboxBlocks: string[],
    renderToolboxBeforeStack = false
  ) {
    // Function to create the flyout
    const createFlyoutField = function (block: Block) {
      const flyoutKey = CdoFieldFlyout.getFlyoutId(block);
      const flyoutField = new Blockly.FieldFlyout('', {
        flyoutKey: flyoutKey,
        name: 'FLYOUT',
      });

      block.appendDummyInput(INPUTS.FLYOUT).appendField(flyoutField, flyoutKey);
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
    this: Block,
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
      input.setAlign(Blockly.Input.Align.LEFT);
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
      (this.workspace as WorkspaceSvg).registerToolboxCategoryCallback(
        CdoFieldFlyout.getFlyoutId(this),
        () => {
          const blocks: FlyoutItemInfoArray = [];
          miniToolboxBlocks.forEach(blockType => {
            const block: BlockInfo = {
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
                this.workspace as WorkspaceSvg,
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

  // Set up this block to shadow a image source block's image, if needed. This will also
  // deserialize the image source id from the block configuration, if it exists.
  setUpBlockShadowing(this: ExtendedBlockSvg) {
    // We only set up block shadowing for blocks that have a type in spriteLabPointers.
    if (Object.keys(spriteLabPointers).includes(this.type)) {
      // saveExtraState is used to serialize the image source block ID.
      this.saveExtraState = function () {
        return {
          imageSourceId: this.imageSourceId,
        };
      };

      // loadExtraState is used to deserialize the image source block ID.
      // We use this id to set the initial pointer block image.
      this.loadExtraState = function (state) {
        this.imageSourceId = state['imageSourceId'];
        if (this.imageSourceId) {
          updatePointerBlockImage(this, spriteLabPointers, this.imageSourceId);
          const imageSourceBlock = Blockly.getMainWorkspace()?.getBlockById(
            this.imageSourceId
          );
          if (imageSourceBlock) {
            const imageSourceBlockWorkspace = imageSourceBlock.workspace;
            imageSourceBlockWorkspace.addChangeListener(event => {
              onBlockImageSourceChange(event, this);
            });
          }
        }
      };

      // When the block's parent workspace changes, we check to see if
      // we need to update the shadowed block image.
      this.onchange = function (event) {
        onBlockImageSourceChange(event, this);
      };
    }
  },

  installBehaviorBlocks() {
    Blockly.common.defineBlocks(behaviorBlocks);

    const generator = Blockly.getGenerator();
    generator.behavior_definition = function (block: ProcedureBlock) {
      // If we don't have a behavior id, generate a random id.
      // This ensures the hidden definition block will generate valid code.
      if (!block.behaviorId) {
        block.behaviorId = getAlphanumericId();
      }
      // Define a procedure with a return value.
      const funcName = generator.nameDB_.getName(
        block.behaviorId,
        Blockly.Names.NameType.PROCEDURE
      );

      // Holds the additional code that is prefixed (injected before every statement) and/or
      // suffixed (injected after every statement) to the main block of code
      let xfix1 = '';
      if (generator.STATEMENT_PREFIX) {
        xfix1 += generator.injectId(generator.STATEMENT_PREFIX, block);
      }
      if (generator.STATEMENT_SUFFIX) {
        xfix1 += generator.injectId(generator.STATEMENT_SUFFIX, block);
      }
      if (xfix1) {
        xfix1 = generator.prefixLines(xfix1, generator.INDENT);
      }
      let loopTrap = '';
      if (generator.INFINITE_LOOP_TRAP) {
        loopTrap = generator.prefixLines(
          generator.injectId(generator.INFINITE_LOOP_TRAP, block),
          generator.INDENT
        );
      }

      // Translate all the inner blocks within the current block into code
      const branch = generator.statementToCode(block, 'STACK');
      let returnValue =
        generator.valueToCode(block, 'RETURN', generator.ORDER_NONE) || '';

      // Contains the same code as xfix1 if both are present, but applied before the return statement
      let xfix2 = '';
      if (branch && returnValue) {
        xfix2 = xfix1;
      }
      if (returnValue) {
        returnValue = generator.INDENT + 'return ' + returnValue + ';\n';
      }
      const args = [];
      args.push(
        generator.nameDB_.getName(
          commonI18n.thisSprite(),
          Blockly.Names.NameType.VARIABLE
        )
      );
      const variables = block.getVars();
      for (let i = 0; i < variables.length; i++) {
        args[i] = generator.nameDB_.getName(
          variables[i],
          Blockly.Names.NameType.VARIABLE
        );
      }
      let code =
        'function ' +
        funcName +
        '(' +
        args.join(', ') +
        ') {\n' +
        xfix1 +
        loopTrap +
        branch +
        xfix2 +
        returnValue +
        '}';
      code = generator.scrub_(block, code);
      // Add % so as not to collide with helper functions in definitions list.
      generator.definitions_['%' + funcName] = code;
      return null;
    };
    generator.gamelab_behavior_get = function () {
      // Generating 'undefined' mimics the code for a missing block.
      const undefinedCode = ['undefined', generator.ORDER_ATOMIC];
      // If we don't have a behavior Id, find on the definition block.
      if (!this.behaviorId) {
        const procedureModel = this.getProcedureModel();
        // If there's no model, fail gracefully.
        if (!procedureModel) {
          return undefinedCode;
        }
        const definitionBlock = Blockly.Procedures.getDefinition(
          procedureModel.name,
          Blockly.getHiddenDefinitionWorkspace()
        ) as ProcedureBlock;
        this.behaviorId = definitionBlock?.behaviorId;
        // If we somehow still don't have a behavior id, fail gracefully.
        if (!this.behaviorId) {
          return undefinedCode;
        }
      }
      const name = generator.nameDB_.getName(this.behaviorId, 'PROCEDURE');
      return [`new Behavior(${name}, [])`, generator.ORDER_ATOMIC];
    };
    generator.forBlock.sprite_parameter_get = generator.forBlock.variables_get;
  },

  // All logic for behavior picker custom input type
  addBehaviorPickerEditButton(
    block: ProcedureBlock,
    inputConfig: {name: string; label: string},
    _currentInputRow: Field,
    dropdownField: CdoFieldDropdown
  ) {
    const behaviorsFound =
      dropdownField.getOptions().length > 1 ||
      dropdownField.getOptions()[0][1] !== NO_OPTIONS_MESSAGE;

    // Behavior editing is only permitted using the modal function editor.
    if (
      behaviorsFound &&
      Blockly.useModalFunctionEditor &&
      // TODO: Support editing behaviors from within a modal editor workspace.
      block.workspace.id === Blockly.getMainWorkspace().id &&
      toolboxConfigurationSupportsEditButton(block)
    ) {
      const editButton = new Blockly.FieldButton({
        value: commonI18n.edit(),
        onClick: editButtonHandler,
        colorOverrides: {button: 'blue', text: 'white'},
        allowReadOnlyClick: true, // We support showing the editor even if viewing in read only mode.
      });
      block.inputList[block.inputList.length - 1].appendField(
        editButton,
        'EDIT'
      );
      // getProcedureModel is defined on procedure blocks as part of
      // @blockly/block-shareable-procedures
      // For this block, we will get the procedure based on selected
      // dropdown field option.
      block.getProcedureModel = function () {
        const fieldValue = block.getFieldValue(inputConfig.name);
        const procedureMap = block.workspace.getProcedureMap();
        let procedure = undefined;
        for (const value of procedureMap.values()) {
          if (value.getName() === fieldValue) {
            procedure = value;
            break;
          }
        }
        // We should always find the procedure in the map.
        return procedure!;
      };
    }
  },
  // Get a list of behavior options for a dropdown field, based on
  // blocks found on the main workspace.
  getAllBehaviorOptions() {
    const noBehaviorLabel = commonI18n.behaviorsNotFound();
    const noBehaviorOption = [noBehaviorLabel, NO_OPTIONS_MESSAGE];
    // Behavior definition blocks are always moved to the hidden workspace.
    const definitionWorkspace = Blockly.getHiddenDefinitionWorkspace();
    if (!definitionWorkspace) {
      return [noBehaviorOption];
    }
    const behaviorBlocks = definitionWorkspace
      .getTopBlocks()
      .filter(
        block => block.type === BLOCK_TYPES.behaviorDefinition
      ) as ProcedureBlock[];
    // Menu options are an array, each option containing a human-readable part,
    // and a language-neutral string. Both are the same in this case.
    const behaviorOptions = behaviorBlocks.map(block => [
      block.getProcedureModel().getName(),
      block.behaviorId,
    ]);
    behaviorOptions.sort();
    // Add a "No behaviors found" option, if needed
    if (behaviorOptions.length === 0) {
      behaviorOptions.push(noBehaviorOption);
    }
    return behaviorOptions;
  },
};

// HELPERS
// On change event for a block that shadows an image source block.
// On an event, checks if the block image should change, and update it.
function onBlockImageSourceChange(event: Abstract, block: ExtendedBlockSvg) {
  const imagePreview =
    block.inputList &&
    block.inputList[0] &&
    (block.inputList[0].fieldRow[1] as CdoFieldImage);
  if (!imagePreview) {
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_DRAG &&
    (event as BlockDrag).blockId === block.id
  ) {
    // If this is a start event, prevent image changes.
    // If it is an end event, allow image changes again.
    imagePreview.setAllowImageChange(!(event as BlockDrag).isStart);
  }
  if (
    (event.type === Blockly.Events.BLOCK_CREATE &&
      (event as BlockCreate).blockId === block.id) ||
    (event.type === Blockly.Events.BLOCK_CHANGE &&
      (event as BlockChange).blockId === block.id)
  ) {
    // We can skip the following events:
    // This block's create event, as we handle setting the image on block creation
    // in src/p5lab/spritelab/blocks.
    // This block's change event, as that means we just changed the image due to
    // some other event.
    return;
  }
  if (
    imagePreview.shouldAllowImageChange() &&
    (event.type === Blockly.Events.BLOCK_CREATE ||
      event.type === Blockly.Events.BLOCK_CHANGE ||
      event.type === Blockly.Events.BLOCK_DRAG)
  ) {
    updatePointerBlockImage(block, spriteLabPointers);
  }
}
