import * as Blockly from 'blockly/core';
import React, {ReactNode, useRef} from 'react';

import type {LevelData} from '@/app/models/level';
import {
  BlocklyWorkspace,
  BlockDefinition,
  BlocklyOptions,
} from '@/components/blockly';
import type {Plugin} from '@/components/blockly/plugins';
import type {
  Theme,
  Renderer,
  Environment,
  BlocklySerialization,
} from '@/components/blockly/types';
import Workspace from '@/components/workspace';
import Instructions from '@/components/workspace/information/instructions';
import MultipleChoice from '@/components/workspace/information/multipleChoice';
import BlocklyProvider from '@/providers/BlocklyProvider';

import moduleStyles from './blocklyLevel.module.scss';

/**
 * Specific environmental information for all blockly environments.
 */
export interface BlocklyLevelEnvironment extends Environment {
  /** The main workspace reference, when available. */
  mainWorkspace?: Blockly.Workspace;
  /** The hidden workspace reference, when provided. */
  hiddenWorkspace?: Blockly.Workspace;
}

export type BlocklyLevelProps<
  T extends BlocklyLevelEnvironment = BlocklyLevelEnvironment,
> = {
  levelData: LevelData;
  startBlocks?: BlocklySerialization;
  hiddenBlocks?: BlocklySerialization;
  data?: object;
  options?: BlocklyOptions;
  customBlocks?: BlockDefinition[];
  visualization?: ReactNode;
  theme?: Theme;
  renderer?: Renderer;
  onInject?: () => void;
  avatar?: string;
  /** A set of plugins to install to this workspace */
  plugins?: Plugin[];
  /** The environmental information to give to all extensions */
  environment?: T;
};

function BlocklyLevel<
  T extends BlocklyLevelEnvironment = BlocklyLevelEnvironment,
>({
  levelData,
  startBlocks,
  hiddenBlocks,
  data,
  options,
  visualization,
  customBlocks,
  onInject,
  avatar,
  theme,
  renderer,
  plugins,
  environment,
}: BlocklyLevelProps<T>): React.ReactElement {
  const workspaceRef = useRef<Blockly.Workspace | null>(null);
  const hiddenWorkspaceRef = useRef<Blockly.Workspace | null>(null);

  return (
    <BlocklyProvider
      environment={environment as unknown as Environment}
      customBlocks={customBlocks}
      theme={theme}
      plugins={plugins}
      renderer={renderer}
    >
      <Workspace
        outputPane={visualization}
        tabs={[
          {
            value: 'instructions',
            text: 'Instructions',
            tabContent: levelData.multipleChoice ? (
              <MultipleChoice multipleChoice={levelData.multipleChoice} />
            ) : (
              <Instructions
                avatar={avatar}
                instructions={levelData.longInstructions || ''}
                hints={levelData.hints}
              />
            ),
          },
          {
            value: 'teachers',
            text: 'For Teachers Only',
            tabContent: <div>Teachers</div>,
          },
        ]}
      >
        <div className={moduleStyles.blocklyLevel}>
          {hiddenBlocks && (
            <BlocklyWorkspace<T>
              hidden
              options={{
                readOnly: true,
              }}
              startBlocks={hiddenBlocks}
              plugins={plugins}
              onInject={() => {
                // Retain the hidden workspace in the environment, if it exists
                if (environment) {
                  environment.hiddenWorkspace =
                    hiddenWorkspaceRef.current || undefined;
                }
              }}
              workspaceRef={hiddenWorkspaceRef}
            />
          )}
          <BlocklyWorkspace<T>
            data={data}
            options={{
              readOnly: levelData.multipleChoice ? true : undefined,
              ...options,
            }}
            startBlocks={
              startBlocks ||
              levelData.template?.blocklyData?.startBlocks ||
              levelData.blocklyData?.startBlocks
            }
            toolboxBlocks={
              levelData.multipleChoice
                ? undefined
                : levelData.blocklyData?.toolboxBlocks?.contents?.length === 0
                  ? undefined
                  : levelData.blocklyData?.toolboxBlocks
            }
            onInject={() => {
              // Retain the main workspace in the environment, if it exists
              if (environment) {
                environment.mainWorkspace = workspaceRef.current || undefined;
              }

              if (onInject) {
                onInject();
              }
            }}
            workspaceRef={workspaceRef}
            plugins={plugins}
          />
        </div>
      </Workspace>
    </BlocklyProvider>
  );
}

export default BlocklyLevel;
