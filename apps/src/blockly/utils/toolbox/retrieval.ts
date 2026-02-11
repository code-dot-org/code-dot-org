import type * as BlocklyCore from 'blockly/core';

import localization from '@cdo/apps/localization';

import {getSimplifiedStateForFlyout} from '../serialization/flyouts';
import {convertXmlToJson} from '../serialization/xmlToJson';

type FlyoutItemInfoArray = BlocklyCore.utils.toolbox.FlyoutItemInfoArray;

/**
 * Retrieves the toolbox blocks for a custom category from the level config.
 * @param {string} customCategory The name of the custom category to retrieve blocks from. (Ex. 'VARIABLE', 'Behavior')
 * @returns {Document} A new XML document containing the filtered blocks.
 */
export function getLevelToolboxBlocks(customCategory: string) {
  const parser = new DOMParser();
  // This method only works for string toolboxes.
  if (!Blockly.toolboxBlocks || typeof Blockly.toolboxBlocks !== 'string') {
    return;
  }
  // TODO: Update this to support JSON once https://codedotorg.atlassian.net/browse/CT-8 is merged
  const xmlDoc = parser.parseFromString(Blockly.toolboxBlocks, 'text/xml');

  // Find the category based on the custom attribute
  const categories = Array.from(xmlDoc.getElementsByTagName('category'));
  let foundCategory = null;

  for (const category of categories) {
    if (category.getAttribute('custom') === customCategory) {
      foundCategory = category;
      break;
    }
  }

  if (foundCategory) {
    // Create a new XML document and append the child nodes of the category to it
    const newXmlDocument = parser.parseFromString(
      '<xml></xml>',
      'application/xml'
    );
    const childNodes = Array.from(foundCategory.childNodes);
    for (const childNode of childNodes) {
      // Clone the child node and append it to the new XML document
      newXmlDocument.documentElement.appendChild(childNode.cloneNode(true));
    }

    return newXmlDocument;
  } else {
    return undefined;
  }
}

// Returns a list of Blockly toolbox blocks in JSON for a given category.
// This is used in order to merge XML toolbox blocks with the dynamically created
// blocks in auto-populated categories, such as Behaviors, Functions, and Variables.
export function getCategoryBlocksJson(category: string): FlyoutItemInfoArray {
  const categoryBlocksJson: FlyoutItemInfoArray = [];
  const levelToolboxBlocks = getLevelToolboxBlocks(category);
  if (!levelToolboxBlocks?.querySelector('xml')?.hasChildNodes()) {
    return categoryBlocksJson;
  }

  // Blockly supports XML or JSON, but not a combination of both.
  // We convert to JSON here because the other flyout blocks are JSON.
  const blocksConvertedJson = convertXmlToJson(
    levelToolboxBlocks.documentElement
  );

  // Localize the flyout variables
  // These are sourced from the XML and are always in the source language
  (blocksConvertedJson.variables || []).forEach(variable => {
    Blockly.SourceVariables[variable.id] ||= variable.name;
    const oldName = Blockly.SourceVariables[variable.id];
    let newName: string = localization.translate(`[variable] ${oldName}`, [
      'blockly-variable',
      'blockly-block',
    ]);
    if (newName.startsWith('[variable] ')) {
      newName = newName.substring(11);
    } else {
      console.error(
        'Global variable translation does not have the [variable] tag (category block variable)',
        oldName,
        newName
      );

      // Reject the translation
      newName = oldName;
    }
    variable.name = newName;
  });

  const flyoutJson: FlyoutItemInfoArray =
    getSimplifiedStateForFlyout(blocksConvertedJson);

  return flyoutJson;
}
