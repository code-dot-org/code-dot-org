import React, {memo, useCallback, useRef, useState} from 'react';

import {Button} from '@code-dot-org/component-library/button';
import {
  WithTooltip,
  TooltipProps,
  WithTooltipHandle,
} from '@code-dot-org/component-library/tooltip';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectSources, ProjectVersion} from '@cdo/apps/lab2/types';

import {useApp} from '@lab2-base/contexts';

import VersionHistoryDropdown from './VersionHistoryDropdown';

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
  const isReadOnly = useApp().isReadOnlyWorkspace;
  const isViewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<WithTooltipHandle>(null);

  // The version history button is generally disabled in read only mode with two exceptions:
  // if the user is viewing an old version of the project, or if this is a teacher viewing
  // a student's project (in which case they can view old versions, but not restore them).
  const buttonDisabled = isReadOnly && !isViewingOldVersion && !viewAsUserId;
  const toggleVersionHistory = useCallback(
    (
      _:
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
    tooltipRef.current?.hideTooltip(); // Hide tooltip when dropdown closes.
  }, []);

  const tooltipProps: TooltipProps = {
    text: 'Version History',
    direction: 'onBottom',
    tooltipId: 'version-history-tooltip',
    size: 'xs',
    hideTail: true,
  };

  return (
    <div ref={buttonContainerRef}>
      <WithTooltip tooltipProps={tooltipProps} ref={tooltipRef}>
        <Button
          isIconOnly
          icon={{iconStyle: 'solid', iconName: 'history'}}
          onClick={toggleVersionHistory}
          ariaLabel='Version History'
          size={'xs'}
          disabled={buttonDisabled}
          type={'tertiary'}
          color={'black'}
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

export default memo(VersionHistoryButton);
