import React from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

const DebugPanel: React.FunctionComponent = () => {
  return (
    <PanelContainer id={'debug-panel-container'} headerContent={'Debug'}>
      <div>Hi!</div>
    </PanelContainer>
  );
};

export default DebugPanel;
