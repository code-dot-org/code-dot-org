import MazeLevel from '../mazeLevel';

import blocks from './blocks';

const StarWarsLevel: React.FunctionComponent<MazeLevelProps> = ({
  levelData,
  customBlocks,
}) => {
  return (
    <MazeLevel
      levelData={levelData}
      customBlocks={[...blocks, ...(customBlocks || [])]}
    />
  );
};

export default StarWarsLevel;
