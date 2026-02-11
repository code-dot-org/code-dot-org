import React from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

interface DebugPanelProps {
  className?: string;
}

const DebugPanel: React.FunctionComponent<DebugPanelProps> = ({className}) => {
  return (
    <PanelContainer
      id={'debug-panel-container'}
      headerContent={'Debug'}
      className={className}
    >
      <div>Hi!</div>
    </PanelContainer>
  );
};

export default DebugPanel;
