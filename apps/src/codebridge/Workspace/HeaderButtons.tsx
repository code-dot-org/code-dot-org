import React from 'react';

import VersionHistoryButton from '@cdo/apps/lab2/views/components/versionHistory/VersionHistoryButton';

import {useCodebridgeContext} from '../codebridgeContext';

const WorkspaceHeaderButtons: React.FunctionComponent = () => {
  const {startSource} = useCodebridgeContext();

  return (
    <div>
      <VersionHistoryButton startSource={startSource} />
    </div>
  );
};

export default WorkspaceHeaderButtons;
