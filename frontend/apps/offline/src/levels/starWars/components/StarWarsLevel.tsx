import StudioLevel from '@/levels/studio';

import blocks from '../blocks';
import skins from '../skins';

const StarWarsLevel: React.FunctionComponent<MazeLevelProps> = ({
  level,
  customBlocks,
}) => {
  return (
    <StudioLevel
      level={level}
      skins={skins}
      customBlocks={[...blocks, ...(customBlocks || [])]}
    />
  );
};

export default StarWarsLevel;
