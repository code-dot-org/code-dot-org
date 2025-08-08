import React, {useMemo} from 'react';

import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import DefaultTheme from '@code-dot-org/blockly-workspace/themes/default';
import MazeLevel, {MazeLevelProps, skinFor} from '@code-dot-org/lab-maze';

import * as api from '../api';
import blocks from '../blocks';
import skins from '../skins';

import moduleStyles from './karelLevel.module.scss';

export type KarelLevelProps = MazeLevelProps;

const KarelLevel: React.FunctionComponent<KarelLevelProps> = ({
  levelData,
  customBlocks,
}) => {
  // Pull out the skin asset paths
  const skin = useMemo(
    () => skinFor(skins, levelData?.subData?.skinId || 'collector'),
    [levelData],
  );

  return (
    <MazeLevel
      levelData={levelData}
      theme={DefaultTheme}
      renderer={ThrasosRenderer}
      skins={skins}
      customBlocks={[...blocks(skin), ...(customBlocks || [])]}
      visualizationClassName={moduleStyles.karelMaze}
      api={api}
    />
  );
};

export default KarelLevel;
