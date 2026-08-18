import * as BlocklyCore from 'blockly/core';
import {useCallback, useEffect, useRef} from 'react';

import cdoDark from '@cdo/apps/blockly/themes/cdoDark';
import cdoTheme from '@cdo/apps/blockly/themes/cdoTheme';
import {BlockDefinition, WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {validateBlockCategories} from '@cdo/apps/blockly/utils';
import {
  filterToolboxToRegisteredBlocks,
  workspaceToToolboxDefinition,
} from '@cdo/apps/blockly/utils/toolbox';
import {loadBlocksToWorkspace} from '@cdo/apps/blockly/utils/workspace/loadBlocks';
import {
  getUserTheme,
  setThemeAndRenderBlocks,
} from '@cdo/apps/blockly/utils/workspace/themes';
import {START_SOURCES, TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';

import {installSharedBlocks} from '../blockly/setup';
import {getCompleteToolboxDefinition} from '../blockly/toolbox/completeToolbox';
import {applyToolboxAdditions} from '../blockly/toolbox/toolboxAdditions';

export const BLOCKLY_DIV_ID = 'spritelab2-blockly-div';

// In toolbox edit mode the roles swap: the toolbox offers every available block
// (so any of them can be added to the level's toolbox), and the workspace holds
// the level's toolbox definition itself, laid out as category blocks to edit and save.
const editBlocksMode = getAppOptionsEditBlocks();
const isToolboxMode = editBlocksMode === TOOLBOX_BLOCKS;
const isStartMode = editBlocksMode === START_SOURCES;

interface UseBlocklyWorkspaceOptions {
  enabled: boolean;
  toolboxDefinition?: BlocklyCore.utils.toolbox.ToolboxInfo;
  sharedBlocks?: BlockDefinition[];
  theme: 'Light' | 'Dark';
}

interface UseBlocklyWorkspaceResult {
  /** Compile the workspace to JavaScript for the runtime; null before inject. */
  getCode: () => string | null;
  /** Returns the serialization the workspace holds; null before inject. */
  getCurrentBlocks: () => WorkspaceSerialization | null;
  /** Serialize the workspace blocks into a toolbox definition; null before inject. */
  getToolboxDefinition: () => BlocklyCore.utils.toolbox.ToolboxInfo | null;
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

/**
 * A Sprite Lab Blockly workspace rendered into the BLOCKLY_DIV_ID div the caller mounts.
 */
export default function useBlocklyWorkspace({
  enabled,
  toolboxDefinition,
  sharedBlocks,
  theme,
}: UseBlocklyWorkspaceOptions): UseBlocklyWorkspaceResult {
  const workspaceRef = useRef<BlocklyCore.WorkspaceSvg | null>(null);
  // Store initial theme as a ref to prevent theme changes from re-injecting the workspace.
  const themeRef = useRef(theme);
  themeRef.current = theme;
  // Tracks workspace loads (as opposed to user edits).
  const pendingLoadsRef = useRef(0);
  const currentBlocksRef = useRef<WorkspaceSerialization | null>(null);
  const onWorkspaceChangeRef = useRef<(source: WorkspaceSerialization) => void>(
    () => {}
  );
  const onIntermediateChangeRef = useRef<(() => void) | undefined>(undefined);

  // Inject the workspace once enabled; re-injects when the level data changes.
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const blocksByCategory = installSharedBlocks(sharedBlocks || []);

    const blocklyDiv = document.getElementById(BLOCKLY_DIV_ID);
    if (!blocklyDiv) {
      return;
    }

    // Levelbuilder edit modes get the complete toolbox; otherwise the
    // level's authored definition gets the lab additions, filtered to
    // registered blocks.
    let toolbox: BlocklyCore.utils.toolbox.ToolboxDefinition | undefined;
    if (isToolboxMode || isStartMode) {
      toolbox = getCompleteToolboxDefinition(blocksByCategory, isToolboxMode);
    } else if (toolboxDefinition && toolboxDefinition.contents?.length !== 0) {
      toolbox = filterToolboxToRegisteredBlocks(
        applyToolboxAdditions(toolboxDefinition)
      );
    }

    // Variable/behavior naming goes through Blockly.customSimpleDialog —
    // creating a variable crashes without one.
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
    } as BlocklyCore.BlocklyOptions);

    // CDO Blockly shrinks the container by the workspace-header height to
    // leave room for a header bar we don't render, leaving a gap at the
    // bottom. Reclaim the full height and resize the workspace SVG to fill.
    blocklyDiv.style.height = '100%';
    Blockly.svgResize(workspaceRef.current);

    const onChange = (e: BlocklyCore.Events.Abstract) => {
      if (pendingLoadsRef.current > 0) {
        if (e.type === BlocklyCore.Events.FINISHED_LOADING) {
          // This load's event stream is over.
          pendingLoadsRef.current--;
        }
        return;
      }
      // Toolbox editing: flag blocks that won't serialize into a category.
      if (isToolboxMode && e.type === BlocklyCore.Events.BLOCK_MOVE) {
        if (workspaceRef.current?.rendered) {
          validateBlockCategories(workspaceRef.current);
        }
      }
      // Emit intermediate change if detected.
      if (e.type === BlocklyCore.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
        onIntermediateChangeRef.current?.();
        return;
      }
      // Only proceed if the event is a user edit that changes the workspace serialization.
      if (
        e.type !== BlocklyCore.Events.BLOCK_CHANGE &&
        e.type !== BlocklyCore.Events.BLOCK_MOVE &&
        e.type !== BlocklyCore.Events.BLOCK_CREATE &&
        e.type !== BlocklyCore.Events.BLOCK_DELETE &&
        e.type !== BlocklyCore.Events.VAR_CREATE &&
        e.type !== BlocklyCore.Events.VAR_RENAME &&
        e.type !== BlocklyCore.Events.VAR_DELETE
      ) {
        return;
      }
      if (!workspaceRef.current) {
        return;
      }
      const serialized = Blockly.serialization.workspaces.save(
        workspaceRef.current
      ) as WorkspaceSerialization;
      currentBlocksRef.current = serialized;
      onWorkspaceChangeRef.current(serialized);
    };

    workspaceRef.current.addChangeListener(onChange);

    return () => {
      workspaceRef.current?.dispose();
      workspaceRef.current = null;
      currentBlocksRef.current = null;
    };
  }, [enabled, sharedBlocks, toolboxDefinition]);

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

  const loadCode = useCallback((source: WorkspaceSerialization) => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }
    pendingLoadsRef.current++;
    try {
      loadBlocksToWorkspace(workspace, JSON.stringify(source));
      // Update ref here (instead of in change listener) since callers may read this synchronously.
      currentBlocksRef.current = source;
    } catch (e) {
      // Decrement the counter if there was an error.
      pendingLoadsRef.current--;
      throw e;
    }
  }, []);

  const getCurrentBlocks = useCallback(() => currentBlocksRef.current, []);

  const getToolboxDefinition = useCallback(
    () =>
      workspaceRef.current
        ? workspaceToToolboxDefinition(workspaceRef.current)
        : null,
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

  return {
    getCode,
    getCurrentBlocks,
    getToolboxDefinition,
    loadCode,
    subscribeToChanges,
  };
}
