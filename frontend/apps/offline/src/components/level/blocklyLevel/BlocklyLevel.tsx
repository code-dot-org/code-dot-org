import React, {ReactNode} from 'react';

import type {LevelData} from '@/app/models/level';
import Blockly, {BlockDefinition, BlocklyOptions} from '@/components/blockly';
import type {Plugin} from '@/components/blockly/plugins';
import type {Theme, Renderer} from '@/components/blockly/types';
import Workspace from '@/components/workspace';
import Instructions from '@/components/workspace/information/instructions';
import MultipleChoice from '@/components/workspace/information/multipleChoice';
import BlocklyProvider from '@/providers/BlocklyProvider';

export interface BlocklyLevelProps {
  levelData: LevelData;
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
        <Blockly
          data={data}
          options={{
            readOnly: levelData.multipleChoice ? true : undefined,
            ...options,
          }}
          startBlocks={levelData.blocklyData?.startBlocks}
          toolboxBlocks={
            levelData.multipleChoice ? '' : levelData.blocklyData?.toolboxBlocks
          }
          onInject={onInject}
          plugins={plugins}
        />
      </Workspace>
    </BlocklyProvider>
  );
};

export default BlocklyLevel;
