import {Button} from '@code-dot-org/component-library/button';
import {
  WithTooltip,
  TooltipProps,
} from '@code-dot-org/component-library/tooltip';
import React, {useCallback, useRef, useState} from 'react';

import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectSources, ProjectVersion} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import VersionHistoryDropdown from './VersionHistoryDropdown';

import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

interface VersionHistoryProps {
  startSources: ProjectSources;
  updatedSourceCallback?: (source: ProjectSources) => void;
  appName: string;
}

/**
 * Button that opens a dropdown with a list of versions for the current project.
 */
const VersionHistoryButton: React.FunctionComponent<VersionHistoryProps> = ({
  startSources,
  updatedSourceCallback,
  appName,
}) => {
  const [isVersionListLoaded, setIsVersionListLoaded] = useState(false);
  const [versionList, setVersionList] = useState<ProjectVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const isViewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  // The version history button is generally disabled in read only mode with two exceptions:
  // if the user is viewing an old version of the project, or if this is a teacher viewing
  // a student's project (in which case they can view old versions, but not restore them).
  const buttonDisabled = isReadOnly && !isViewingOldVersion && !viewAsUserId;
  const toggleVersionHistory = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLAnchorElement>
    ) => {
      const projectManager = Lab2Registry.getInstance().getProjectManager();
      if (!projectManager) {
        setLoadError(true);
        return;
      }
      if (!isVersionListLoaded) {
        setLoading(true);
        projectManager
          .getVersionList()
          .then(versionList => {
            setVersionList(versionList);
            setIsVersionListLoaded(true);
            setLoading(false);
          })
          .catch(() => {
            setLoadError(true);
            setLoading(false);
          });
      } else {
        setIsVersionListLoaded(false);
        setLoadError(false);
        setLoading(false);
      }
    },
    [isVersionListLoaded]
  );

  const closeVersionHistory = useCallback(() => {
    setIsVersionListLoaded(false);
    setLoadError(false);
    setLoading(false);
  }, []);

  const tooltipProps: TooltipProps = {
    text: commonI18n.versionHistory_header(),
    direction: 'onLeft',
    tooltipId: 'version-history-tooltip',
    size: 'xs',
    className: darkModeStyles.tooltipLeft,
  };

  return (
    <div ref={buttonContainerRef}>
      <WithTooltip tooltipProps={tooltipProps}>
        <Button
          isIconOnly
          icon={{iconStyle: 'solid', iconName: 'history'}}
          onClick={toggleVersionHistory}
          ariaLabel={commonI18n.versionHistory_header()}
          size={'xs'}
          disabled={buttonDisabled}
          type={'tertiary'}
          className={darkModeStyles.tertiaryButton}
        />
      </WithTooltip>
      {(isVersionListLoaded || loadError || loading) && (
        <VersionHistoryDropdown
          versionList={versionList}
          updatedSourceCallback={updatedSourceCallback}
          startSources={startSources}
          closeDropdown={closeVersionHistory}
          listLoaded={isVersionListLoaded}
          buttonRef={buttonContainerRef}
          listLoadError={loadError}
          listLoading={loading}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          appName={appName}
        />
      )}
    </div>
  );
};

export default React.memo(VersionHistoryButton);
