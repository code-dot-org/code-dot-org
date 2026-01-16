import * as BlocklyCore from 'blockly/core';

import {getProjectXml} from '@cdo/apps/blockly/addons/cdoXml';

import {getProjectSerialization} from '../serialization/state';

/**
 * Retrieves the serialization of the workspace (student code).
 *
 * @param {Blockly.WorkspaceSvg} workspace - The workspace to serialize.
 * @param {boolean} [getSourceAsJson] - Flag indicating whether to retrieve the code as JSON or XML.
 *                                      If truthy, the code will be returned as a JSON string.
 *                                      If falsy, the code will be returned as an XML string.
 * @returns {string} The serialization of the workspace.
 */
export function getCode(
  workspace: BlocklyCore.WorkspaceSvg,
  getSourceAsJson: boolean
) {
  if (!getSourceAsJson) {
    return Blockly.Xml.domToText(getProjectXml(workspace));
  } else {
    return JSON.stringify(getProjectSerialization(workspace));
  }
}

// Returns the student's executable code based on blockXml. Blocks are loaded onto
// a single unrendered workspace. Used for Artist solution blocks in the student view.
export function getCodeFromBlockXmlSource(blockXmlString: string) {
  const domBlocks = Blockly.Xml.textToDom(blockXmlString);
  const workspace = new Blockly.Workspace();
  Blockly.Xml.domToBlockSpace(workspace, domBlocks);
  Blockly.getGenerator().init(workspace);
  const blocks = workspace.getTopBlocks(true);
  const code: (string | [string, number])[] = [];
  blocks.forEach(block => code.push(Blockly.JavaScript.blockToCode(block)));
  const result = Blockly.getGenerator().finish(code.join('\n'));
  workspace.dispose();
  return result;
}

// Sets the lab code based on the student's blocks and any extra (e.g. initialization) code.
// The students blocks are considered to be any on the main or hidden workspaces.
export function getAllGeneratedCode(extraCode?: string) {
  let code = extraCode || '';

  [Blockly.getHiddenDefinitionWorkspace(), Blockly.getMainWorkspace()].forEach(
    workspace => {
      if (workspace) {
        Blockly.getGenerator().init(workspace);
        const blocks = workspace.getTopBlocks(true);
        const blocksCode: (string | [string, number])[] = [];
        blocks.forEach(block =>
          blocksCode.push(Blockly.JavaScript.blockToCode(block))
        );
        code += Blockly.getGenerator().finish(blocksCode.join('\n'));
      }
    }
  );
  return code;
}
