import Alert from '@code-dot-org/component-library/alert';
import {Button} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {INITIAL_VERSION_ID} from '@cdo/apps/lab2/constants';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
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
import {LifecycleEvent} from '@cdo/apps/lab2/utils';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils/analyticsReporterHelper';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import currentLocale from '@cdo/apps/util/currentLocale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import SaveVersionPanel from './SaveVersionPanel';
import VersionHistoryRow from './VersionHistoryRow';

import moduleStyles from './version-history-panel.module.scss';

interface VersionHistoryPanelProps {
  startSources: ProjectSources;
  selectedVersion: string;
  setSelectedVersion: (version: string) => void;
  appName: string;
  levelId: number;
}

const VersionHistoryPanel: React.FunctionComponent<
  VersionHistoryPanelProps
> = ({selectedVersion, setSelectedVersion, startSources, appName, levelId}) => {
  const [versionList, setVersionList] = useState<ProjectVersion[]>([]);
  const [listLoaded, setListLoaded] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [listLoadError, setListLoadError] = useState(false);
  const [versionLoadError, setVersionLoadError] = useState(false);
  const [versionLoading, setVersionLoading] = useState(false);
  const locale = currentLocale();
  const latestVersion = useMemo(
    () => versionList?.find(v => v.isLatest)?.versionId || INITIAL_VERSION_ID,
    [versionList]
  );
  const [focusSelectedVersion, setFocusSelectedVersion] = useState(false);
  const previousListLoaded = useRef<boolean>(listLoaded);

  // If this is a teacher viewing a student's project, we hide the restore button,
  // but still allow viewing old versions.
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);

  const previousLevelId = useRef<number>(levelId);
  const previewViewAsUserId = useRef<number | null>(viewAsUserId);

  const viewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );

  const projectSources = useAppSelector(
    state => state.lab2Project.projectSources
  );
  const dialogControl = useDialogControl();

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [locale]);

  const dispatch = useAppDispatch();

  const loadVersionList = useCallback(
    (resetSelected: boolean) => {
      const projectManager = Lab2Registry.getInstance().getProjectManager();
      if (!projectManager) {
        setListLoadError(true);
        return;
      }
      setListLoading(true);
      projectManager
        .getVersionList(true) // include comments.
        .then(versionList => {
          setVersionList(versionList);
          setListLoaded(true);
          setListLoading(false);
          if (resetSelected) {
            setSelectedVersion('');
            setFocusSelectedVersion(true);
          }
        })
        .catch(() => {
          setListLoadError(true);
          setListLoading(false);
        });
    },
    [setSelectedVersion]
  );

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    loadVersionList(true);
  });

  // Ensure the version list is empty if the levelId changes or if viewAsUserId changes,
  // then load the version list.
  // We do this again when the level load finishes to ensure we have the correct list,
  // as viewAsUserId changes before the project is loaded.
  useEffect(() => {
    // Reset the version list so that we don't briefly show
    // the previous level's/user's versions.
    setVersionList([]);
    let resetSelectedVersion = false;
    if (
      previousLevelId.current !== levelId ||
      viewAsUserId !== previewViewAsUserId.current
    ) {
      resetSelectedVersion = true;
    }
    loadVersionList(resetSelectedVersion);
    previousLevelId.current = levelId;
    previewViewAsUserId.current = viewAsUserId;
  }, [loadVersionList, levelId, viewAsUserId]);

  useEffect(() => {
    if (selectedVersion === '') {
      setSelectedVersion(latestVersion);
    }
  }, [versionList, selectedVersion, latestVersion, setSelectedVersion]);

  useEffect(() => {
    if (
      (focusSelectedVersion || (listLoaded && !previousListLoaded.current)) &&
      selectedVersion !== ''
    ) {
      // If we are currently viewing an old version (this happens if
      // the user switched panels but did not cancel), focus the selected version,
      // otherwise focus the latest version and set the selected version to the latest version.
      // Wait a tick to ensure the selected version is rendered before focusing it.
      // We do this when the list is first loaded, when we change levels, when we change users, or when
      // we change the version for the user (such as when restoring/cancelling).
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
      setFocusSelectedVersion(false);
      previousListLoaded.current = listLoaded;
    }
  }, [
    focusSelectedVersion,
    selectedVersion,
    latestVersion,
    viewingOldVersion,
    setSelectedVersion,
    listLoaded,
  ]);

  const successfulProjectResetCleanUp = useCallback(
    (published = false) => {
      dispatch(setViewingOldVersion(false));
      dispatch(setRestoredOldVersion(!published));
      loadVersionList(true);
    },
    [dispatch, loadVersionList]
  );

  const startOver = useCallback(async () => {
    // We force a new version on start over so the user doesn't lose their recent edits.
    // We also force the save to occur immediately to avoid confusion.
    await dispatch(
      setAndSaveProjectSources(
        startSources,
        /* forceSave */ true,
        /* forceNewVersion */ true
      )
    );
    successfulProjectResetCleanUp();
  }, [dispatch, startSources, successfulProjectResetCleanUp]);

  const confirmStartOver = useCallback(() => {
    dialogControl?.showDialog({
      type: DialogType.StartOver,
      handleConfirm: startOver,
    });
  }, [dialogControl, startOver]);

  const restoreSelectedVersion = useCallback(() => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (selectedVersion === INITIAL_VERSION_ID) {
      sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_VERSION_RESTORED, appName, {
        isInitialVersion: 'true',
      });
      confirmStartOver();
    } else if (projectManager && selectedVersion) {
      sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_VERSION_RESTORED, appName, {
        isInitialVersion: 'false',
      });
      setVersionLoading(true);
      setVersionLoadError(false);
      projectManager
        .restoreSources(selectedVersion)
        .then(sources => {
          if (sources) {
            dispatch(setProjectSource(sources));
            successfulProjectResetCleanUp();
          } else {
            setVersionLoadError(true);
          }
          setVersionLoading(false);
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
    dispatch,
    successfulProjectResetCleanUp,
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
        sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_VERSION_VIEWED, appName, {
          isInitialVersion: viewingInitialVersion.toString(),
        });
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
  // if the user is viewing an old version, then set the selected version to the latest version.
  const handleCancel = useCallback(() => {
    // Go back to current version if we are viewing an old version
    if (selectedVersion && !isLatestVersion(selectedVersion)) {
      dispatch(resetToCurrentVersion());
      setSelectedVersion(latestVersion);
      setFocusSelectedVersion(true);
    }
  }, [
    dispatch,
    isLatestVersion,
    latestVersion,
    selectedVersion,
    setSelectedVersion,
  ]);

  const showList = listLoaded && !listLoading && !listLoadError;

  return (
    <div className={moduleStyles.versionHistoryPanel}>
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
      {showList && (
        <div className={moduleStyles.listContainer}>
          <div className={moduleStyles.list}>
            {versionList.map(version => (
              <VersionHistoryRow
                key={version.versionId}
                versionId={version.versionId}
                label={parseDate(version.lastModified)}
                comment={version.comment}
                isLatest={version.isLatest}
                isSelected={selectedVersion === version.versionId}
                onChange={onVersionChange}
              />
            ))}
            <VersionHistoryRow
              versionId={INITIAL_VERSION_ID}
              label={lab2I18n.initialVersion()}
              isLatest={latestVersion === INITIAL_VERSION_ID}
              isSelected={selectedVersion === INITIAL_VERSION_ID}
              onChange={onVersionChange}
            />
          </div>
          <div className={moduleStyles.listFooter}>
            {versionLoadError && (
              <div className={classNames(moduleStyles.versionLoadError)}>
                <Alert
                  type="danger"
                  text={lab2I18n.versionLoadFailure()}
                  size="s"
                />
              </div>
            )}
            {versionLoading && (
              <div className={classNames(moduleStyles.loadingVersionSpinner)}>
                <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
              </div>
            )}
          </div>
        </div>
      )}
      {!isLatestVersion(selectedVersion) && (
        <div className={moduleStyles.footerPanel}>
          <div className={moduleStyles.buttonContainer}>
            <Button
              text={commonI18n.cancel()}
              size={'s'}
              onClick={handleCancel}
              disabled={versionLoading || latestVersion === selectedVersion}
              className={moduleStyles.versionButton}
              type={'secondary'}
              color="gray"
            />
            {!viewAsUserId && (
              <Button
                text={commonI18n.restore()}
                size={'s'}
                onClick={restoreSelectedVersion}
                disabled={versionLoading || latestVersion === selectedVersion}
                className={moduleStyles.versionButton}
                type={'primary'}
              />
            )}
          </div>
        </div>
      )}
      {isLatestVersion(selectedVersion) && (
        <SaveVersionPanel
          projectSources={projectSources}
          onSuccess={() => successfulProjectResetCleanUp(true)}
          versionLoading={versionLoading}
        />
      )}
    </div>
  );
};

export default VersionHistoryPanel;
