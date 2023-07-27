import _ from 'lodash';
import {SVG_NS} from '@cdo/apps/constants';
import Button from '@cdo/apps/templates/Button';
import {
  blockShadowingPairs,
  updateShadowedBlockImage,
} from '@cdo/apps/blockly/addons/cdoBlockShadow';
import CdoFieldFlyout from '@cdo/apps/blockly/addons/cdoFieldFlyout';
// This file contains customizations to Google Blockly Sprite Lab blocks.

export const blocks = {
  // Creates and returns a toggle button field. This field should be
  // added to the block after other inputs have been created.
  initializeMiniToolbox() {
    // Function to toggle the flyout visibility
    const createFlyoutField = function (block) {
      const flyoutKey = CdoFieldFlyout.getFlyoutId(block);
      const flyoutField = new Blockly.FieldFlyout(_, {
        flyoutKey: flyoutKey,
        sizingBehavior: 'fitContent',
        name: 'FLYOUT',
      });
      block
        .appendDummyInput('flyout_input')
        .appendField(flyoutField, flyoutKey);
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
      const parentBlockId = this.id;
      this.workspace.registerToolboxCategoryCallback(
        CdoFieldFlyout.getFlyoutId(this),
        function (workspace) {
          let blocks = [];
          miniToolboxBlocks.forEach(blockType =>
            blocks.push({
              kind: 'block',
              type: blockType,
              extraState: {
                parentBlockId: parentBlockId,
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

  // Set block to shadow for preview field if needed. This will also
  // deserialize any parent toolbox information from the block configuration.
  setUpBlockShadowing() {
    // when the parent changes, trigger a change to this block's field
    if (Object.keys(blockShadowingPairs).includes(this.type)) {
      this.saveExtraState = function () {
        return {
          parentBlockId: this.parentBlockId,
        };
      };

      this.loadExtraState = function (state) {
        this.parentBlockId = state['parentBlockId'];
        if (this.parentBlockId) {
          updateShadowedBlockImage(this, true, this.parentBlockId);
        }
      };

      this.onchange = function (event) {
        const imagePreview = this.inputList && this.inputList[0].fieldRow[1];
        if (!imagePreview) {
          return;
        }
        if (
          event.type === Blockly.Events.BLOCK_DRAG &&
          event.blockId === this.id
        ) {
          // If this is a start event, prevent image changes.
          // If it is an end event, allow image changes again.
          imagePreview.setAllowImageChange(!event.isStart);
        }
        if (
          (event.type === Blockly.Events.BLOCK_DRAG &&
            (event.isStart || event.blockId !== this.id)) ||
          (event.type === Blockly.Events.BLOCK_CREATE &&
            event.blockId === this.id) ||
          (event.type === Blockly.Events.BLOCK_CHANGE &&
            event.blockId === this.id)
        ) {
          // We can skip the following events:
          // Drag events that are either not on this block, or are on this block
          // and are a start event.
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
          const checkWorkspaceId = event.type !== Blockly.Events.BLOCK_CREATE;
          updateShadowedBlockImage(this, checkWorkspaceId);
        }
      };
    }
  },
};
