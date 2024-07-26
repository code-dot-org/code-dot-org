import React, {useState} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectSources, ProjectVersion} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';

import VersionHistoryDropdown from './VersionHistoryDropdown';

import moduleStyles from './version-history.module.scss';

interface VersionHistoryProps {
  startSource: ProjectSources;
  updatedSourceCallback?: (source: ProjectSources) => void;
}

const VersionHistoryButton: React.FunctionComponent<VersionHistoryProps> = ({
  startSource,
  updatedSourceCallback,
}) => {
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect>();
  const [offsetParent, setOffsetParent] = useState<DOMRect>();

  const [versionList, setVersionList] = React.useState<ProjectVersion[]>([]);
  const toggleVersionHistory = (
    e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLAnchorElement>
  ) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    setButtonRect((e.target as HTMLElement).getBoundingClientRect());
    setOffsetParent(
      (e.target as HTMLElement).offsetParent?.getBoundingClientRect()
    );
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
      {isVersionHistoryOpen && buttonRect && offsetParent && (
        <div
          style={{
            top:
              buttonRect.top + buttonRect.height + 5 - (offsetParent.top || 0),
            right: buttonRect['right'] - (offsetParent['right'] || 0) + 5,
          }}
          className={moduleStyles.versionHistoryDropdown}
        >
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
