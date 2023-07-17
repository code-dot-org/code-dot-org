import _ from 'lodash';
import {SVG_NS} from '@cdo/apps/constants';
import Button from '@cdo/apps/templates/Button';

// This file contains customizations to Google Blockly Sprite Lab blocks.

const dummyInputType = 5;
export const blocks = {
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
  appendMiniToolboxToggle(miniToolboxBlocks, flyoutToggleButton) {
    this.setInputsInline(true);
    const firstInput = this.inputList[0];

    firstInput.insertFieldAt(0, flyoutToggleButton, `button_${this.type}`);
    const lastInput = this.inputList[this.inputList.length - 1];
    if (lastInput.type !== dummyInputType) {
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

    this.saveExtraState = function () {
      return {
        useDefaultIcon: flyoutToggleButton.useDefaultIcon,
      };
    };

    this.loadExtraState = function (state) {
      const useDefaultIcon = state['useDefaultIcon'];
      flyoutToggleButton.setIcon(useDefaultIcon);
    };

    this.mutationToDom = function () {
      var container = Blockly.utils.xml.createElement('mutation');
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
      // flyoutToggleButton.useDefaultIcon = useDefaultIcon;
    };
  },
};
