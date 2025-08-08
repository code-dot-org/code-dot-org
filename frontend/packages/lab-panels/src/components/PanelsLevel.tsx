import React from 'react';

import type {LevelData} from '@code-dot-org/models/levels';

import type {PanelsLevelData} from '../types';

import PanelsView from './PanelsView';

export interface PanelsLevelProps {
  levelData: LevelData<PanelsLevelData>;
}

const PanelsLevel: React.FunctionComponent<PanelsLevelProps> = ({levelData}) => {
  return (
    <PanelsView
      panels={levelData.subData?.panels || []}
      background="dark"
      onContinue={() => {}}
      levelId={levelData.key}
      offerBrowserTts
    />
  );
};

export default PanelsLevel;
