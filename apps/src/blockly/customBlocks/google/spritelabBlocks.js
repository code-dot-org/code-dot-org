import _ from 'lodash';
import {SVG_NS} from '@cdo/apps/constants';
import Button from '@cdo/apps/templates/Button';

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
    const icon1 = document.createElementNS(SVG_NS, 'tspan');
    icon1.style.fontFamily = 'FontAwesome';
    icon1.textContent = '\uf067 '; // plus icon
    const icon2 = document.createElementNS(SVG_NS, 'tspan');
    icon2.style.fontFamily = 'FontAwesome';
    icon2.textContent = '\uf068 '; // minus icon
    const colorOverrides = {
      icon: Button.ButtonColor.white,
      button: Button.ButtonColor.blue,
    };
    const flyoutToggleButton = new Blockly.FieldToggle({
      onClick: toggleFlyout,
      icon1,
      icon2,
      useDefaultIcon: true,
      callback: createFlyoutField,
      colorOverrides,
    });
    return flyoutToggleButton;
  },
  initializeFlyoutToggle(miniToolboxBlocks, flyoutToggleButton) {
    // When useDefaultIcon is true, flyout is closed. When false, flyout is open. (Information for serialization)
    this.inputList[0].insertFieldAt(
      0,
      flyoutToggleButton,
      `button_${this.type}`
    );
    if (this.inputList[this.inputList.length - 1].type !== 5) {
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
