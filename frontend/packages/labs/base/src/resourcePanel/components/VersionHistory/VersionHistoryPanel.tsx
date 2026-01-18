import classNames from 'classnames';
import type {ChangeEvent, FunctionComponent} from 'react';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useLocalization} from '@code-dot-org/core';
import {EVENTS} from '@code-dot-org/metrics';

import {INITIAL_VERSION_ID} from '../../../constants';
import useLifecycleNotifier from '../../../hooks/useLifecycleNotifier';
import LabRegistry from '../../../LabRegistry';
import {LifecycleEvent} from '../../../LifecycleNotifier';
import {
  loadVersion,
  previewStartSources,
  resetToCurrentVersion,
  setAndSaveProjectSources,
  setProjectSource,
  setViewingOldVersion,
  setRestoredOldVersion,
  setHasEdited,
} from '../../../redux/labProjectSlice';
import {useAppDispatch, useAppSelector} from '../../../redux/store';
import type {ProjectSources, ProjectVersion} from '../../../types';
import {sendLabAnalyticsEvent} from '../../../utils/analyticsReporterHelper';

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
  alwaysShowAutoSaves?: boolean;
  onLoadVersion?: (sources: ProjectSources) => void;
}

// Define version segments to support collapsing auto-save groups
type VersionSegment =
  | {type: 'committed'; version: ProjectVersion}
  | {
      type: 'autoSaveGroup';
      versions: ProjectVersion[];
      groupIndex: number;
    };

// The Regex here removes the space before AM/PM to match mocks and make more compact.
const AM_PM_SPACE_REGEX = /\s(AM|PM)$/i;
function stripSpaceBeforeAmPm(value: string): string {
  return value.replace(AM_PM_SPACE_REGEX, '$1');
}

const VersionHistoryPanel: FunctionComponent<VersionHistoryPanelProps> = ({
  selectedVersion,
  setSelectedVersion,
  startSources,
  levelId,
  disabled = false,
  isOpen = false,
  alwaysShowAutoSaves = false,
  onLoadVersion,
}) => {
  const [versionList, setVersionList] = useState<ProjectVersion[]>([]);
  // Track collapsed state for each group of auto-saves by group index
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(
    new Set(),
  );
  const [listLoaded, setListLoaded] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [listLoadError, setListLoadError] = useState(false);
  const [customLoadError, setCustomLoadError] = useState<string | null>(null);
  const [versionSaved, setVersionSaved] = useState(false);
  const [versionLoadError, setVersionLoadError] = useState(false);
  const [versionLoading, setVersionLoading] = useState(false);
  const locale = useLocalization();
  const latestVersion = useMemo(
    () => versionList?.find(v => v.isLatest)?.versionId || INITIAL_VERSION_ID,
    [versionList],
  );
  const [focusSelectedVersion, setFocusSelectedVersion] = useState(false);
  const previousListLoaded = useRef<boolean>(listLoaded);

  // If this is a teacher viewing a student's project, we hide the restore button,
  // but still allow viewing old versions.
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);

  const previousLevelId = useRef<number>(levelId);
  const previewViewAsUserId = useRef<number | null>(viewAsUserId);

  const viewingOldVersion = useAppSelector(
    state => state.labProject.viewingOldVersion,
  );
  const hasRestoredOldVersion = useAppSelector(
    state => state.labProject.restoredOldVersion,
  );
  const closeRestoredVersionBanner = () => {
    dispatch(setRestoredOldVersion(false));
  };

  const projectSources = useAppSelector(
    state => state.labProject.projectSources,
  );
  const hasEdited = useAppSelector(state => state.labProject.hasEdited);

  // Ex: "Jun 5, 3:30 PM"
  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [locale]);

  // Ex: "Jun 5, 2022, 3:30 PM"
  const dateFormatterWithYear = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [locale]);

  const dispatch = useAppDispatch();

  const loadVersionList = useCallback(
    (resetSelected: boolean) => {
      const projectManager = LabRegistry.projectManager;
      if (!projectManager) {
        setListLoadError(true);
        if (viewAsUserId) {
          // If a teacher is viewing a student who has not started, we will have no project manager.
          setCustomLoadError('This student has not started yet.');
        } else {
          setCustomLoadError(
            'No version history found. Have you started your project?',
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
    [setSelectedVersion, viewAsUserId],
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

  // Reload version history list when tab becomes active.
  useEffect(() => {
    if (isOpen) {
      loadVersionList(true);
    }
  }, [isOpen, loadVersionList, dispatch]);

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
              `input[type="radio"][name="${versionId}"]`,
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
    [dispatch, loadVersionList],
  );

  const startOver = useCallback(async () => {
    // We force a new version on start over so the user doesn't lose their recent edits.
    // We also force the save to occur immediately to avoid confusion.
    await dispatch(
      setAndSaveProjectSources(
        startSources,
        /* forceSave */ true,
        /* forceNewVersion */ true,
      ),
    );
    if (onLoadVersion) onLoadVersion(startSources);
    successfulProjectResetCleanUp();
  }, [dispatch, startSources, successfulProjectResetCleanUp, onLoadVersion]);

  const restoreSelectedVersion = useCallback(() => {
    const projectManager = LabRegistry.projectManager;
    if (selectedVersion === INITIAL_VERSION_ID) {
      sendLabAnalyticsEvent(EVENTS.LAB2_VERSION_RESTORED, {
        isInitialVersion: 'true',
      });
      startOver();
    } else if (projectManager && selectedVersion) {
      sendLabAnalyticsEvent(EVENTS.LAB2_VERSION_RESTORED, {
        isInitialVersion: 'false',
      });
      setVersionLoading(true);
      setVersionLoadError(false);
      projectManager
        .restoreSources(LabRegistry.appName, selectedVersion)
        .then(sources => {
          if (sources) {
            dispatch(setProjectSource(sources));
            if (onLoadVersion) onLoadVersion(sources);
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
    dispatch,
    successfulProjectResetCleanUp,
    onLoadVersion,
    startOver,
  ]);

  const isLatestVersion = useCallback(
    (versionId: string) => {
      if (versionId === INITIAL_VERSION_ID) {
        return versionList.length === 0;
      }
      const version = versionList.find(
        version => version.versionId === versionId,
      );
      return version && version.isLatest;
    },
    [versionList],
  );

  const parseDate = useCallback(
    (date: string) => {
      const versionDate = new Date(date);
      const now = new Date();

      // Within the current year, show month and day only.
      if (now.getFullYear() === versionDate.getFullYear()) {
        return stripSpaceBeforeAmPm(dateFormatter.format(versionDate));
      }
      // Older than a year, show month, day, and year.
      return stripSpaceBeforeAmPm(dateFormatterWithYear.format(versionDate));
    },
    [dateFormatter, dateFormatterWithYear],
  );

  const onVersionChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSelectedVersion(e.target.value);
      const viewingInitialVersion = e.target.value === INITIAL_VERSION_ID;
      const isLatest = isLatestVersion(e.target.value);
      // Find the version object to pass prop details to the loadVersion thunk.
      const version = versionList.find(v => v.versionId === e.target.value);
      if (!isLatest) {
        sendLabAnalyticsEvent(EVENTS.LAB2_VERSION_VIEWED, {
          isInitialVersion: viewingInitialVersion.toString(),
        });
      }
      if (viewingInitialVersion) {
        dispatch(previewStartSources({startSources, onLoadVersion}));
      } else if (isLatest) {
        dispatch(resetToCurrentVersion({onLoadVersion}));
      } else {
        dispatch(loadVersion({startSources, version, onLoadVersion}));
      }
    },
    [
      dispatch,
      isLatestVersion,
      setSelectedVersion,
      startSources,
      versionList,
      onLoadVersion,
    ],
  );

  const handleSaveVersionSuccess = useCallback(() => {
    sendLabAnalyticsEvent(EVENTS.LAB2_VERSION_COMMITTED, {
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

  // Initialize collapsed state for all groups
  // All groups collapsed by default, unless alwaysShowAutoSaves is true
  useEffect(() => {
    if (alwaysShowAutoSaves) {
      setCollapsedGroups(new Set());
      return;
    }
    const allGroupIndices = versionSegments
      .filter(segment => segment.type === 'autoSaveGroup')
      .map(segment => (segment as {groupIndex: number}).groupIndex);

    setCollapsedGroups(new Set(allGroupIndices));
  }, [versionSegments, alwaysShowAutoSaves]);

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
      saveButtonLabel?: string,
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
          alwaysShowAutoSaves={alwaysShowAutoSaves}
        >
          {isLatest && hasEdited && !viewAsUserId && (
            <SaveVersionPanel
              projectSources={projectSources}
              onSuccess={handleSaveVersionSuccess}
              disabled={disabled || versionLoading}
              buttonLabel={saveButtonLabel || 'Save current version'}
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
      alwaysShowAutoSaves,
    ],
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
          text="Version successfully restored"
          type="success"
          size="xs"
          onClose={closeRestoredVersionBanner}
        />
      )}
      {versionLoadError && (
        <Alert
          className={moduleStyles.message}
          text="Sorry, we couldn't load that version. Please try again."
          type="danger"
          size="xs"
        />
      )}
      {listLoading && (
        <div
          className={classNames(
            moduleStyles.message,
            moduleStyles.loadingVersionSpinner,
          )}
        >
          <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
        </div>
      )}
      {listLoadError && (
        <Alert
          className={moduleStyles.message}
          type="danger"
          text={
            customLoadError ||
            "Sorry, we couldn't load your version history. Please try again."
          }
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
                  version.comment ? 'Save new version' : 'Save current version',
                );
              } else {
                // Auto-save group
                const {versions, groupIndex} = segment;
                const isCollapsed = collapsedGroups.has(groupIndex);
                const hasMultipleVersions = versions.length > 1;

                return (
                  <Fragment key={`group-${groupIndex}`}>
                    {hasMultipleVersions && !alwaysShowAutoSaves && (
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
                          undefined,
                        ),
                      )}
                  </Fragment>
                );
              }
            })}
            {renderVersionRow(
              INITIAL_VERSION_ID,
              'Initial version',
              latestVersion === INITIAL_VERSION_ID,
              undefined,
              undefined,
              undefined,
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistoryPanel;
