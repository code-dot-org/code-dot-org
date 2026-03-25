import * as BlocklyCore from 'blockly/core';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import cdoDark from '@cdo/apps/blockly/themes/cdoDark';

import {setItemEntries} from './blockly/imageRegistry';
import {setupGame2BlocklyEnvironment} from './blockly/setup';
import CodeGeneratePane from './CodeGeneratePane';
import {Game2ItemEntry} from './types';

import moduleStyles from './game2View.module.scss';

const BLOCKLY_DIV_ID = 'game2-blockly-div';

const TOOLBOX: BlocklyCore.utils.toolbox.ToolboxDefinition = {
  kind: 'flyoutToolbox',
  contents: [
    {kind: 'block', type: 'Game2_whenStart'},
    {kind: 'block', type: 'Game2_createItem'},
    {kind: 'block', type: 'Game2_setItemBehavior'},
    {kind: 'block', type: 'Game2_setBackground'},
    {kind: 'block', type: 'Game2_startScoring'},
    {kind: 'block', type: 'Game2_increaseScore'},
    {kind: 'block', type: 'Game2_decreaseScore'},
    {kind: 'block', type: 'Game2_whenJumpPressed'},
    {kind: 'block', type: 'Game2_whenCollide'},
    {kind: 'block', type: 'Game2_removeItem'},
    {kind: 'block', type: 'Game2_showText'},
    {kind: 'block', type: 'Game2_ifCondition'},
    {kind: 'block', type: 'Game2_jump'},
    {kind: 'block', type: 'Game2_bigJump'},
  ],
};

export interface CodePanelHandle {
  getCode: () => string;
}

interface CodePanelProps {
  visible: boolean;
  items: Game2ItemEntry[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialBlocks?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBlocksChange: (blocks: Record<string, any>) => void;
}

const CodePanel = forwardRef<CodePanelHandle, CodePanelProps>(
  ({visible, items, initialBlocks, onBlocksChange}, ref) => {
    const workspace = useRef<BlocklyCore.WorkspaceSvg | null>(null);
    const initialBlocksLoaded = useRef(false);

    // Register Game2 blocks once.
    useEffect(setupGame2BlocklyEnvironment, []);

    // Keep image dropdown options in sync.
    useEffect(() => {
      setItemEntries(items);
    }, [items]);

    // Expose getCode to parent via ref.
    useImperativeHandle(
      ref,
      () => ({
        getCode: () => {
          if (!workspace.current) {
            return '';
          }
          return Blockly.JavaScript.workspaceToCode(workspace.current);
        },
      }),
      []
    );

    const initWorkspace = useCallback(() => {
      if (workspace.current) {
        return;
      }
      const blocklyDiv = document.getElementById(BLOCKLY_DIV_ID);
      if (!blocklyDiv) {
        return;
      }
      workspace.current = Blockly.inject(blocklyDiv, {
        toolbox: TOOLBOX,
        theme: cdoDark,
      } as BlocklyCore.BlocklyOptions);

      // Ensure image names are populated before loading saved blocks.
      setItemEntries(items);

      // Load saved blocks if available.
      if (initialBlocks && !initialBlocksLoaded.current) {
        try {
          Blockly.serialization.workspaces.load(
            initialBlocks,
            workspace.current
          );
        } catch (e) {
          // Legacy blocks may have incompatible field types — start fresh.
          console.warn('[Game2] Could not load saved blocks:', e);
          workspace.current.clear();
        }
        initialBlocksLoaded.current = true;
      }

      // Listen for changes and notify parent.
      workspace.current.addChangeListener(
        (event: BlocklyCore.Events.Abstract) => {
          if (
            event.isUiEvent ||
            event.type === Blockly.Events.VIEWPORT_CHANGE
          ) {
            return;
          }
          if (workspace.current) {
            const state = Blockly.serialization.workspaces.save(
              workspace.current
            );
            onBlocksChange(state);
          }
        }
      );
    }, [items, initialBlocks, onBlocksChange]);

    // Initialize workspace when the panel becomes visible.
    useEffect(() => {
      if (visible) {
        requestAnimationFrame(() => {
          initWorkspace();
          if (workspace.current) {
            Blockly.svgResize(workspace.current);
          }
        });
      }
    }, [visible, initWorkspace]);

    // Resize Blockly whenever the window resizes. The container always
    // has real layout dimensions (visibility:hidden, not display:none),
    // so this works even when the Code tab is not active.
    useEffect(() => {
      const onResize = () => {
        if (workspace.current) {
          Blockly.svgResize(workspace.current);
        }
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);

    // Clean up workspace on unmount.
    useEffect(() => {
      return () => {
        workspace.current?.dispose();
        workspace.current = null;
      };
    }, []);

    const handleCodeGenerated = useCallback(
      (blocklyJson: Record<string, unknown>) => {
        if (!workspace.current) {
          return;
        }
        // Clear existing blocks and load the AI-generated ones.
        workspace.current.clear();
        try {
          Blockly.serialization.workspaces.load(blocklyJson, workspace.current);
        } catch (e) {
          console.warn('[Game2] Could not load generated blocks:', e);
        }
        // Notify parent of the change.
        const state = Blockly.serialization.workspaces.save(workspace.current);
        onBlocksChange(state);
      },
      [onBlocksChange]
    );

    return (
      <div className={moduleStyles.codePanelWrapper}>
        <div id={BLOCKLY_DIV_ID} className={moduleStyles.codePanel} />
        <CodeGeneratePane items={items} onCodeGenerated={handleCodeGenerated} />
      </div>
    );
  }
);

CodePanel.displayName = 'CodePanel';

export default CodePanel;
