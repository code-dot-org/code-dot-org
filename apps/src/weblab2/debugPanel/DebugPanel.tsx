import React from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import DebugPanelLeftHeaderButtons from './DebugPanelLeftHeaderButtons';
import DebugPanelRightHeaderButtons from './DebugPanelRightHeaderButtons';
import NetworkPanel from './NetworkPanel';

//import moduleStyles from './debug-panel.module.scss';

interface DebugPanelProps {
  className?: string;
}

const DebugPanel: React.FunctionComponent<DebugPanelProps> = ({className}) => {
  const [selectedPanel, setSelectedPanel] = React.useState<
    'network' | 'console'
  >('console');
  return (
    <PanelContainer
      id={'debug-panel-container'}
      headerContent={'Debug'}
      className={className}
      rightHeaderContent={<DebugPanelRightHeaderButtons />}
      leftHeaderContent={
        <DebugPanelLeftHeaderButtons
          selectedPanel={selectedPanel}
          setSelectedPanel={setSelectedPanel}
        />
      }
    >
      {selectedPanel === 'network' && <NetworkPanel />}
      {selectedPanel === 'console' && <div>Console!</div>}
    </PanelContainer>
  );
};

export default DebugPanel;
