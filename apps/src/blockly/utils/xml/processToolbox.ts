import {processIndividualBlock} from '@cdo/apps/blockly/addons/cdoXml';

/**
 * Update the XML string representing toolbox data for compatibility with
 * modern Blockly.
 * This function potentially modifies each <block> element in the XML
 * if there are unsupported attributes, missing mutators, etc.
 * We also process block xml during domToBlockSpace, which is called to
 * convert sources from XML to JSON.
 *
 * @param {string} toolboxString - The XML string representing toolbox data.
 * @returns {string} The modified XML string after processing.
 */
export function processToolboxXml(toolboxString: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(toolboxString, 'text/xml');
  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('Error parsing XML');
  }

  const blocks = xmlDoc.querySelectorAll('block');
  blocks.forEach(processIndividualBlock);

  // Convert the modified XML document back to a string
  const modifiedXmlString = new XMLSerializer().serializeToString(xmlDoc);
  return modifiedXmlString;
}
