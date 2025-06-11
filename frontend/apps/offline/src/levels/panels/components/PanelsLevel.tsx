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
    <PanelsView
      panels={levelData.panels || []}
      background="dark"
      onContinue={() => {}}
      levelId={levelData.key}
      offerBrowserTts
    />
  );
};

export default PanelsLevel;
