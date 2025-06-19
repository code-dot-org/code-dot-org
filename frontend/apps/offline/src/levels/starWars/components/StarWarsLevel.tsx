import MazeLevel, {MazeLevelProps} from '@/levels/maze';

import blocks from '../blocks';

const StarWarsLevel: React.FunctionComponent<MazeLevelProps> = ({
  level,
  customBlocks,
}) => {
  return (
    <MazeLevel
      level={level}
      customBlocks={[...blocks, ...(customBlocks || [])]}
    />
  );
};

export default StarWarsLevel;
