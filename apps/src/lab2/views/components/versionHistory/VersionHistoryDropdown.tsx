import React from 'react';

import {ProjectVersion} from '@cdo/apps/lab2/types';

interface VersionHistoryDropdownProps {
  versionList: ProjectVersion[];
}

const VersionHistoryDropdown: React.FunctionComponent<
  VersionHistoryDropdownProps
> = ({versionList}) => {
  return (
    <div>
      {versionList.map(version => (
        <div key={version.lastModified}>{version.lastModified}</div>
      ))}
      <div>Start over</div>
    </div>
  );
};

export default VersionHistoryDropdown;
