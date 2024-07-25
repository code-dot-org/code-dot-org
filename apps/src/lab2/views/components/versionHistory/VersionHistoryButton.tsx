import React from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectVersion} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';

import VersionHistoryDropdown from './VersionHistoryDropdown';

const VersionHistoryButton: React.FunctionComponent = () => {
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = React.useState(false);
  const [versionList, setVersionList] = React.useState<ProjectVersion[]>([]);
  const toggleVersionHistory = () => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (!isVersionHistoryOpen && projectManager) {
      projectManager.getVersionList().then(versionList => {
        setVersionList(versionList);
        setIsVersionHistoryOpen(true);
      });
    } else {
      setIsVersionHistoryOpen(!isVersionHistoryOpen);
    }
  };

  return (
    <>
      <Button
        isIconOnly
        icon={{iconStyle: 'solid', iconName: 'history'}}
        color={'black'}
        onClick={toggleVersionHistory}
        ariaLabel={commonI18n.versionHistory_header()}
        size={'xs'}
      />
      {isVersionHistoryOpen && (
        <VersionHistoryDropdown versionList={versionList} />
      )}
    </>
  );
};

export default VersionHistoryButton;
