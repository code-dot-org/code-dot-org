import React from 'react';

import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import DefaultTheme from '@code-dot-org/blockly-workspace/themes/default';
import MazeLevel, {MazeLevelProps} from '@code-dot-org/lab-maze';

import * as api from '../api';
import blocks from '../blocks';
import skins from '../skins';

import moduleStyles from './karelLevel.module.scss';

export type KarelLevelProps = MazeLevelProps;

const KarelLevel: React.FunctionComponent<KarelLevelProps> = ({
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
    />
  );
};

export default KarelLevel;
