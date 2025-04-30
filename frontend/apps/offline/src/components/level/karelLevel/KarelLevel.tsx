import React from 'react';

import ThrasosRenderer from '@/components/blockly/renderers/thrasos';
import DefaultTheme from '@/components/blockly/themes/default';
import MazeLevel, {MazeLevelProps} from '@/components/level/mazeLevel';

import * as api from './api';
import blocks from './blocks';
import skins from './skins';

import moduleStyles from './karelLevel.module.scss';

export type KarelLevelProps = MazeLevelProps;

const KarelLevel: React.FunctionComponent<MazeLevelProps> = ({
  levelData,
  customBlocks,
}) => {
  return (
    <MazeLevel
      levelData={levelData}
      theme={DefaultTheme}
      renderer={ThrasosRenderer}
      skins={skins}
      customBlocks={[...blocks, ...(customBlocks || [])]}
      visualizationClassName={moduleStyles.karelMaze}
      api={api}
      options={{
        forceInsertTopBlock: 'when_run',
        grayOutUndeletableBlocks: true,
      }}
    />
  );
};

export default KarelLevel;
