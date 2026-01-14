import {
  WorkspaceSerialization,
  JsonBlockConfig,
  XmlBlockConfig,
} from '@cdo/apps/blockly/types';

import {hasBlocks} from './json';

/**
 * Converts XML serialization to JSON using a temporary unrendered workspace.
 * @param {xml} xml - workspace serialization, current/legacy format
 * @param {boolean} [embedded] - indicates whether the source will be converted
 * for an embedded workspace for not.
 * @returns {json} stateToLoad - modern workspace serialization
 */
export function convertXmlToJson(xml: Element, embedded?: boolean) {
  const tempWorkspace = new Blockly.Workspace();

  // The temporary workspace should mirror the embedded state of the workspace
  // that will use the converted source.
  if (embedded) {
    Blockly.addEmbeddedWorkspace(tempWorkspace);
  }

  // domToBlockSpace returns an array of "block" objects with the following properties:
  //   blockly_block: the actual block object created by Blockly
  //   x: the x attribute found in <block/> element
  //   y: the y attribute found in <block/> element
  const xmlBlocks = Blockly.Xml.domToBlockSpace(tempWorkspace, xml);
  const stateToLoad = Blockly.serialization.workspaces.save(
    tempWorkspace
  ) as WorkspaceSerialization;

  if (xmlBlocks.length && hasBlocks(stateToLoad)) {
    // Create a map of ids (key) and block serializations (value).
    const blockIdMap = stateToLoad.blocks.blocks.reduce(
      (map: Map<string, JsonBlockConfig>, blockJson: JsonBlockConfig) =>
        map.set(blockJson.id || '', blockJson),
      new Map()
    );

    addPositionsToState(xmlBlocks, blockIdMap);
  }
  tempWorkspace.dispose();
  return stateToLoad;
}

/**
 * Adds x/y values from XML to JSON serialization.
 * @param {Array<Object>} xmlBlocks - an array of "block" objects containing a block and x/y coordinates
 * @param {Map<String, Object>} blockIdMap - a map of ids (keys) and serialized blocks (values)
 */
export function addPositionsToState(
  xmlBlocks: XmlBlockConfig[],
  blockIdMap: Map<string, JsonBlockConfig>
) {
  xmlBlocks.forEach(xmlBlock => {
    const blockJson = blockIdMap.get(xmlBlock.blockly_block.id);
    if (blockJson) {
      // Note: If xmlBlock values are NaN, they will be ignored and blockJson values will be used
      blockJson.x = xmlBlock.x || blockJson.x;
      blockJson.y = xmlBlock.y || blockJson.y;
    }
  });
}

/**
 * Converts blocks in XML format to JSON representation. Shared behaviors are saved
 * as XML, so we need to convert it if the student's project is in JSON.
 * Conversion occurs by loading blocks onto a temporary headless workspace and re-serializing.
 *
 * @param {string} functionsXml - The XML representation of functions to convert.
 * @returns {Object} - JSON representation of the functions.
 */
export function convertFunctionsXmlToJson(functionsXml: string) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(`<xml>${functionsXml}</xml>`, 'text/xml');
  const tempWorkspace = new Blockly.Workspace();
  Blockly.Xml.domToBlockSpace(tempWorkspace, xml.children[0]);
  const proceduresState = Blockly.serialization.workspaces.save(
    tempWorkspace
  ) as WorkspaceSerialization;
  tempWorkspace.dispose();
  return proceduresState;
}
