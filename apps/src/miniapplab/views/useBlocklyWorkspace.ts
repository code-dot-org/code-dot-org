import * as BlocklyCore from 'blockly/core';
import {useCallback, useEffect, useRef} from 'react';

import cdoTheme from '@cdo/apps/blockly/themes/cdoTheme';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {setUpBlocklyForMiniAppLab} from '../blockly/setup';
import {toolbox} from '../blockly/toolbox';

export const BLOCKLY_DIV_ID = 'miniapplab-blockly-div';

const saveDebounceMs = 300;

interface UseBlocklyWorkspaceOptions {
  /** Blocks to load into the fresh workspace. */
  initialBlocks: WorkspaceSerialization;
  /** Called with the serialized workspace shortly after the user edits it. */
  onChange: (blocks: WorkspaceSerialization) => void;
}

interface UseBlocklyWorkspaceResult {
  workspaceRef: React.MutableRefObject<BlocklyCore.WorkspaceSvg | null>;
  getCode: () => string;
  loadBlocks: (blocks: WorkspaceSerialization) => void;
  /** Re-measure after the workspace was hidden or its box changed. */
  resize: () => void;
  /** Rebuild the flyout, so its dropdowns list the current design. */
  refreshToolbox: () => void;
}

/** Injects this lab's Blockly workspace into the div with BLOCKLY_DIV_ID. */
export default function useBlocklyWorkspace({
  initialBlocks,
  onChange,
}: UseBlocklyWorkspaceOptions): UseBlocklyWorkspaceResult {
  const workspaceRef = useRef<BlocklyCore.WorkspaceSvg | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initialBlocksRef = useRef(initialBlocks);

  useEffect(() => {
    const blocklyDiv = document.getElementById(BLOCKLY_DIV_ID);
    if (!blocklyDiv) {
      return;
    }
    setUpBlocklyForMiniAppLab();

    const workspace = Blockly.inject(blocklyDiv, {
      toolbox,
      theme: cdoTheme,
      trashcan: true,
    } as BlocklyCore.BlocklyOptions);
    workspaceRef.current = workspace;
    // The wrapper shrinks the container to leave room for workspace headers
    // this lab does not have.
    blocklyDiv.style.height = '100%';
    Blockly.svgResize(workspace);

    Blockly.serialization.workspaces.load(initialBlocksRef.current, workspace);

    let saveTimer: number | undefined;
    const listener = (event: BlocklyCore.Events.Abstract) => {
      if (event.isUiEvent) {
        return;
      }
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        onChangeRef.current(
          Blockly.serialization.workspaces.save(
            workspace
          ) as WorkspaceSerialization
        );
      }, saveDebounceMs);
    };
    workspace.addChangeListener(listener);

    const observer = new ResizeObserver(() => Blockly.svgResize(workspace));
    observer.observe(blocklyDiv);

    return () => {
      observer.disconnect();
      window.clearTimeout(saveTimer);
      workspace.removeChangeListener(listener);
      workspace.dispose();
      workspaceRef.current = null;
    };
  }, []);

  const getCode = useCallback(() => {
    const workspace = workspaceRef.current;
    return workspace ? Blockly.JavaScript.workspaceToCode(workspace) : '';
  }, []);

  const loadBlocks = useCallback((blocks: WorkspaceSerialization) => {
    const workspace = workspaceRef.current;
    if (workspace) {
      workspace.clear();
      Blockly.serialization.workspaces.load(blocks, workspace);
    }
  }, []);

  const resize = useCallback(() => {
    const workspace = workspaceRef.current;
    if (workspace) {
      Blockly.svgResize(workspace);
    }
  }, []);

  const refreshToolbox = useCallback(() => {
    workspaceRef.current?.updateToolbox(toolbox);
  }, []);

  return {workspaceRef, getCode, loadBlocks, resize, refreshToolbox};
}
