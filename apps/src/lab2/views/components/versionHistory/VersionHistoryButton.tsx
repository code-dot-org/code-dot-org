import classNames from 'classnames';
import React, {useCallback, useState} from 'react';

import Alert from '@cdo/apps/componentLibrary/alert';
import {Button} from '@cdo/apps/componentLibrary/button';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2I18n from '@cdo/apps/lab2/locale';
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
  const menuRef = useOutsideClick<HTMLDivElement>(() => {
    setIsVersionHistoryOpen(false);
    setLoadError(false);
  });

  const [versionList, setVersionList] = useState<ProjectVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const toggleVersionHistory = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLAnchorElement>
    ) => {
      setVersionList([]);
      if (loading) {
        return;
      }
      if (loadError) {
        setLoadError(false);
        return;
      }
      const projectManager = Lab2Registry.getInstance().getProjectManager();
      if (!projectManager) {
        setLoadError(true);
        return;
      }
      if (!isVersionHistoryOpen) {
        setLoading(true);
        projectManager
          .getVersionList()
          .then(versionList => {
            setIsVersionHistoryOpen(true);
            setVersionList(versionList);
            setLoading(false);
          })
          .catch(() => {
            setLoadError(true);
            setLoading(false);
          });
      } else {
        setIsVersionHistoryOpen(false);
      }
    },
    [isVersionHistoryOpen, loadError, loading]
  );

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
      {(isVersionHistoryOpen || loading || loadError) && (
        <div className={moduleStyles.versionHistoryDropdown} ref={menuRef}>
          {loading && (
            <div
              className={classNames(
                moduleStyles.versionHistoryMessage,
                moduleStyles.loadingVersionSpinner
              )}
            >
              <i className="fa fa-spinner fa-spin" />
            </div>
          )}
          {loadError && (
            <div className={moduleStyles.versionHistoryMessage}>
              <Alert
                type="danger"
                text={lab2I18n.versionHistoryLoadFailure()}
                size="s"
              />
            </div>
          )}
          {isVersionHistoryOpen && (
            <VersionHistoryDropdown
              versionList={versionList}
              updatedSourceCallback={updatedSourceCallback}
              startSource={startSource}
              closeDropdown={() => setIsVersionHistoryOpen(false)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default React.memo(VersionHistoryButton);
