import Alert from '@code-dot-org/component-library/alert';
import {Button} from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {RadioButton} from '@code-dot-org/component-library/radioButton';
import Tags from '@code-dot-org/component-library/tags';
import {Heading6} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import {sendCodebridgeAnalyticsEvent} from '@cdo/apps/codebridge/utils/analyticsReporterHelper';
import useDropdownPosition from '@cdo/apps/lab2/hooks/useDropdownPosition';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2I18n from '@cdo/apps/lab2/locale';
import {
  setProjectSource,
  setViewingOldVersion,
  setRestoredOldVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {
  loadVersion,
  previewStartSources,
  resetToCurrentVersion,
  setAndSaveProjectSources,
} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {ProjectSources, ProjectVersion} from '@cdo/apps/lab2/types';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import currentLocale from '@cdo/apps/util/currentLocale';
import useOutsideClick from '@cdo/apps/util/hooks/useOutsideClick';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './version-history.module.scss';

interface VersionHistoryDropdownProps {
  versionList: ProjectVersion[];
  updatedSourceCallback?: (source: ProjectSources) => void;
  startSources: ProjectSources;
  closeDropdown: () => void;
  listLoaded: boolean;
  buttonRef: React.RefObject<HTMLDivElement>;
  listLoading: boolean;
  listLoadError: boolean;
  selectedVersion: string;
  setSelectedVersion: (version: string) => void;
  appName: string;
}

const INITIAL_VERSION_ID = 'initial-version';

/**
 * Dropdown that displays a list of versions for the current project.
 * Each version has a "restore" button that will restore the project to that version.
 * There is also a "start over" button that will restore the project to the start source.
 */
const VersionHistoryDropdown: React.FunctionComponent<
  VersionHistoryDropdownProps
> = ({
  versionList,
  updatedSourceCallback,
  startSources,
  closeDropdown,
  listLoaded,
  buttonRef,
  listLoading,
  listLoadError,
  selectedVersion,
  setSelectedVersion,
  appName,
}) => {
  const [versionLoadError, setVersionLoadError] = useState(false);
  const [versionLoading, setVersionLoading] = useState(false);
  const locale = currentLocale();
  const menuRef = useOutsideClick<HTMLDivElement>(closeDropdown);
  const previousListLoaded = useRef<boolean>(listLoaded);
  const latestVersion = useMemo(
    () => versionList?.find(v => v.isLatest)?.versionId || INITIAL_VERSION_ID,
    [versionList]
  );

  // We need to set the theme here becausse the dropdown is rendered in a portal, outside of the
  // main lab container.
  const {theme} = useTheme();

  const viewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );

  // If this is a teacher viewing a student's project, we hide the restore button,
  // but still allow viewing old versions.
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);

  const dialogControl = useDialogControl();
  const dropdownStyles = useDropdownPosition(buttonRef, menuRef);

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [locale]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (selectedVersion === '') {
      setSelectedVersion(latestVersion);
    }
  }, [versionList, selectedVersion, latestVersion, setSelectedVersion]);

  useEffect(() => {
    if (listLoaded && !previousListLoaded.current && selectedVersion !== '') {
      // If we are currently viewing an old version (this happens if
      // the user x'd out of the dropdown, but did not cancel), focus the selected version,
      // otherwise focus the latest version and set the selected version to the latest version.
      // We explicitly focus because we are using a react portal, and we need to ensure the focus
      // goes to the correct element.
      // Wait a tick to ensure the selected version is rendered before focusing it.
      const versionId = viewingOldVersion ? selectedVersion : latestVersion;
      if (!viewingOldVersion) {
        setSelectedVersion(latestVersion);
      }
      if (versionId) {
        setTimeout(() => {
          const selectedVersionButton =
            document.querySelector<HTMLInputElement>(
              `input[type="radio"][name="${versionId}"]`
            );
          if (selectedVersionButton) {
            selectedVersionButton.focus();
          }
        }, 0);
      }
    }

    previousListLoaded.current = listLoaded;
  }, [
    listLoaded,
    selectedVersion,
    latestVersion,
    viewingOldVersion,
    setSelectedVersion,
  ]);

  useEffect(() => {
    // If we are on the loading screen or load error screen, focus the close button.
    if (listLoadError || listLoading) {
      const closeButton = document.getElementById('close-version-history');
      closeButton?.focus();
    }
  }, [listLoadError, listLoading]);

  const successfulRestoreCleanUp = useCallback(
    (sources: ProjectSources) => {
      dispatch(setViewingOldVersion(false));
      dispatch(setRestoredOldVersion(true));
      if (updatedSourceCallback) {
        updatedSourceCallback(sources);
      }
    },
    [dispatch, updatedSourceCallback]
  );

  const startOver = useCallback(() => {
    // We force a new version on start over so the user doesn't lose their recent edits.
    // We also force the save to occur immediately to avoid confusion.
    dispatch(
      setAndSaveProjectSources(
        startSources,
        /* forceSave */ true,
        /* forceNewVersion */ true
      )
    );
    successfulRestoreCleanUp(startSources);
    closeDropdown();
  }, [dispatch, startSources, successfulRestoreCleanUp, closeDropdown]);

  const confirmStartOver = useCallback(() => {
    dialogControl?.showDialog({
      type: DialogType.StartOver,
      handleConfirm: startOver,
    });
  }, [dialogControl, startOver]);

  const restoreSelectedVersion = useCallback(() => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (selectedVersion === INITIAL_VERSION_ID) {
      sendCodebridgeAnalyticsEvent(
        EVENTS.CODEBRIDGE_VERSION_RESTORED,
        appName,
        {isInitialVersion: 'true'}
      );
      closeDropdown();
      confirmStartOver();
    } else if (projectManager && selectedVersion) {
      sendCodebridgeAnalyticsEvent(
        EVENTS.CODEBRIDGE_VERSION_RESTORED,
        appName,
        {isInitialVersion: 'false'}
      );
      setVersionLoading(true);
      setVersionLoadError(false);
      projectManager
        .restoreSources(selectedVersion)
        .then(sources => {
          if (sources) {
            dispatch(setProjectSource(sources));
            successfulRestoreCleanUp(sources);
          } else {
            setVersionLoadError(true);
          }
          setVersionLoading(false);
          closeDropdown();
        })
        .catch(() => {
          setVersionLoadError(true);
          setVersionLoading(false);
        });
    }
  }, [
    selectedVersion,
    appName,
    confirmStartOver,
    closeDropdown,
    dispatch,
    successfulRestoreCleanUp,
  ]);

  const isLatestVersion = useCallback(
    (versionId: string) => {
      if (versionId === INITIAL_VERSION_ID) {
        return versionList.length === 0;
      }
      const version = versionList.find(
        version => version.versionId === versionId
      );
      return version && version.isLatest;
    },
    [versionList]
  );

  const parseDate = useCallback(
    (date: string) => {
      const dateObject = new Date(date);
      return dateFormatter.format(dateObject);
    },
    [dateFormatter]
  );

  const onVersionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedVersion(e.target.value);
      const viewingInitialVersion = e.target.value === INITIAL_VERSION_ID;
      const isLatest = isLatestVersion(e.target.value);
      if (!isLatest) {
        sendCodebridgeAnalyticsEvent(
          EVENTS.CODEBRIDGE_VERSION_VIEWED,
          appName,
          {isInitialVersion: viewingInitialVersion.toString()}
        );
      }
      if (viewingInitialVersion) {
        dispatch(previewStartSources({startSources}));
      } else if (isLatest) {
        dispatch(resetToCurrentVersion());
      } else {
        dispatch(loadVersion({versionId: e.target.value, startSources}));
      }
    },
    [appName, dispatch, isLatestVersion, setSelectedVersion, startSources]
  );

  // Function called when clicking 'cancel'. This will reset the project to the current version
  // if the user is viewing an old version, then close the dropdown.
  const handleCancel = useCallback(() => {
    // Go back to current version if we are viewing an old version
    if (selectedVersion && !isLatestVersion(selectedVersion)) {
      dispatch(resetToCurrentVersion());
    }
    closeDropdown();
  }, [closeDropdown, dispatch, isLatestVersion, selectedVersion]);

  const renderLatestTag = () => {
    return (
      <Tags
        tagsList={[
          {
            label: commonI18n.current(),
            icon: {
              iconName: 'check',
              iconStyle: 'regular',
              title: 'check',
              placement: 'left',
            },
            tooltipContent: commonI18n.current(),
            tooltipId: 'current-version-tag',
            ariaLabel: commonI18n.current(),
          },
        ]}
        size="s"
      />
    );
  };

  return createPortal(
    <FocusTrap
      focusTrapOptions={{
        onDeactivate: closeDropdown,
        clickOutsideDeactivates: true,
      }}
    >
      <div
        className={moduleStyles.versionHistoryDropdown}
        ref={menuRef}
        role="dialog"
        style={dropdownStyles}
        aria-modal="true"
        aria-label={lab2I18n.versionHistoryList()}
        data-theme={theme}
      >
        <div className={moduleStyles.header}>
          <Heading6 className={moduleStyles.heading}>
            {commonI18n.versionHistory_header()}
          </Heading6>
          <CloseButton
            onClick={closeDropdown}
            aria-label={lab2I18n.closeVersionHistory()}
            id={'close-version-history'}
          />
        </div>
        {listLoading && (
          <div
            className={classNames(
              moduleStyles.message,
              moduleStyles.loadingVersionSpinner
            )}
          >
            <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
          </div>
        )}
        {listLoadError && (
          <div className={moduleStyles.message}>
            <Alert
              type="danger"
              text={lab2I18n.versionHistoryLoadFailure()}
              size="s"
            />
          </div>
        )}
        {listLoaded && (
          <div>
            <div className={moduleStyles.list}>
              {versionList.map(version => (
                <div id={version.versionId} key={version.versionId}>
                  <RadioButton
                    name={version.versionId}
                    value={version.versionId}
                    label={parseDate(version.lastModified)}
                    onChange={onVersionChange}
                    checked={selectedVersion === version.versionId}
                    className={moduleStyles.row}
                  >
                    {version.isLatest && renderLatestTag()}
                  </RadioButton>
                </div>
              ))}
              <div id={INITIAL_VERSION_ID}>
                <RadioButton
                  name={INITIAL_VERSION_ID}
                  value={INITIAL_VERSION_ID}
                  label={lab2I18n.initialVersion()}
                  onChange={onVersionChange}
                  checked={selectedVersion === INITIAL_VERSION_ID}
                  className={moduleStyles.row}
                >
                  {latestVersion === INITIAL_VERSION_ID && renderLatestTag()}
                </RadioButton>
              </div>
            </div>
            {versionLoadError && (
              <div className={classNames(moduleStyles.versionLoadError)}>
                <Alert
                  type="danger"
                  text={lab2I18n.versionLoadFailure()}
                  size="s"
                />
              </div>
            )}
            <div className={moduleStyles.footer}>
              {versionLoading && (
                <div className={classNames(moduleStyles.loadingVersionSpinner)}>
                  <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
                </div>
              )}
              {!viewAsUserId && (
                <Button
                  text={commonI18n.restore()}
                  size={'s'}
                  onClick={restoreSelectedVersion}
                  disabled={versionLoading || latestVersion === selectedVersion}
                  className={moduleStyles.footerButton}
                  type={'primary'}
                />
              )}
              <Button
                text={commonI18n.cancel()}
                size={'s'}
                onClick={handleCancel}
                disabled={versionLoading}
                className={moduleStyles.footerButton}
                type={'secondary'}
                color="black"
              />
            </div>
          </div>
        )}
      </div>
    </FocusTrap>,
    document.body
  );
};

export default React.memo(VersionHistoryDropdown);
