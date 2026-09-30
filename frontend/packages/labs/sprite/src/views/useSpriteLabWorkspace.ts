// The Code tab's workspace, as apps' useBlocklyWorkspace offered it, over
// @code-dot-org/blockly's BlocklyWorkspace. The view renders the component
// with `workspaceProps` and keys it by `toolboxKind`: Blockly fixes a
// workspace's toolbox kind at injection, so a toolbox of the other kind
// takes a new workspace.
import * as BlocklyCore from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import {
  type MutableRefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {BlocklySerialization} from '@code-dot-org/blockly';

import {applyToolboxAdditions} from '../blockly/toolbox/toolboxAdditions';
import {filterToolboxToRegisteredBlocks} from '../blockly/toolbox/toolboxUtils';

type ToolboxInfo = BlocklyCore.utils.toolbox.ToolboxInfo;

// The events that change a workspace's serialization.
const EDIT_EVENTS = new Set<string>([
  BlocklyCore.Events.BLOCK_CHANGE,
  BlocklyCore.Events.BLOCK_MOVE,
  BlocklyCore.Events.BLOCK_CREATE,
  BlocklyCore.Events.BLOCK_DELETE,
  BlocklyCore.Events.VAR_CREATE,
  BlocklyCore.Events.VAR_RENAME,
  BlocklyCore.Events.VAR_DELETE,
]);

export interface SpriteLabWorkspace {
  /** Props for BlocklyWorkspace. */
  workspaceProps: {
    toolbox: ToolboxInfo | undefined;
    workspaceRef: MutableRefObject<BlocklyCore.WorkspaceSvg | null>;
    onInject: (workspace: BlocklyCore.WorkspaceSvg) => void;
    onChange: (event: BlocklyCore.Events.Abstract) => void;
  };
  /** Key for BlocklyWorkspace; a new kind re-injects. */
  toolboxKind: string | undefined;
  /**
   * Increments on every injection. A new workspace starts empty, so whoever
   * owns its contents reloads them when this changes.
   */
  workspaceVersion: number;
  /** The program the workspace compiles to; null before injection. */
  getCode: () => string | null;
  /** The serialization the workspace holds; null before injection. */
  getCurrentBlocks: () => BlocklySerialization | null;
  loadCode: (source: BlocklySerialization) => void;
  /**
   * `onWorkspaceChange` gets the serialization after each user edit;
   * `onIntermediateChange` fires on edits inside a field editor, which
   * serialize only when it closes.
   */
  subscribeToChanges: (
    onWorkspaceChange: (source: BlocklySerialization) => void,
    onIntermediateChange?: () => void,
  ) => () => void;
  /** Re-applies the toolbox, so dropdowns show data fetched since. */
  refreshToolbox: () => void;
}

/**
 * The level's toolbox with the lab's additions, as the workspace shows it.
 * `blockTypes` are the workspace's own blocks, which the provider registers
 * after the first render; Blockly's built-in blocks are registered already.
 */
function prepareToolbox(
  toolbox: ToolboxInfo | undefined,
  blockTypes: readonly string[],
) {
  if (!toolbox || toolbox.contents?.length === 0) {
    return undefined;
  }
  const known: Record<string, unknown> = {...BlocklyCore.Blocks};
  for (const type of blockTypes) {
    known[type] = true;
  }
  return filterToolboxToRegisteredBlocks(applyToolboxAdditions(toolbox), known);
}

export default function useSpriteLabWorkspace(
  toolboxDefinition: ToolboxInfo | undefined,
  blockTypes: readonly string[],
): SpriteLabWorkspace {
  const workspaceRef = useRef<BlocklyCore.WorkspaceSvg | null>(null);
  // Loads in flight: their events are not user edits.
  const pendingLoads = useRef(0);
  const currentBlocks = useRef<BlocklySerialization | null>(null);
  const onWorkspaceChange = useRef<(source: BlocklySerialization) => void>(
    () => {},
  );
  const onIntermediateChange = useRef<(() => void) | undefined>(undefined);
  const [workspaceVersion, setWorkspaceVersion] = useState(0);

  const toolbox = useMemo(
    () => prepareToolbox(toolboxDefinition, blockTypes),
    [toolboxDefinition, blockTypes],
  );

  const onInject = useCallback(() => {
    pendingLoads.current = 0;
    currentBlocks.current = null;
    setWorkspaceVersion(version => version + 1);
  }, []);

  const onChange = useCallback((event: BlocklyCore.Events.Abstract) => {
    if (pendingLoads.current > 0) {
      if (event.type === BlocklyCore.Events.FINISHED_LOADING) {
        pendingLoads.current--;
      }
      return;
    }
    if (event.type === BlocklyCore.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
      onIntermediateChange.current?.();
      return;
    }
    const workspace = workspaceRef.current;
    if (!EDIT_EVENTS.has(event.type) || !workspace) {
      return;
    }
    const serialized = BlocklyCore.serialization.workspaces.save(
      workspace,
    ) as BlocklySerialization;
    currentBlocks.current = serialized;
    onWorkspaceChange.current(serialized);
  }, []);

  const getCode = useCallback(
    () =>
      workspaceRef.current
        ? javascriptGenerator.workspaceToCode(workspaceRef.current)
        : null,
    [],
  );

  const loadCode = useCallback((source: BlocklySerialization) => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }
    pendingLoads.current++;
    try {
      BlocklyCore.serialization.workspaces.load(source, workspace);
      // Read synchronously by callers, so set here, not in the listener.
      currentBlocks.current = source;
    } catch (error) {
      pendingLoads.current--;
      throw error;
    }
  }, []);

  const getCurrentBlocks = useCallback(() => currentBlocks.current, []);

  const subscribeToChanges = useCallback(
    (
      onEdit: (source: BlocklySerialization) => void,
      onIntermediate?: () => void,
    ) => {
      onWorkspaceChange.current = onEdit;
      onIntermediateChange.current = onIntermediate;
      return () => {
        onWorkspaceChange.current = () => {};
        onIntermediateChange.current = undefined;
      };
    },
    [],
  );

  const refreshToolbox = useCallback(() => {
    const workspace = workspaceRef.current;
    if (workspace?.rendered && toolbox) {
      workspace.updateToolbox(toolbox);
    }
  }, [toolbox]);

  return {
    workspaceProps: {toolbox, workspaceRef, onInject, onChange},
    toolboxKind: toolbox?.kind,
    workspaceVersion,
    getCode,
    getCurrentBlocks,
    loadCode,
    subscribeToChanges,
    refreshToolbox,
  };
}
