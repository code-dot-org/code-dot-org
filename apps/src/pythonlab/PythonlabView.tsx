// Pythonlab view
import React from 'react';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import PythonEditor from './PythonEditor';

const PythonlabView: React.FunctionComponent = () => {
  return (
    <div>
      <PanelContainer
        id="instructions-panel"
        headerText="Instructions"
        hideHeaders={false}
      >
        <Instructions />
      </PanelContainer>
      <PythonEditor />
    </div>
  );
};

export default PythonlabView;
