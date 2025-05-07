import React from 'react';

import type {LevelData} from '@/app/models/level';

import PanelsView from './PanelsView';

export interface PanelsLevelProps {
  levelData: LevelData;
}

const PanelsLevel: React.FunctionComponent<PanelsLevelProps> = ({
  levelData,
}) => {
  return (
    <div>
      <div>
        <PanelsView panels={levelData.panels || []} offerBrowserTts />
      </div>
    </div>
  );
};

export default PanelsLevel;
