import React from 'react';

import Blockly, {BlockDefinition, BlocklyOptions} from '@/components/blockly';
import type {BaseLevelProps} from '@/components/level/types';
import Workspace from '@/components/workspace';
import Instructions from '@/components/workspace/information/instructions';
import MultipleChoice from '@/components/workspace/information/multipleChoice';
import BlocklyProvider from '@/providers/BlocklyProvider';

export interface BlocklyLevelProps extends BaseLevelProps {
  levelData: object;
  data?: object;
  options?: BlocklyOptions;
  customBlocks?: BlockDefinition[];
  visualization?: React.Node;
  theme?: string;
  renderer?: string;
  onInject?: () => void;
  avatar?: string;
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
          options={options}
          startBlocks={levelData.blocklyData.startBlocks}
          toolboxBlocks={levelData.blocklyData.toolboxBlocks}
          onInject={onInject}
        />
      </Workspace>
    </BlocklyProvider>
  );
};

export default BlocklyLevel;
