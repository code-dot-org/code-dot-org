import * as BlocklyCore from 'blockly/core';
import {useCallback, useEffect, useRef} from 'react';

import cdoDark from '@cdo/apps/blockly/themes/cdoDark';
import cdoTheme from '@cdo/apps/blockly/themes/cdoTheme';
import {BlockDefinition, WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {loadBlocksToWorkspace} from '@cdo/apps/blockly/utils/workspace/loadBlocks';

import {
  ensurePredefinedBehaviors,
  ensureSceneBlocks,
  filterToolboxToRegisteredBlocks,
  installSharedBlocks,
  setupSpriteLab2BlocklyEnvironment,
} from '../blockly/setup';

export const BLOCKLY_DIV_ID = 'spritelab2-blockly-div';

interface UseCodeWorkspaceOptions {
  // Inject only once the animation/scene stores are seeded: dropdown fields
  // validate saved values against the store at block-load time.
  enabled: boolean;
  // What the workspace shows: the active scene's source. Loaded on (re)inject.
  source?: WorkspaceSerialization;
  toolboxDefinition?: BlocklyCore.utils.toolbox.ToolboxInfo;
  // Sprite Lab toolbox as an XML string (the classic Sprite Lab toolbox format).
  toolboxXml?: string;
  sharedBlocks?: BlockDefinition[];
  theme: 'Light' | 'Dark';
}

interface UseCodeWorkspaceResult {
  // Compile the workspace to JavaScript for the runtime; null before inject.
  getCode: () => string | null;
  // Replace the workspace contents (e.g. from the AI code generator) and emit
  // the workspace-normalized serialization through the change subscription.
  loadCode: (source: WorkspaceSerialization) => void;
  // Swap the workspace to another scene's blocks. Doesn't save or mark
  // edited; the caller owns active-scene bookkeeping.
  loadScene: (source: WorkspaceSerialization) => void;
  // Register the change listeners; returns an unsubscribe (call from an
  // effect). onWorkspaceChange fires with the serialized workspace after a
  // user edit (programmatic loads don't fire it). onIntermediateChange fires
  // on mid-editor field edits (e.g. grid painting), which don't serialize
  // until the editor closes.
  subscribeToChanges: (
    onWorkspaceChange: (source: WorkspaceSerialization) => void,
    onIntermediateChange?: () => void
  ) => () => void;
}

/**
 * A Sprite Lab Blockly workspace owned directly (no StudioApp), rendered into
 * the BLOCKLY_DIV_ID div the caller mounts.
 */
export default function useCodeWorkspace({
  enabled,
  source,
  toolboxDefinition,
  toolboxXml,
  sharedBlocks,
  theme,
}: UseCodeWorkspaceOptions): UseCodeWorkspaceResult {
  const workspaceRef = useRef<BlocklyCore.WorkspaceSvg | null>(null);
  // Suppress the change listener during programmatic loads: those events
  // aren't user edits, and attributing them needs no bookkeeping if they
  // never fire.
  const programmaticLoadRef = useRef(false);
  // Listeners arrive via subscribeToChanges (not options) so the hook can be
  // called before the machinery that consumes getCode. Held in refs so the
  // subscription outlives re-injects.
  const onWorkspaceChangeRef = useRef<(source: WorkspaceSerialization) => void>(
    () => {}
  );
  const onIntermediateChangeRef = useRef<(() => void) | undefined>(undefined);
  // The latest source, read at (re)inject time without re-injecting on change.
  const sourceRef = useRef(source);
  sourceRef.current = source;

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
      theme: theme === 'Dark' ? cdoDark : cdoTheme,
      trashcan: true,
      customSimpleDialog,
    } as BlocklyCore.BlocklyOptions);

    // CDO Blockly shrinks the container by the workspace-header height to
    // leave room for a header bar we don't render, leaving a gap at the
    // bottom. Reclaim the full height and resize the workspace SVG to fill.
    blocklyDiv.style.height = '100%';
    Blockly.svgResize(workspaceRef.current);

    // Load before attaching the listener, so the initial load doesn't emit.
    if (sourceRef.current) {
      loadBlocksToWorkspace(
        workspaceRef.current as BlocklyCore.WorkspaceSvg,
        JSON.stringify(sourceRef.current)
      );
    }

    const onChange = (e: BlocklyCore.Events.Abstract) => {
      if (programmaticLoadRef.current) {
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
  }, [enabled, sharedBlocks, toolboxDefinition, toolboxXml, theme]);

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
    programmaticLoadRef.current = true;
    try {
      loadBlocksToWorkspace(workspace, JSON.stringify(source));
    } finally {
      programmaticLoadRef.current = false;
    }
    // Persist what the workspace made of the loaded code, not the input.
    onWorkspaceChangeRef.current(
      Blockly.serialization.workspaces.save(workspace) as WorkspaceSerialization
    );
  }, []);

  const loadScene = useCallback((source: WorkspaceSerialization) => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }
    programmaticLoadRef.current = true;
    try {
      // Replaces the contents (load clears first).
      Blockly.serialization.workspaces.load(source as object, workspace);
    } finally {
      programmaticLoadRef.current = false;
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

  return {getCode, loadCode, loadScene, subscribeToChanges};
}
