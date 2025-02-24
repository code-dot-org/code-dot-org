import Alert from '@code-dot-org/component-library/alert';
import {Button} from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import {
  WithTooltip,
  TooltipProps,
} from '@code-dot-org/component-library/tooltip';
import {Heading6} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import {usePositionPortalDropdown} from '@cdo/apps/lab2/hooks/usePositionPortalDropdown';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2I18n from '@cdo/apps/lab2/locale';
import {ProjectSources, ProjectVersion} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';
import useOutsideClick from '@cdo/apps/util/hooks/useOutsideClick';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import VersionHistoryDropdown from './VersionHistoryDropdown';

import moduleStyles from './version-history.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

interface VersionHistoryProps {
  startSources: ProjectSources;
  updatedSourceCallback?: (source: ProjectSources) => void;
}

/**
 * Button that opens a dropdown with a list of versions for the current project.
 */
const VersionHistoryButton: React.FunctionComponent<VersionHistoryProps> = ({
  startSources,
  updatedSourceCallback,
}) => {
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [versionList, setVersionList] = useState<ProjectVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const isViewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const closeLoadMenu = useCallback(() => {
    setIsVersionHistoryOpen(false);
    setLoadError(false);
  }, []);

  const loadMenuRef = useOutsideClick<HTMLDivElement>(() => {
    closeLoadMenu();
  });

  const loadMenuStyles = usePositionPortalDropdown(
    loadMenuRef.current,
    buttonContainerRef.current,
    loading || loadError,
    'right',
    'loading dropdown'
  );

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
        setTimeout(() => {
          projectManager
            .getVersionList()
            .then(versionList => {
              setVersionList(versionList);
              setIsVersionHistoryOpen(true);
              setLoading(false);
            })
            .catch(() => {
              setLoadError(true);
              setLoading(false);
            });
        }, 0);
      } else {
        setIsVersionHistoryOpen(false);
      }
    },
    [isVersionHistoryOpen, loadError, loading]
  );

  useEffect(() => {
    if (loading || loadError) {
      const closeButton = document.getElementById('close-load-menu-button');
      console.log(`going to try to focus on ${closeButton}`);
      setTimeout(() => closeButton?.focus(), 0);
    }
  }, [loading, loadError, loadMenuStyles]);

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
          color={'white'}
          onClick={toggleVersionHistory}
          ariaLabel={commonI18n.versionHistory_header()}
          size={'xs'}
          disabled={buttonDisabled}
          type={'tertiary'}
          className={darkModeStyles.tertiaryButton}
        />
      </WithTooltip>
      {createPortal(
        <div
          className={moduleStyles.versionHistoryDropdown}
          ref={loadMenuRef}
          style={loadMenuStyles}
        >
          <div className={moduleStyles.versionHistoryHeader}>
            <Heading6 className={moduleStyles.versionHistoryTitle}>
              {commonI18n.versionHistory_header()}
            </Heading6>
            <CloseButton
              onClick={closeLoadMenu}
              aria-label={lab2I18n.closeVersionHistory()}
              id={'close-load-menu-button'}
            />
          </div>
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
        </div>,
        document.body
      )}
      <VersionHistoryDropdown
        versionList={versionList}
        updatedSourceCallback={updatedSourceCallback}
        startSources={startSources}
        closeDropdown={() => setIsVersionHistoryOpen(false)}
        isOpen={isVersionHistoryOpen}
        buttonRef={buttonContainerRef.current}
      />
    </div>
  );
};

export default React.memo(VersionHistoryButton);
