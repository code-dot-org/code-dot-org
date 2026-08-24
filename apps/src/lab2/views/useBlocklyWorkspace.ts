import * as BlocklyCore from 'blockly/core';
import {useCallback, useEffect, useRef} from 'react';

import cdoDark from '@cdo/apps/blockly/themes/cdoDark';
import cdoTheme from '@cdo/apps/blockly/themes/cdoTheme';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {loadBlocksToWorkspace} from '@cdo/apps/blockly/utils/workspace/loadBlocks';
import {
  getUserTheme,
  setThemeAndRenderBlocks,
} from '@cdo/apps/blockly/utils/workspace/themes';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';

type BlocklyTheme = 'Light' | 'Dark';

export interface UseBlocklyWorkspaceOptions {
  blocklyDivId: string;
  enabled: boolean;
  toolboxDefinition?: BlocklyCore.utils.toolbox.ToolboxInfo;
  // XML string toolbox format. TODO: switch new levels over to JSON.
  toolboxXml?: string;
  theme: BlocklyTheme;
  setupBlockly?: () => void;
  prepareToolbox?: (
    toolbox: BlocklyCore.utils.toolbox.ToolboxDefinition | string
  ) => BlocklyCore.utils.toolbox.ToolboxDefinition | string;
  blocklyOptions?: Partial<BlocklyCore.BlocklyOptions>;
  reclaimFullHeight?: boolean;
  loadWorkspace?: (
    workspace: BlocklyCore.WorkspaceSvg,
    source: WorkspaceSerialization
  ) => void;
  serializeWorkspace?: (
    workspace: BlocklyCore.WorkspaceSvg
  ) => WorkspaceSerialization;
  updateWorkspace?: (workspace: BlocklyCore.WorkspaceSvg) => void;
  workspaceUpdateKey?: string | number;
}

export interface UseBlocklyWorkspaceResult {
  /** Compile the workspace to JavaScript for the runtime; null before inject. */
  getCode: () => string | null;
  /** Returns the serialization the workspace holds; null before inject. */
  getCurrentBlocks: () => WorkspaceSerialization | null;
  /** True while Blockly is in a drag gesture. */
  isDragging: () => boolean;
  /** Load code into the workspace. */
  loadCode: (source: WorkspaceSerialization) => void;
  /**
   * Register the change listeners:
   * - onWorkspaceChange fires with the serialized workspace after a user edit.
   * - onIntermediateChange fires on mid-editor field edits (e.g. grid painting),
   * which don't serialize until the editor closes.
   */
  subscribeToChanges: (
    onWorkspaceChange: (source: WorkspaceSerialization) => void,
    onIntermediateChange?: () => void
  ) => () => void;
}

const isWorkspaceSerializationEvent = (e: BlocklyCore.Events.Abstract) =>
  e.type === BlocklyCore.Events.BLOCK_CHANGE ||
  e.type === BlocklyCore.Events.BLOCK_MOVE ||
  e.type === BlocklyCore.Events.BLOCK_CREATE ||
  e.type === BlocklyCore.Events.BLOCK_DELETE ||
  e.type === BlocklyCore.Events.VAR_CREATE ||
  e.type === BlocklyCore.Events.VAR_RENAME ||
  e.type === BlocklyCore.Events.VAR_DELETE;

/**
 * Owns the CDO Blockly workspace lifecycle for Lab2-style labs.
 *
 * Callers mount a div with `blocklyDivId`, provide lab-specific setup/toolbox
 * data, and treat the returned serialization as the source of truth.
 */
export default function useBlocklyWorkspace({
  blocklyDivId,
  enabled,
  toolboxDefinition,
  toolboxXml,
  theme,
  setupBlockly,
  prepareToolbox,
  blocklyOptions,
  reclaimFullHeight = true,
  loadWorkspace,
  serializeWorkspace,
  updateWorkspace,
  workspaceUpdateKey,
}: UseBlocklyWorkspaceOptions): UseBlocklyWorkspaceResult {
  const workspaceRef = useRef<BlocklyCore.WorkspaceSvg | null>(null);
  // Store initial theme as a ref to prevent theme changes from re-injecting the workspace.
  const themeRef = useRef(theme);
  themeRef.current = theme;
  // Tracks workspace loads (as opposed to user edits).
  const pendingLoadsRef = useRef(0);
  const dragInProgressRef = useRef(false);
  const currentBlocksRef = useRef<WorkspaceSerialization | null>(null);
  const onWorkspaceChangeRef = useRef<(source: WorkspaceSerialization) => void>(
    () => {}
  );
  const onIntermediateChangeRef = useRef<(() => void) | undefined>(undefined);

  const publishWorkspaceState = useCallback(() => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }

    updateWorkspace?.(workspace);
    const serialized = serializeWorkspace
      ? serializeWorkspace(workspace)
      : (Blockly.serialization.workspaces.save(
          workspace
        ) as WorkspaceSerialization);
    currentBlocksRef.current = serialized;
    onWorkspaceChangeRef.current(serialized);
  }, [serializeWorkspace, updateWorkspace]);

  // Inject the workspace once enabled; re-injects when the level data changes.
  useEffect(() => {
    if (!enabled) {
      return;
    }
    setupBlockly?.();

    const blocklyDiv = document.getElementById(blocklyDivId);
    if (!blocklyDiv) {
      return;
    }
    blocklyDiv.classList.add('notranslate');

    // Prefer a JSON toolboxDefinition; otherwise the classic XML string.
    let toolbox:
      | BlocklyCore.utils.toolbox.ToolboxDefinition
      | string
      | undefined =
      toolboxDefinition && toolboxDefinition.contents?.length !== 0
        ? toolboxDefinition
        : undefined;
    if (!toolbox && toolboxXml) {
      toolbox = toolboxXml;
    }
    if (toolbox && prepareToolbox) {
      toolbox = prepareToolbox(toolbox);
    }

    // Variable/behavior naming goes through Blockly.customSimpleDialog.
    const customSimpleDialog = (options: {
      bodyText: string;
      promptPrefill: string;
      onCancel: (p1: string | null) => void;
    }) => {
      Blockly.dialog.prompt(
        options.bodyText,
        options.promptPrefill,
        options.onCancel
      );
    };

    workspaceRef.current = Blockly.inject(blocklyDiv, {
      toolbox,
      theme: themeRef.current === 'Dark' ? cdoDark : cdoTheme,
      trashcan: true,
      customSimpleDialog,
      editBlocks: getAppOptionsEditBlocks(),
      ...blocklyOptions,
    } as BlocklyCore.BlocklyOptions);
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }

    if (reclaimFullHeight) {
      // CDO Blockly shrinks the container by the workspace-header height to
      // leave room for a header bar we don't render. Reclaim the full height.
      blocklyDiv.style.height = '100%';
    }
    Blockly.svgResize(workspace);

    const resizeObserver = new ResizeObserver(() => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    });
    resizeObserver.observe(blocklyDiv);

    const onChange = (e: BlocklyCore.Events.Abstract) => {
      if (pendingLoadsRef.current > 0) {
        if (e.type === BlocklyCore.Events.FINISHED_LOADING) {
          // This load's event stream is over.
          pendingLoadsRef.current--;
        }
        return;
      }

      if (e.type === BlocklyCore.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
        onIntermediateChangeRef.current?.();
        return;
      }

      if (e.type === BlocklyCore.Events.BLOCK_DRAG) {
        const dragEvent = e as BlocklyCore.Events.BlockDrag;
        dragInProgressRef.current = dragEvent.isStart === true;
        if (!dragInProgressRef.current) {
          requestAnimationFrame(publishWorkspaceState);
        }
        return;
      }

      // Blockly owns insertion markers for the duration of a gesture, and
      // fires create/move events before its BLOCK_DRAG start event.
      if (
        !isWorkspaceSerializationEvent(e) ||
        dragInProgressRef.current ||
        workspace.isDragging()
      ) {
        return;
      }

      const blockId =
        'blockId' in e && typeof e.blockId === 'string' ? e.blockId : undefined;
      if (blockId && workspace.getBlockById(blockId)?.isInsertionMarker()) {
        return;
      }

      publishWorkspaceState();
    };

    workspaceRef.current.addChangeListener(onChange);

    return () => {
      resizeObserver.disconnect();
      workspaceRef.current?.dispose();
      workspaceRef.current = null;
      currentBlocksRef.current = null;
      dragInProgressRef.current = false;
      // A load's FINISHED_LOADING never arrives once its workspace is gone.
      pendingLoadsRef.current = 0;
    };
  }, [
    blocklyDivId,
    blocklyOptions,
    enabled,
    prepareToolbox,
    publishWorkspaceState,
    setupBlockly,
    toolboxDefinition,
    toolboxXml,
    reclaimFullHeight,
    serializeWorkspace,
    updateWorkspace,
  ]);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (workspace) {
      updateWorkspace?.(workspace);
    }
  }, [updateWorkspace, workspaceUpdateKey]);

  // Update workspace theme on display-theme change. Resolve through
  // getUserTheme rather than applying cdoDark/cdoTheme directly: a user
  // with a persisted accessibility theme (e.g. high contrast) must get
  // that theme's dark/light variant, not the modern palette.
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (workspace) {
      const previousTheme = workspace.getTheme();
      Blockly.isDarkTheme = theme === 'Dark';
      getUserTheme(theme === 'Dark' ? cdoDark : cdoTheme).then(userTheme => {
        setThemeAndRenderBlocks(workspace, userTheme, previousTheme);
      });
    }
  }, [theme]);

  const getCode = useCallback(
    () =>
      workspaceRef.current
        ? Blockly.JavaScript.workspaceToCode(workspaceRef.current)
        : null,
    []
  );

  const loadCode = useCallback(
    (source: WorkspaceSerialization) => {
      const workspace = workspaceRef.current;
      if (!workspace || workspace.isDragging()) {
        return;
      }
      pendingLoadsRef.current++;
      try {
        if (loadWorkspace) {
          loadWorkspace(workspace, source);
        } else {
          loadBlocksToWorkspace(workspace, JSON.stringify(source));
        }
        // Update ref here (instead of in change listener) since callers may read this synchronously.
        currentBlocksRef.current = source;
      } catch (e) {
        // Decrement the counter if there was an error.
        pendingLoadsRef.current--;
        throw e;
      }
    },
    [loadWorkspace]
  );

  const getCurrentBlocks = useCallback(() => currentBlocksRef.current, []);

  const isDragging = useCallback(
    () =>
      dragInProgressRef.current || workspaceRef.current?.isDragging() === true,
    []
  );

  const subscribeToChanges = useCallback(
    (
      onWorkspaceChange: (source: WorkspaceSerialization) => void,
      onIntermediateChange?: () => void
    ) => {
      onWorkspaceChangeRef.current = onWorkspaceChange;
      onIntermediateChangeRef.current = onIntermediateChange;
      return () => {
        onWorkspaceChangeRef.current = () => {};
        onIntermediateChangeRef.current = undefined;
      };
    },
    []
  );

  return {getCode, getCurrentBlocks, isDragging, loadCode, subscribeToChanges};
}
