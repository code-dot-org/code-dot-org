import {Renderers} from '../constants';
import {BlocklyWrapperType} from '../types';

// Blockly puts the renderer's class on the injection div and on the dropdown
// and widget divs, so this selector reaches every surface the renderer draws.
const scope = `.${Renderers.REFRESH}-renderer`;

let cssRegistered = false;
export default function initializeRefreshCss(
  blocklyWrapper: BlocklyWrapperType
) {
  if (cssRegistered) {
    return;
  }
  cssRegistered = true;
  blocklyWrapper.Css.register(
    `/* Top-level stacks only: one filter per stack, not per nested block. */
    ${scope} .blocklyBlockCanvas > .blocklyDraggable {
      filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.2));
    }
    ${scope} .blocklyDragging {
      filter: drop-shadow(0 6px 10px rgb(0 0 0 / 0.3));
    }
    ${scope} .blocklyToolboxCategory {
      margin: 2px 8px;
      border-radius: 8px;
      overflow: hidden;
    }
    ${scope} .blocklyToolboxCategoryLabel {
      font-weight: 600;
    }
    ${scope}.blocklyDropDownDiv {
      border-radius: 12px;
      box-shadow: 0 8px 24px rgb(0 0 0 / 0.2);
    }
    ${scope}.blocklyDropDownDiv .blocklyMenuItem {
      border-radius: 6px;
    }
    /* Zelos fills the menu with the block colour; cdoCss.ts forces dark text. */
    ${scope}.blocklyDropDownDiv .blocklyMenuItemContent {
      color: #fff !important;
    }
    ${scope}.blocklyWidgetDiv .blocklyHtmlInput {
      border-radius: 999px;
    }
    `
  );
}
