import React from 'react';

import type {LevelData} from '@/app/models/level';
import Level from '@/levels';

export interface UnitLevelProps {
  levelData: LevelData;
}

const UnitLevel: React.FunctionComponent<UnitLevelProps> = ({levelData}) => {
  return <Level levelData={levelData} />;
};

export default UnitLevel;
