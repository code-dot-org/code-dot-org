import React from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import DebugPanelRightHeaderButtons from './DebugPanelRightHeaderButtons';
import NetworkPanel from './NetworkPanel';

//import moduleStyles from './debug-panel.module.scss';

interface DebugPanelProps {
  className?: string;
}

const DebugPanel: React.FunctionComponent<DebugPanelProps> = ({className}) => {
  return (
    <PanelContainer
      id={'debug-panel-container'}
      headerContent={'Debug'}
      className={className}
      rightHeaderContent={<DebugPanelRightHeaderButtons />}
    >
      <NetworkPanel />
    </PanelContainer>
  );
};

export default DebugPanel;
