import * as BlocklyCore from 'blockly/core';
import {useCallback, useEffect, useRef} from 'react';

import cdoDark from '@cdo/apps/blockly/themes/cdoDark';
import cdoTheme from '@cdo/apps/blockly/themes/cdoTheme';
import {BlockDefinition, WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {loadBlocksToWorkspace} from '@cdo/apps/blockly/utils/workspace/loadBlocks';
import {setThemeAndRenderBlocks} from '@cdo/apps/blockly/utils/workspace/themes';

import {
  ensurePredefinedBehaviors,
  ensureSceneBlocks,
  filterToolboxToRegisteredBlocks,
  installSharedBlocks,
  setupSpriteLab2BlocklyEnvironment,
} from '../blockly/setup';

export const BLOCKLY_DIV_ID = 'spritelab2-blockly-div';

interface UseCodeWorkspaceOptions {
  enabled: boolean;
  toolboxDefinition?: BlocklyCore.utils.toolbox.ToolboxInfo;
  // XML string toolbox format. TODO: switch new levels over to JSON.
  toolboxXml?: string;
  sharedBlocks?: BlockDefinition[];
  theme: 'Light' | 'Dark';
}

interface UseCodeWorkspaceResult {
  /** Compile the workspace to JavaScript for the runtime; null before inject. */
  getCode: () => string | null;
  /** Load code into the workspace. */
  loadSource: (source: WorkspaceSerialization) => void;
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
export default function useCodeWorkspace({
  enabled,
  toolboxDefinition,
  toolboxXml,
  sharedBlocks,
  theme,
}: UseCodeWorkspaceOptions): UseCodeWorkspaceResult {
  const workspaceRef = useRef<BlocklyCore.WorkspaceSvg | null>(null);
  // Theme changes apply at runtime (below); a ref keeps the inject effect
  // from re-injecting on theme change while still injecting with the
  // current theme.
  const themeRef = useRef(theme);
  themeRef.current = theme;
  // Tracks workspace loads (as opposed to user edits).
  const pendingLoadsRef = useRef(0);
  // Listeners arrive via subscribeToChanges (not options) so the hook can be
  // called before the machinery that consumes getCode. Held in refs so the
  // subscription outlives re-injects.
  const onWorkspaceChangeRef = useRef<(source: WorkspaceSerialization) => void>(
    () => {}
  );
  const onIntermediateChangeRef = useRef<(() => void) | undefined>(undefined);

  // Inject the workspace once enabled; re-injects only when the level's
  // blocks/toolbox or the theme change.
  useEffect(() => {
    if (!enabled) {
      return;
    }
    setupSpriteLab2BlocklyEnvironment();
    // Install the level's DB-backed Sprite Lab block pool so the toolbox's
    // block types exist.
    installSharedBlocks(sharedBlocks || []);

    const blocklyDiv = document.getElementById(BLOCKLY_DIV_ID);
    if (!blocklyDiv) {
      return;
    }

    // Prefer a JSON toolboxDefinition; otherwise the classic XML string
    // (Blockly.inject parses XML toolboxes).
    let toolbox:
      | BlocklyCore.utils.toolbox.ToolboxDefinition
      | string
      | undefined =
      toolboxDefinition && toolboxDefinition.contents?.length !== 0
        ? toolboxDefinition
        : undefined;
    if (!toolbox && toolboxXml) {
      // Add the full behavior set + scene blocks, then drop unregistered
      // block references so opening a category never throws.
      toolbox = filterToolboxToRegisteredBlocks(
        ensureSceneBlocks(ensurePredefinedBehaviors(toolboxXml))
      );
    }

    // Variable/behavior naming goes through Blockly.customSimpleDialog —
    // creating a variable crashes without one. Same dialog Music Lab uses.
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
      // Mid-editor field edits (grid painting): follow along in the preview
      // without serializing — the editor-close change event saves.
      if (e.type === BlocklyCore.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
        onIntermediateChangeRef.current?.();
        return;
      }
      if (
        e.type !== BlocklyCore.Events.BLOCK_CHANGE &&
        e.type !== BlocklyCore.Events.BLOCK_MOVE &&
        e.type !== BlocklyCore.Events.BLOCK_CREATE &&
        e.type !== BlocklyCore.Events.BLOCK_DELETE &&
        // Variables live in the workspace serialization too; without these,
        // a newly created/renamed variable isn't saved until some block
        // event happens to fire.
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
      onWorkspaceChangeRef.current(serialized);
    };

    workspaceRef.current.addChangeListener(onChange);

    return () => {
      workspaceRef.current?.dispose();
      workspaceRef.current = null;
    };
  }, [enabled, sharedBlocks, toolboxDefinition, toolboxXml]);

  // Theme changes apply at runtime — the workspace is injected once and
  // never rebuilt, so the caller's reconcile only ever loads content.
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (workspace) {
      setThemeAndRenderBlocks(
        workspace,
        theme === 'Dark' ? cdoDark : cdoTheme,
        workspace.getTheme()
      );
    }
  }, [theme]);

  const getCode = useCallback(
    () =>
      workspaceRef.current
        ? Blockly.JavaScript.workspaceToCode(workspaceRef.current)
        : null,
    []
  );

  const loadSource = useCallback((source: WorkspaceSerialization) => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }
    pendingLoadsRef.current++;
    try {
      loadBlocksToWorkspace(workspace, JSON.stringify(source));
    } catch (e) {
      // Decrement the counter if there was an error.
      pendingLoadsRef.current--;
      throw e;
    }
  }, []);

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

  return {getCode, loadSource, subscribeToChanges};
}
