import _ from 'lodash';
import {SVG_NS} from '@cdo/apps/constants';
import Button from '@cdo/apps/templates/Button';
import {
  changeShadowedImage,
  resetShadowedImageToLongString,
} from '@cdo/apps/blockly/addons/cdoBlockShadow';
// This file contains customizations to Google Blockly Sprite Lab blocks.

export const blocks = {
  // Creates and returns a toggle button field. This field should be
  // added to the block after other inputs have been created.
  initializeMiniToolbox() {
    // Function to toggle the flyout visibility
    const createFlyoutField = function (block) {
      const flyoutField = new Blockly.FieldFlyout(_, {
        flyoutKey: `flyout_${block.type}`,
        sizingBehavior: 'fitContent',
        name: 'FLYOUT',
      });
      block
        .appendDummyInput('flyout_input')
        .appendField(flyoutField, `flyout_${block.type}`);
      return flyoutField;
    };

    const toggleFlyout = function () {
      const block = this.getSourceBlock();
      if (!block.getInput('flyout_input')) {
        const flyoutField = createFlyoutField(block);
        flyoutField.showEditor_();
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
      this.workspace.registerToolboxCategoryCallback(
        `flyout_${this.type}`,
        function (workspace) {
          let blocks = [];
          miniToolboxBlocks.forEach(blockType =>
            blocks.push(Blockly.Xml.textToDom(`<block type="${blockType}"/>`))
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

  // Set block to shadow for preview field if needed
  setUpBlockShadowing() {
    const pointers = {
      gamelab_clickedSpritePointer: {
        parent: 'gamelab_spriteClicked',
        imageIndex: 0,
      },
      gamelab_newSpritePointer: {
        parent: 'gamelab_whenSpriteCreated',
        imageIndex: 0,
      },
      gamelab_subjectSpritePointer: {
        parent: 'gamelab_checkTouching',
        imageIndex: 0,
      },
      gamelab_objectSpritePointer: {
        parent: 'gamelab_checkTouching',
        imageIndex: 1,
      },
    };
    // when the parent changes, trigger a change to this block's field
    if (Object.keys(pointers).includes(this.type)) {
      const pointerData = pointers[this.type];
      this.onchange = function (event) {
        if (
          event.type === Blockly.Events.BLOCK_DRAG &&
          (event.isStart || event.blockId !== this.id)
        ) {
          // We only care about drag events if the event is on this block and
          // it's the end of the drag. Otherwise, we can skip this event.
          return;
        }
        if (
          event.type === Blockly.Events.BLOCK_CREATE ||
          event.type === Blockly.Events.BLOCK_CHANGE ||
          event.type === Blockly.Events.BLOCK_DRAG
        ) {
          const rootBlock = this.getRootBlock();
          let parent = undefined;
          if (rootBlock.type === pointerData.parent) {
            parent = rootBlock;
          } else if (this.getRootBlock().type === this.type) {
            const potentialParents = Blockly.getMainWorkspace()
              .getTopBlocks()
              .filter(block => block.type === pointers[this.type].parent);
            potentialParents.forEach(potentialParent => {
              const inputs = potentialParent.inputList.filter(
                input => input.name === 'flyout_input'
              );
              if (inputs.length > 0) {
                const flyoutWorkspace =
                  inputs[0].fieldRow[0]?.flyout_?.workspace_;
                if (
                  flyoutWorkspace &&
                  flyoutWorkspace.id === this.workspace.id &&
                  flyoutWorkspace
                    .getAllBlocks()
                    .filter(block => block.id === this.id).length > 0
                ) {
                  parent = potentialParent;
                }
              }
            });
          }
          if (parent) {
            changeShadowedImage(parent, this, pointerData.imageIndex);
          } else {
            // the block is probably disconnected from the root or toolbox. Reset to
            // default text.
            resetShadowedImageToLongString(this);
          }
        }
      };
    }
  },
};
