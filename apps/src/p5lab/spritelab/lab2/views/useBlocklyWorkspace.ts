import * as BlocklyCore from 'blockly/core';
import {useCallback, useEffect, useRef} from 'react';

import cdoDark from '@cdo/apps/blockly/themes/cdoDark';
import cdoTheme from '@cdo/apps/blockly/themes/cdoTheme';
import {BlockDefinition, WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {loadBlocksToWorkspace} from '@cdo/apps/blockly/utils/workspace/loadBlocks';
import {
  getUserTheme,
  setThemeAndRenderBlocks,
} from '@cdo/apps/blockly/utils/workspace/themes';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';

import {
  ensureInjectedCategories,
  ensurePredefinedBehaviors,
  ensureSceneBlocks,
  filterToolboxToRegisteredBlocks,
  installSharedBlocks,
  setupSpriteLab2BlocklyEnvironment,
} from '../blockly/setup';

export const BLOCKLY_DIV_ID = 'spritelab2-blockly-div';

interface UseBlocklyWorkspaceOptions {
  enabled: boolean;
  toolboxDefinition?: BlocklyCore.utils.toolbox.ToolboxInfo;
  // XML string toolbox format. TODO: switch new levels over to JSON.
  toolboxXml?: string;
  sharedBlocks?: BlockDefinition[];
  theme: 'Light' | 'Dark';
}

interface UseBlocklyWorkspaceResult {
  /** Compile the workspace to JavaScript for the runtime; null before inject. */
  getCode: () => string | null;
  /** Returns the serialization the workspace holds; null before inject. */
  getCurrentBlocks: () => WorkspaceSerialization | null;
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
  toolboxXml,
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
    setupSpriteLab2BlocklyEnvironment();
    installSharedBlocks(sharedBlocks || []);

    const blocklyDiv = document.getElementById(BLOCKLY_DIV_ID);
    if (!blocklyDiv) {
      return;
    }

    // Prefer a JSON toolboxDefinition; otherwise the classic XML string.
    let toolbox:
      | BlocklyCore.utils.toolbox.ToolboxDefinition
      | string
      | undefined =
      toolboxDefinition && toolboxDefinition.contents?.length !== 0
        ? toolboxDefinition
        : undefined;
    if (!toolbox && toolboxXml) {
      // Add the full behavior set, scene blocks, and injected categories,
      // then drop unregistered block references so opening a category never
      // throws.
      toolbox = filterToolboxToRegisteredBlocks(
        ensureInjectedCategories(
          ensureSceneBlocks(ensurePredefinedBehaviors(toolboxXml))
        )
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
  }, [enabled, sharedBlocks, toolboxDefinition, toolboxXml]);

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

  return {getCode, getCurrentBlocks, loadCode, subscribeToChanges};
}
