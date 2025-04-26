import React from 'react';

import Blockly, {BlockDefinition} from '@/components/blockly';
import type {BaseLevelProps} from '@/components/level/types';
import Workspace from '@/components/workspace';
import Instructions from '@/components/workspace/information/instructions';
import MultipleChoice from '@/components/workspace/information/multipleChoice';
import BlocklyProvider from '@/providers/BlocklyProvider';

export interface BlocklyLevelProps extends BaseLevelProps {
  levelData: object;
  customBlocks?: BlockDefinition[];
  visualization?: React.Node;
  theme?: string;
  renderer?: string;
  onInject?: () => void;
  forceInsertTopBlock?: string;
  avatar?: string;
}

const BlocklyLevel: React.FunctionComponent<BlocklyLevelProps> = ({
  levelData,
  visualization,
  customBlocks,
  onInject,
  avatar,
  theme,
  renderer,
  forceInsertTopBlock,
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
          startBlocks={levelData.blocklyData.startBlocks}
          toolboxBlocks={levelData.blocklyData.toolboxBlocks}
          forceInsertTopBlock={forceInsertTopBlock}
          onInject={onInject}
        />
      </Workspace>
    </BlocklyProvider>
  );
};

export default BlocklyLevel;
