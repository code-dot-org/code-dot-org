import * as BlocklyCore from 'blockly/core';
import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';

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

import moduleStyles from './sprite-lab2-view.module.scss';

export const BLOCKLY_DIV_ID = 'spritelab2-blockly-div';

export interface CodeTabHandle {
  // Compile the current workspace to JavaScript for the runtime.
  getCode: () => string;
  // Replace the workspace contents with the given serialization (e.g. from the
  // AI code generator).
  loadCode: (source: WorkspaceSerialization) => void;
  // Swap the workspace to another scene's blocks, without marking the project
  // edited. The caller flips its active-scene bookkeeping BEFORE calling so
  // the change events this fires save under the new scene.
  loadScene: (source: WorkspaceSerialization) => void;
}

interface CodeTabProps {
  initialSource?: WorkspaceSerialization;
  toolboxDefinition?: BlocklyCore.utils.toolbox.ToolboxInfo;
  // Sprite Lab toolbox as an XML string (the classic Sprite Lab toolbox format).
  toolboxXml?: string;
  sharedBlocks?: BlockDefinition[];
  theme: 'Light' | 'Dark';
  // Persist serialized workspace changes back to project sources.
  onSourceChange: (source: WorkspaceSerialization) => void;
  // Mark the project as edited (first user change).
  onEdit: () => void;
  // Fired on mid-editor field edits (e.g. grid painting) so the preview can
  // follow along; the editor-close change event does the save.
  onIntermediateChange?: () => void;
}

/**
 * The Code tab: a Sprite Lab Blockly workspace owned directly (no StudioApp).
 * Exposes getCode() so the runtime can run the compiled program.
 */
const CodeTab = forwardRef<CodeTabHandle, CodeTabProps>(
  (
    {
      initialSource,
      toolboxDefinition,
      toolboxXml,
      sharedBlocks,
      theme,
      onSourceChange,
      onEdit,
      onIntermediateChange,
    },
    ref
  ) => {
    const workspace = useRef<BlocklyCore.WorkspaceSvg | null>(null);
    // Keep the latest callbacks without re-injecting the workspace.
    const onSourceChangeRef = useRef(onSourceChange);
    const onEditRef = useRef(onEdit);
    const onIntermediateChangeRef = useRef(onIntermediateChange);
    onSourceChangeRef.current = onSourceChange;
    onEditRef.current = onEdit;
    onIntermediateChangeRef.current = onIntermediateChange;
    // Read via ref at inject time only: initialSource's identity changes on
    // every save (it derives from currentSources), and in the scenes variant
    // it's always scenes[0], which may not be the scene open in the
    // workspace.
    const initialSourceRef = useRef(initialSource);
    initialSourceRef.current = initialSource;

    useImperativeHandle(ref, () => ({
      getCode: () =>
        workspace.current
          ? Blockly.JavaScript.workspaceToCode(workspace.current)
          : '',
      loadCode: (source: WorkspaceSerialization) => {
        if (workspace.current) {
          loadBlocksToWorkspace(
            workspace.current as BlocklyCore.WorkspaceSvg,
            JSON.stringify(source)
          );
          const serialized = Blockly.serialization.workspaces.save(
            workspace.current
          ) as WorkspaceSerialization;
          onSourceChangeRef.current(serialized);
          onEditRef.current();
        }
      },
      loadScene: (source: WorkspaceSerialization) => {
        if (workspace.current) {
          // Replaces the contents (load clears first), without loadCode's
          // save/mark-edited side effects.
          Blockly.serialization.workspaces.load(
            source as object,
            workspace.current
          );
        }
      },
    }));

    // Inject the workspace once on mount.
    useEffect(() => {
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

      workspace.current = Blockly.inject(blocklyDiv, {
        toolbox,
        theme: theme === 'Dark' ? cdoDark : cdoTheme,
        trashcan: true,
        customSimpleDialog,
      } as BlocklyCore.BlocklyOptions);

      // CDO Blockly shrinks the container by the workspace-header height to
      // leave room for a header bar we don't render, leaving a gap at the
      // bottom. Reclaim the full height and resize the workspace SVG to fill.
      blocklyDiv.style.height = '100%';
      Blockly.svgResize(workspace.current);

      if (initialSourceRef.current) {
        loadBlocksToWorkspace(
          workspace.current as BlocklyCore.WorkspaceSvg,
          JSON.stringify(initialSourceRef.current)
        );
      }

      const onChange = (e: BlocklyCore.Events.Abstract) => {
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
        if (!workspace.current) {
          return;
        }
        const source = Blockly.serialization.workspaces.save(
          workspace.current
        ) as WorkspaceSerialization;
        onSourceChangeRef.current(source);
        onEditRef.current();
      };

      workspace.current.addChangeListener(onChange);

      return () => {
        workspace.current?.dispose();
        workspace.current = null;
      };
      // Re-injects only when the level's blocks/toolbox or the theme change;
      // callbacks and initialSource are read through refs.
    }, [sharedBlocks, toolboxDefinition, toolboxXml, theme]);

    return <div id={BLOCKLY_DIV_ID} className={moduleStyles.blocklyDiv} />;
  }
);

CodeTab.displayName = 'CodeTab';

export default CodeTab;
