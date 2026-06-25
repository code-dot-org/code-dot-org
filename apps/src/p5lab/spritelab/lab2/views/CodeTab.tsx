import * as BlocklyCore from 'blockly/core';
import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';

import cdoDark from '@cdo/apps/blockly/themes/cdoDark';
import cdoTheme from '@cdo/apps/blockly/themes/cdoTheme';
import {BlockDefinition, WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {loadBlocksToWorkspace} from '@cdo/apps/blockly/utils/workspace/loadBlocks';

import {
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
}

interface CodeTabProps {
  initialSource?: WorkspaceSerialization;
  toolboxDefinition?: BlocklyCore.utils.toolbox.ToolboxInfo;
  // Sprite Lab toolbox as an XML string (the classic Sprite Lab toolbox format).
  toolboxXml?: string;
  sharedBlocks?: BlockDefinition[];
  theme: 'Light' | 'Dark';
  // Persist serialized workspace changes back to project sources.
  onSourceChange: (
    source: WorkspaceSerialization,
    toolbox?: BlocklyCore.utils.toolbox.ToolboxInfo
  ) => void;
  // Mark the project as edited (first user change).
  onEdit: () => void;
}

/**
 * The Code tab: a Sprite Lab Blockly workspace we own directly (no StudioApp).
 * The AI generate pane lands in a later phase. Exposes getCode() so the Play
 * tab can run the compiled program.
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
    },
    ref
  ) => {
    const workspace = useRef<BlocklyCore.WorkspaceSvg | null>(null);
    // Keep the latest callbacks without re-injecting the workspace.
    const onSourceChangeRef = useRef(onSourceChange);
    const onEditRef = useRef(onEdit);
    onSourceChangeRef.current = onSourceChange;
    onEditRef.current = onEdit;

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
          onSourceChangeRef.current(serialized, toolboxDefinition);
          onEditRef.current();
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

      // Prefer a JSON toolboxDefinition if present; otherwise use the Sprite Lab
      // XML toolbox string (Blockly.inject parses XML toolboxes). This gives the
      // Code tab the full categorized block set, like a standalone Sprite Lab
      // project.
      let toolbox:
        | BlocklyCore.utils.toolbox.ToolboxDefinition
        | string
        | undefined =
        toolboxDefinition && toolboxDefinition.contents?.length !== 0
          ? toolboxDefinition
          : undefined;
      if (!toolbox && toolboxXml) {
        // Drop any blocks the level's toolbox references that aren't installed
        // in this block pool, so opening a category never throws.
        toolbox = filterToolboxToRegisteredBlocks(toolboxXml);
      }

      workspace.current = Blockly.inject(blocklyDiv, {
        toolbox,
        theme: theme === 'Dark' ? cdoDark : cdoTheme,
        trashcan: true,
      } as BlocklyCore.BlocklyOptions);

      if (initialSource) {
        loadBlocksToWorkspace(
          workspace.current as BlocklyCore.WorkspaceSvg,
          JSON.stringify(initialSource)
        );
      }

      const onChange = (e: BlocklyCore.Events.Abstract) => {
        if (
          e.type !== BlocklyCore.Events.BLOCK_CHANGE &&
          e.type !== BlocklyCore.Events.BLOCK_MOVE &&
          e.type !== BlocklyCore.Events.BLOCK_CREATE &&
          e.type !== BlocklyCore.Events.BLOCK_DELETE
        ) {
          return;
        }
        if (!workspace.current) {
          return;
        }
        const source = Blockly.serialization.workspaces.save(
          workspace.current
        ) as WorkspaceSerialization;
        onSourceChangeRef.current(source, toolboxDefinition);
        onEditRef.current();
      };

      workspace.current.addChangeListener(onChange);

      return () => {
        workspace.current?.dispose();
        workspace.current = null;
      };
      // Re-inject only when the level/blocks/theme change, not on every callback
      // identity change.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sharedBlocks, toolboxDefinition, toolboxXml, theme]);

    return <div id={BLOCKLY_DIV_ID} className={moduleStyles.blocklyDiv} />;
  }
);

CodeTab.displayName = 'CodeTab';

export default CodeTab;
