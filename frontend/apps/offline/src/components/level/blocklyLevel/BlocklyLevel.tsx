import React, {ReactNode} from 'react';

import type {LevelData} from '@/app/models/level';
import {
  BlocklyWorkspace,
  BlockDefinition,
  BlocklyOptions,
} from '@/components/blockly';
import type {Plugin} from '@/components/blockly/plugins';
import type {Theme, Renderer} from '@/components/blockly/types';
import Workspace from '@/components/workspace';
import Instructions from '@/components/workspace/information/instructions';
import MultipleChoice from '@/components/workspace/information/multipleChoice';
import BlocklyProvider from '@/providers/BlocklyProvider';

import moduleStyles from './blocklyLevel.module.scss';

export interface BlocklyLevelProps {
  levelData: LevelData;
  startBlocks?: string;
  hiddenBlocks?: string;
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
}

const BlocklyLevel: React.FunctionComponent<BlocklyLevelProps> = ({
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
}) => {
  return (
    <BlocklyProvider
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
            <BlocklyWorkspace
              hidden
              options={{
                readOnly: true,
              }}
              startBlocks={hiddenBlocks}
              plugins={plugins}
            />
          )}
          <BlocklyWorkspace
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
            onInject={onInject}
            plugins={plugins}
          />
        </div>
      </Workspace>
    </BlocklyProvider>
  );
};

export default BlocklyLevel;
