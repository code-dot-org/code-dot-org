import React, {useState} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectSources, ProjectVersion} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';
import useOutsideClick from '@cdo/apps/util/hooks/useOutsideClick';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import VersionHistoryDropdown from './VersionHistoryDropdown';

import moduleStyles from './version-history.module.scss';

interface VersionHistoryProps {
  startSource: ProjectSources;
  updatedSourceCallback?: (source: ProjectSources) => void;
}

/**
 * Button that opens a dropdown with a list of versions for the current project.
 */
const VersionHistoryButton: React.FunctionComponent<VersionHistoryProps> = ({
  startSource,
  updatedSourceCallback,
}) => {
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const menuRef = useOutsideClick<HTMLDivElement>(() =>
    setIsVersionHistoryOpen(false)
  );

  const [versionList, setVersionList] = useState<ProjectVersion[]>([]);

  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const toggleVersionHistory = (
    e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLAnchorElement>
  ) => {
    setVersionList([]);
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
        disabled={isReadOnly}
      />
      {isVersionHistoryOpen && (
        <div className={moduleStyles.versionHistoryDropdown} ref={menuRef}>
          <VersionHistoryDropdown
            versionList={versionList}
            updatedSourceCallback={updatedSourceCallback}
            startSource={startSource}
            closeDropdown={() => setIsVersionHistoryOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default VersionHistoryButton;
