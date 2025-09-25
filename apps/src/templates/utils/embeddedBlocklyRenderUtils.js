import {PROCEDURE_BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import {parseElement} from '@cdo/apps/xml';

import {
  convertXmlToBlockly,
  shrinkBlockSpaceContainer,
} from '../instructions/utils';

/**
 * Creates and renders an embedded Blockly block into the given container element.
 * @param {HTMLElement} container - The DOM node to render into
 * @param {string} blockType - The Blockly block type
 */
export function embedBlocklyBlock(container, blockType) {
  convertXmlToBlockly(container);
  const blocksDom = parseElement(`<block type='${blockType}' />`);
  addNameToProcedureBlocks(blocksDom);
  Blockly.cdoUtils.getUserTheme().then(theme => {
    const blockSpace = Blockly.createEmbeddedWorkspace(container, blocksDom, {
      noScrolling: true,
      inline: true,
      theme,
    });
    shrinkBlockSpaceContainer(blockSpace, true);
  });
}

/**
 * Modifies the given block DOM element to add a default procedure name if it's a procedure block.
 *
 * @param {Element} blocksDom - An XML DOM element containing a single <block> node.
 * @private
 */
function addNameToProcedureBlocks(blocksDom) {
  const blockElement = blocksDom.querySelector('block');
  if (PROCEDURE_BLOCK_TYPES.includes(blockElement.getAttribute('type'))) {
    const fieldElement = document.createElement('field');
    fieldElement.setAttribute('name', 'NAME');
    fieldElement.textContent = Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE;
    blockElement.appendChild(fieldElement);
  }
}
