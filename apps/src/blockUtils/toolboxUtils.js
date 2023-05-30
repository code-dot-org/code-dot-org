import xml from '../xml';
import _ from 'lodash';

/**
 * Create the xml for a category in a toolbox
 */
export const createCategory = function (name, blocks, custom) {
  return (
    '<category name="' +
    name +
    '"' +
    (custom ? ' custom="' + custom + '"' : '') +
    '>' +
    blocks +
    '</category>'
  );
};

/**
 * Create the xml for a level's toolbox
 * @param {string} blocks The xml of the blocks to go in the toolbox
 */
export const createToolbox = function (blocks) {
  return '<xml id="toolbox" style="display: none;">' + blocks + '</xml>';
};

const appendBlocks = function (toolboxDom, blockTypes) {
  const root = toolboxDom.firstChild;
  blockTypes.forEach(blockName => {
    const block = toolboxDom.createElement('block');
    block.setAttribute('type', blockName);
    root.appendChild(block);
  });
  return xml.serialize(toolboxDom);
};

export const appendBlocksByCategory = function (toolboxXml, blocksByCategory) {
  const parser = new DOMParser();
  const toolboxDom = parser.parseFromString(toolboxXml, 'text/xml');
  if (!toolboxDom.querySelector('category')) {
    // Uncategorized toolbox, just add blocks to the end
    const allBlocks = _.flatten(Object.values(blocksByCategory));
    return appendBlocks(toolboxDom, allBlocks);
  }
  Object.keys(blocksByCategory).forEach(categoryName => {
    let category = toolboxDom.querySelector(`category[name="${categoryName}"]`);
    let existingCategory = true;
    if (!category) {
      category = toolboxDom.createElement('category');
      existingCategory = false;
    }
    category.setAttribute('name', categoryName);
    blocksByCategory[categoryName].forEach(blockName => {
      if (category.querySelector(`block[type="${blockName}"]`)) {
        return;
      }
      const block = toolboxDom.createElement('block');
      block.setAttribute('type', blockName);
      category.appendChild(block);
    });
    if (!existingCategory) {
      toolboxDom.firstChild.appendChild(category);
    }
  });
  return xml.serialize(toolboxDom);
};
