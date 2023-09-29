import _ from 'lodash';
import {SVG_NS} from '@cdo/apps/constants';
import Button from '@cdo/apps/templates/Button';
import {updatePointerBlockImage} from '@cdo/apps/blockly/addons/cdoSpritePointer';
import CdoFieldFlyout from '@cdo/apps/blockly/addons/cdoFieldFlyout';
import {spriteLabPointers} from '@cdo/apps/p5lab/spritelab/blockly/constants';
import {blocks as behaviorBlocks} from './behaviorBlocks';
import msg from '@cdo/locale';

// This file contains customizations to Google Blockly Sprite Lab blocks.

export const blocks = {
  // Creates and returns a toggle button field. This field should be
  // added to the block after other inputs have been created.
  initializeMiniToolbox() {
    // Function to create the flyout
    const createFlyoutField = function (block) {
      const flyoutKey = CdoFieldFlyout.getFlyoutId(block);
      const flyoutField = new Blockly.FieldFlyout(_, {
        flyoutKey: flyoutKey,
        sizingBehavior: 'fitContent',
        name: 'FLYOUT',
        isFlyoutVisible: true,
      });
      block
        .appendDummyInput('flyout_input')
        .appendField(flyoutField, flyoutKey);
      return flyoutField;
    };

    // Function to toggle the flyout visibility, which actually creates or
    // deletes the flyout depending on the current visibility.
    const toggleFlyout = function () {
      const block = this.getSourceBlock();
      if (!block.getInput('flyout_input')) {
        const flyoutField = createFlyoutField(block);
        flyoutField.showEditor();
        flyoutField.render_();
      } else {
        block.removeInput('flyout_input');
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
  appendMiniToolboxToggle(miniToolboxBlocks, flyoutToggleButton) {
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
    if (lastInput.type !== Blockly.inputTypes.DUMMY) {
      this.appendDummyInput();
    }

    if (this.workspace.rendered) {
      const imageSourceId = this.id;
      this.workspace.registerToolboxCategoryCallback(
        CdoFieldFlyout.getFlyoutId(this),
        function (workspace) {
          let blocks = [];
          miniToolboxBlocks.forEach(blockType =>
            blocks.push({
              kind: 'block',
              type: blockType,
              extraState: {
                imageSourceId: imageSourceId,
              },
            })
          );
          return blocks;
        }
      );
    }

    // Blockly mutators are extensions add custom serialization to a block.
    // Serialize the state of the toggle icon to determine whether a
    // flyout field is needed immediately upon loading the block.

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
      var container = Blockly.utils.xml.createElement('mutation');
      // Ex. add <mutation useDefaultIcon="false"/> to block XML
      container.setAttribute(
        'useDefaultIcon',
        flyoutToggleButton.useDefaultIcon
      );
      return container;
    };
    this.domToMutation = function (xmlElement) {
      const useDefaultIcon =
        // Coerce string to Boolean
        xmlElement.getAttribute('useDefaultIcon') === 'true';
      flyoutToggleButton.setIcon(useDefaultIcon);
    };
  },

  // Set up this block to shadow a image source block's image, if needed. This will also
  // deserialize the image source id from the block configuration, if it exists.
  setUpBlockShadowing() {
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
          const imageSourceBlock = Blockly.getMainWorkspace().getBlockById(
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
    generator.behavior_definition = function (block) {
      // Define a procedure with a return value.
      const funcName = generator.nameDB_.getName(
        block.getFieldValue('NAME'),
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
          msg.thisSprite(),
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
      const name = generator.nameDB_.getName(
        this.getFieldValue('NAME'),
        'PROCEDURE'
      );
      return [`new Behavior(${name}, [])`, generator.ORDER_ATOMIC];
    };
    generator.sprite_parameter_get = generator.variables_get;
  },
};

// HELPERS
// On change event for a block that shadows an image source block.
// On an event, checks if the block image should change, and update it.
function onBlockImageSourceChange(event, block) {
  const imagePreview =
    block.inputList && block.inputList[0] && block.inputList[0].fieldRow[1];
  if (!imagePreview) {
    return;
  }
  if (event.type === Blockly.Events.BLOCK_DRAG && event.blockId === block.id) {
    // If this is a start event, prevent image changes.
    // If it is an end event, allow image changes again.
    imagePreview.setAllowImageChange(!event.isStart);
  }
  if (
    (event.type === Blockly.Events.BLOCK_CREATE &&
      event.blockId === block.id) ||
    (event.type === Blockly.Events.BLOCK_CHANGE && event.blockId === block.id)
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
