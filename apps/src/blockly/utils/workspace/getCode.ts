import * as BlocklyCore from 'blockly/core';

import {getProjectXml} from '@cdo/apps/blockly/addons/cdoXml';
import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getStore} from '@cdo/apps/redux';
import {setFailedToGenerateCode} from '@cdo/apps/redux/blockly';

import {strip} from '../code/strip';
import {getProjectSerialization} from '../serialization/state';

const MAX_GET_CODE_RETRIES = 2;
const RETRY_GET_CODE_INTERVAL_MS = 500;
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

export function getWorkspaceCode() {
  return getWorkspaceCodeHelper(0, Blockly.getHiddenDefinitionWorkspace());
}

const getWorkspaceCodeHelper = (
  retryCount: number,
  hiddenWorkspace: BlocklyCore.Workspace | undefined
): string => {
  let workspaceCode = '';
  try {
    workspaceCode = Blockly.JavaScript.workspaceToCode(
      Blockly.getMainWorkspace()
    );
    if (hiddenWorkspace) {
      workspaceCode += Blockly.JavaScript.workspaceToCode(hiddenWorkspace);
    }
    workspaceCode = strip(workspaceCode);
    getStore().dispatch(setFailedToGenerateCode(false));
  } catch (e) {
    if (retryCount < MAX_GET_CODE_RETRIES) {
      // Sometimes we need to wait for Blockly change handlers to complete
      // before the code will generate correctly. Retry after a short delay.
      setTimeout(() => {
        return getWorkspaceCodeHelper(retryCount + 1, hiddenWorkspace);
      }, RETRY_GET_CODE_INTERVAL_MS);
    } else {
      handleCodeGenerationFailure(
        MetricEvent.GOOGLE_BLOCKLY_GET_CODE_ERROR,
        e as Error
      );
    }
  }
  return workspaceCode;
};

/**
 * Handle a failure to get workspace code by Blockly by updating the
 * redux store and logging the error.
 * We only want to log the error once per failure since getWorkspaceCode
 * gets called many times and the error will be the same every time.
 * @param {MetricEvent} eventName Event name to log
 * @param {Error} error Error thrown by getWorkspaceCode
 */
function handleCodeGenerationFailure(eventName: MetricEvent, error: Error) {
  const store = getStore();
  if (!store.getState().blockly.failedToGenerateCode) {
    store.dispatch(setFailedToGenerateCode(true));
    MetricsReporter.logError({
      event: eventName,
      errorMessage: error.message,
      stackTrace: error.stack,
    });
  }
}
