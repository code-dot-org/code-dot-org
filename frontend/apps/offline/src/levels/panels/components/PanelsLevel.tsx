import React from 'react';

import type {LevelData} from '@/app/models/level';

import PanelsView from './PanelsView';

export interface PanelsLevelProps {
  level: LevelData;
}

const PanelsLevel: React.FunctionComponent<PanelsLevelProps> = ({level}) => {
  return (
    <PanelsView
      panels={level.panels || []}
      background="dark"
      onContinue={() => {}}
      levelId={level.key}
      offerBrowserTts
    />
  );
};

export default PanelsLevel;
