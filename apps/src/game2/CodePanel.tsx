import * as BlocklyCore from 'blockly/core';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import cdoDark from '@cdo/apps/blockly/themes/cdoDark';

import {setImageNames} from './blockly/imageRegistry';
import {setupGame2BlocklyEnvironment} from './blockly/setup';
import moduleStyles from './game2View.module.scss';
import {Game2ImageEntry} from './types';

const BLOCKLY_DIV_ID = 'game2-blockly-div';

const TOOLBOX: BlocklyCore.utils.toolbox.ToolboxDefinition = {
  kind: 'flyoutToolbox',
  contents: [
    {kind: 'block', type: 'Game2_whenStart'},
    {kind: 'block', type: 'Game2_createItem'},
    {kind: 'block', type: 'Game2_setItemBehavior'},
  ],
};

export interface CodePanelHandle {
  getCode: () => string;
}

interface CodePanelProps {
  visible: boolean;
  images: Game2ImageEntry[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialBlocks?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBlocksChange: (blocks: Record<string, any>) => void;
}

const CodePanel = forwardRef<CodePanelHandle, CodePanelProps>(
  ({visible, images, initialBlocks, onBlocksChange}, ref) => {
    const workspace = useRef<BlocklyCore.WorkspaceSvg | null>(null);
    const initialBlocksLoaded = useRef(false);

    // Register Game2 blocks once.
    useEffect(setupGame2BlocklyEnvironment, []);

    // Keep image dropdown options in sync.
    useEffect(() => {
      setImageNames(images.map(img => img.filename));
    }, [images]);

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

      // Load saved blocks if available.
      if (initialBlocks && !initialBlocksLoaded.current) {
        Blockly.serialization.workspaces.load(
          initialBlocks,
          workspace.current
        );
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
    }, [initialBlocks, onBlocksChange]);

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

    // Resize Blockly whenever the window resizes.
    useEffect(() => {
      const onResize = () => {
        if (workspace.current && visible) {
          Blockly.svgResize(workspace.current);
        }
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, [visible]);

    // Clean up workspace on unmount.
    useEffect(() => {
      return () => {
        workspace.current?.dispose();
        workspace.current = null;
      };
    }, []);

    return <div id={BLOCKLY_DIV_ID} className={moduleStyles.codePanel} />;
  }
);

CodePanel.displayName = 'CodePanel';

export default CodePanel;
