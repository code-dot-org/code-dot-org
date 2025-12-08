import Alert from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {INITIAL_VERSION_ID} from '@cdo/apps/lab2/constants';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2I18n from '@cdo/apps/lab2/locale';
import {
  setProjectSource,
  setViewingOldVersion,
  setRestoredOldVersion,
  setHasEdited,
  setVersionHistoryListStale,
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
import currentLocale from '@cdo/apps/util/currentLocale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import SaveVersionPanel from './SaveVersionPanel';
import VersionHistoryRow from './VersionHistoryRow';

import moduleStyles from './version-history-panel.module.scss';

interface VersionHistoryPanelProps {
  startSources: ProjectSources;
  selectedVersion: string;
  setSelectedVersion: (version: string) => void;
  levelId: number;
  disabled?: boolean;
  isOpen?: boolean;
}

// Define version segments to support collapsing auto-save groups
type VersionSegment =
  | {type: 'committed'; version: ProjectVersion}
  | {
      type: 'autoSaveGroup';
      versions: ProjectVersion[];
      groupIndex: number;
    };

const VersionHistoryPanel: React.FunctionComponent<
  VersionHistoryPanelProps
> = ({
  selectedVersion,
  setSelectedVersion,
  startSources,
  levelId,
  disabled = false,
  isOpen = false,
}) => {
  const [versionList, setVersionList] = useState<ProjectVersion[]>([]);
  // Track collapsed state for each group of auto-saves by group index
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(
    new Set()
  );
  const [listLoaded, setListLoaded] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [listLoadError, setListLoadError] = useState(false);
  const [customLoadError, setCustomLoadError] = useState<string | null>(null);
  const [versionSaved, setVersionSaved] = useState(false);
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
  const hasRestoredOldVersion = useAppSelector(
    state => state.lab2Project.restoredOldVersion
  );
  const closeRestoredVersionBanner = () => {
    dispatch(setRestoredOldVersion(false));
  };

  const projectSources = useAppSelector(
    state => state.lab2Project.projectSources
  );
  const hasEdited = useAppSelector(state => state.lab2Project.hasEdited);
  const versionHistoryListStale = useAppSelector(
    state => state.lab2Project.versionHistoryListStale
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
        if (viewAsUserId) {
          // If a teacher is viewing a student who has not started, we will have no project manager.
          setCustomLoadError('This student has not started yet.');
        } else {
          setCustomLoadError(
            'No version history found. Have you started your project?'
          );
        }
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
          setListLoadError(false);
          setCustomLoadError(null);
        })
        .catch(() => {
          setListLoadError(true);
          setCustomLoadError(null);
          setListLoading(false);
        });
    },
    [setSelectedVersion, viewAsUserId]
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

  // Reload version history list when tab becomes active and list is stale.
  useEffect(() => {
    if (isOpen && versionHistoryListStale) {
      loadVersionList(true);
      dispatch(setVersionHistoryListStale(false));
    }
  }, [isOpen, versionHistoryListStale, loadVersionList, dispatch]);

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
      sendLab2AnalyticsEvent(EVENTS.LAB2_VERSION_RESTORED, {
        isInitialVersion: 'true',
      });
      confirmStartOver();
    } else if (projectManager && selectedVersion) {
      sendLab2AnalyticsEvent(EVENTS.LAB2_VERSION_RESTORED, {
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
      // The Regex here removes the space before AM/PM to match mocks and make more compact.
      return dateFormatter.format(dateObject).replace(/\s(AM|PM)/gi, '$1');
    },
    [dateFormatter]
  );

  const onVersionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedVersion(e.target.value);
      const viewingInitialVersion = e.target.value === INITIAL_VERSION_ID;
      const isLatest = isLatestVersion(e.target.value);
      // Find the version object to pass prop details to the loadVersion thunk.
      const version = versionList.find(v => v.versionId === e.target.value);
      if (!isLatest) {
        sendLab2AnalyticsEvent(EVENTS.LAB2_VERSION_VIEWED, {
          isInitialVersion: viewingInitialVersion.toString(),
        });
      }
      if (viewingInitialVersion) {
        dispatch(previewStartSources({startSources}));
      } else if (isLatest) {
        dispatch(resetToCurrentVersion());
      } else {
        dispatch(loadVersion({startSources, version}));
      }
    },
    [dispatch, isLatestVersion, setSelectedVersion, startSources, versionList]
  );

  const handleSaveVersionSuccess = useCallback(() => {
    sendLab2AnalyticsEvent(EVENTS.LAB2_VERSION_COMMITTED, {
      versionId: selectedVersion,
    });
    dispatch(setHasEdited(false));
    successfulProjectResetCleanUp(true);
    setVersionSaved(true);
  }, [dispatch, selectedVersion, successfulProjectResetCleanUp]);

  // Group versions into segments where each segment is either:
  // 1. The latest version (always displayed at the top)
  // 2. A committed version (with comment)
  // 3. A group of consecutive auto-saved versions (without comments, excluding latest)
  const versionSegments = useMemo(() => {
    const segments: VersionSegment[] = [];
    let currentAutoSaveGroup: ProjectVersion[] = [];
    let groupIndex = 0;

    versionList.forEach((version, index) => {
      if (version.comment || version.isLatest) {
        // If there are accumulated auto-saves, add them as a group
        if (currentAutoSaveGroup.length > 0) {
          segments.push({
            type: 'autoSaveGroup',
            versions: currentAutoSaveGroup,
            groupIndex: groupIndex++,
          });
          currentAutoSaveGroup = [];
        }
        // Add the committed version or latest version
        segments.push({type: 'committed', version});
      } else {
        // Accumulate all auto-saved versions (excluding latest)
        currentAutoSaveGroup.push(version);
      }

      // Handle any remaining auto-saves at the end
      if (index === versionList.length - 1 && currentAutoSaveGroup.length > 0) {
        segments.push({
          type: 'autoSaveGroup',
          versions: currentAutoSaveGroup,
          groupIndex: groupIndex++,
        });
      }
    });

    return segments;
  }, [versionList]);

  // Initialize collapsed state for all groups (all collapsed by default)
  useEffect(() => {
    const allGroupIndices = versionSegments
      .filter(segment => segment.type === 'autoSaveGroup')
      .map(segment => (segment as {groupIndex: number}).groupIndex);

    setCollapsedGroups(new Set(allGroupIndices));
  }, [versionSegments]);

  const toggleGroupCollapsed = useCallback((groupIndex: number) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupIndex)) {
        newSet.delete(groupIndex);
      } else {
        newSet.add(groupIndex);
      }
      return newSet;
    });
  }, []);

  const showList = listLoaded && !listLoading && !listLoadError;

  // Helper function to render a single version row to reduce code duplication.
  const renderVersionRow = useCallback(
    (
      versionId: string,
      label: string,
      isLatest: boolean,
      comment?: string,
      className?: string,
      saveButtonLabel?: string
    ) => {
      return (
        <VersionHistoryRow
          className={className}
          key={versionId}
          versionId={versionId}
          label={label}
          comment={comment}
          isLatest={isLatest}
          isSelected={selectedVersion === versionId}
          onChange={onVersionChange}
          disabled={disabled}
          showRestoreButton={
            !isLatest && selectedVersion === versionId && !viewAsUserId
          }
          restoreOnClick={restoreSelectedVersion}
          restoreLoading={versionLoading}
          restoreDisabled={disabled || versionLoading}
        >
          {isLatest && hasEdited && !viewAsUserId && (
            <SaveVersionPanel
              projectSources={projectSources}
              onSuccess={handleSaveVersionSuccess}
              disabled={disabled || versionLoading}
              buttonLabel={saveButtonLabel || lab2I18n.saveCurrentVersion()}
            />
          )}
        </VersionHistoryRow>
      );
    },
    [
      selectedVersion,
      onVersionChange,
      disabled,
      viewAsUserId,
      restoreSelectedVersion,
      versionLoading,
      hasEdited,
      projectSources,
      handleSaveVersionSuccess,
    ]
  );

  return (
    <div className={moduleStyles.versionHistoryPanel}>
      {versionSaved && (
        <Alert
          className={moduleStyles.message}
          type="success"
          text="Version successfully saved!"
          size="xs"
          onClose={() => setVersionSaved(false)}
        />
      )}
      {hasRestoredOldVersion && (
        <Alert
          className={moduleStyles.message}
          text={codebridgeI18n.restoredOldVersion()}
          type="success"
          size="xs"
          onClose={closeRestoredVersionBanner}
        />
      )}
      {versionLoadError && (
        <Alert
          className={moduleStyles.message}
          text={lab2I18n.versionLoadFailure()}
          type="danger"
          size="xs"
        />
      )}
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
        <Alert
          className={moduleStyles.message}
          type="danger"
          text={customLoadError || lab2I18n.versionHistoryLoadFailure()}
          size="xs"
        />
      )}
      {showList && (
        <div className={moduleStyles.listContainer}>
          <div className={moduleStyles.list}>
            {versionSegments.map((segment: VersionSegment) => {
              if (segment.type === 'committed') {
                const version = segment.version;
                return renderVersionRow(
                  version.versionId,
                  parseDate(version.lastModified),
                  version.isLatest,
                  version.comment,
                  undefined,
                  version.comment
                    ? 'Save new version' // Hardcoding this so it can be translated by Localize
                    : lab2I18n.saveCurrentVersion()
                );
              } else {
                // Auto-save group
                const {versions, groupIndex} = segment;
                const isCollapsed = collapsedGroups.has(groupIndex);
                const hasMultipleVersions = versions.length > 1;

                return (
                  <React.Fragment key={`group-${groupIndex}`}>
                    {hasMultipleVersions && (
                      <Button
                        className={moduleStyles.collapseButton}
                        text={
                          isCollapsed
                            ? `Show ${versions.length} auto-saves`
                            : `Hide ${versions.length} auto-saves`
                        }
                        iconLeft={{
                          iconName: isCollapsed ? 'angles-down' : 'angles-up',
                        }}
                        color="black"
                        size="xs"
                        type="tertiary"
                        aria-expanded={!isCollapsed}
                        onClick={() => toggleGroupCollapsed(groupIndex)}
                        disabled={disabled}
                      />
                    )}
                    {!isCollapsed &&
                      versions.map(version =>
                        renderVersionRow(
                          version.versionId,
                          parseDate(version.lastModified),
                          version.isLatest,
                          version.comment,
                          moduleStyles.autoSaveRow,
                          undefined
                        )
                      )}
                  </React.Fragment>
                );
              }
            })}
            {renderVersionRow(
              INITIAL_VERSION_ID,
              lab2I18n.initialVersion(),
              latestVersion === INITIAL_VERSION_ID,
              undefined,
              undefined,
              undefined
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistoryPanel;
