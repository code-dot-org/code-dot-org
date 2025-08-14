import React from 'react';

import type {Level} from '@code-dot-org/models/levels';

import type {LabPanelsData} from '../types';

import PanelsView from './PanelsView';

export interface LabPanelsProps {
  levelData: Level<LabPanelsData>;
}

const LabPanels: React.FunctionComponent<LabPanelsProps> = ({levelData}) => {
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

export default LabPanels;
