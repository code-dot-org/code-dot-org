import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useToast} from '@code-dot-org/component-library/toast';
import {Button as MuiButton, Typography} from '@mui/material';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectType} from '@cdo/apps/lab2/types';
import {convertProjectTypeToDisplayName} from '@cdo/apps/lab2/utils';
import {BackpackProps} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {notifyWithToast} from '@cdo/apps/sharedComponents/backpack/backpackToasts';
import {BackpackEvent} from '@cdo/apps/sharedComponents/backpack/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import BackpackFileChip, {
  SHOW_RECENTLY_ADDED_DURATION_MS,
} from './BackpackFileChip';
import {
  BackpackSortOrder,
  sortBackpackFiles,
  FileExtension,
  ALL_FILES_ID,
  getPopulatedFileTypeConfigs,
  findConfigForFile,
} from './backpackFileFilters';
import BackpackListControls from './BackpackListControls';
import BackpackMessage from './BackpackMessage';
import isFileTypeSupported from './isFileTypeSupported';

import moduleStyles from './unified-backpack-panel.module.scss';

interface UnifiedBackpackFile {
  appType: string;
  fileName: string;
}

const fileKeyFor = (appType: string, fileName: string) =>
  `${appType}/${fileName}`;

interface UnifiedBackpackPanelProps extends BackpackProps {
  openPanelCallback: () => void;
  backpackRefreshKey: number;
}

/**
 * Backpack panel behind the 'unified-backpack' experiment. It shows every backpack file the
 * user has as one list.
 */
const UnifiedBackpackPanel: React.FC<UnifiedBackpackPanelProps> = ({
  validateFileName,
  saveFileToProject,
  createNewProjectFile,
  findIdForFileName,
  supportedFileTypes,
  backpackRefreshKey,
  addFileTooltipText,
  addFileHandler,
  saveToBackpackButton,
}) => {
  const backpackApi = Lab2Registry.getInstance().getUnifiedBackpackApi();
  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const showToast = useToast();
  const viewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );
  const workspaceNoun = useAppSelector(state =>
    state.lab.levelProperties?.isProjectLevel ? 'project' : 'level'
  );

  const [files, setFiles] = useState<UnifiedBackpackFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [recentlyAddedKeys, setRecentlyAddedKeys] = useState<Set<string>>(
    new Set()
  );
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);
  const [selectedExtension, setSelectedExtension] = useState<
    FileExtension | typeof ALL_FILES_ID
  >(ALL_FILES_ID);
  const [sortOrder, setSortOrder] = useState<BackpackSortOrder>('name-asc');

  const loadFiles = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) {
        setIsLoading(true);
      }
      setLoadError(false);
      try {
        const fileNamesByAppType = await backpackApi.getFileLists();
        const allFiles = Object.entries(fileNamesByAppType).flatMap(
          ([appType, fileNames]) =>
            fileNames.map(fileName => ({appType, fileName}))
        );
        setFiles(allFiles);
      } catch (error) {
        setLoadError(true);
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Unified backpack file list fetch error', error as Error);
      }
      setIsLoading(false);
    },
    [backpackApi]
  );

  const fileNames = useMemo(() => files.map(({fileName}) => fileName), [files]);
  const populatedFileTypeConfigs = useMemo(
    () => getPopulatedFileTypeConfigs(fileNames, supportedFileTypes),
    [fileNames, supportedFileTypes]
  );

  useEffect(() => {
    // The backpack api redirects signed-out users to sign-in, so don't ask for files
    // we can't get.
    if (currentUserId) {
      loadFiles(true);
    }
  }, [currentUserId, loadFiles]);

  useEffect(() => {
    // Reload when the user hits refresh in the panel header. The key starts at 0,
    // which the initial load above already covers. Only refresh if the user is signed in,
    // otherwise the refresh would fail.
    if (currentUserId && backpackRefreshKey > 0) {
      loadFiles(true);
    }
  }, [currentUserId, backpackRefreshKey, loadFiles]);

  const recentlyAddedTimers = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );

  const markRecentlyAdded = useCallback((fileKey: string) => {
    setRecentlyAddedKeys(prevKeys => new Set(prevKeys).add(fileKey));
    // Saving the same file again restarts its window. Leaving the first timer in
    // place would clear the flag partway through the second one.
    const pendingTimer = recentlyAddedTimers.current.get(fileKey);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
    }
    recentlyAddedTimers.current.set(
      fileKey,
      setTimeout(() => {
        recentlyAddedTimers.current.delete(fileKey);
        setRecentlyAddedKeys(prevKeys => {
          const nextKeys = new Set(prevKeys);
          nextKeys.delete(fileKey);
          return nextKeys;
        });
      }, SHOW_RECENTLY_ADDED_DURATION_MS)
    );
  }, []);

  useEffect(() => {
    // Clean up any remaining timers on unmount.
    const timers = recentlyAddedTimers.current;
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  useEffect(() => {
    const listenerId = backpackApi.addEventListener(
      (event, fileName, appType) => {
        if (
          event === BackpackEvent.FileAdded ||
          event === BackpackEvent.FileDeleted
        ) {
          // Reload without the loading view, so the list doesn't flicker on every change.
          loadFiles(false);
        }
        if (event === BackpackEvent.FileAdded) {
          markRecentlyAdded(fileKeyFor(appType, fileName));
        }
      }
    );
    return () => backpackApi.removeEventListener(listenerId);
  }, [backpackApi, loadFiles, markRecentlyAdded]);

  useEffect(() => {
    // Deleting the last file of an extension group retires that extension, so fall back to
    // showing everything rather than leaving an empty filter selected.
    if (
      selectedExtension !== ALL_FILES_ID &&
      !files.some(
        ({fileName}) =>
          findConfigForFile(fileName, populatedFileTypeConfigs).id ===
          selectedExtension
      )
    ) {
      setSelectedExtension(ALL_FILES_ID);
    }
  }, [files, populatedFileTypeConfigs, selectedExtension]);

  const notify = useMemo(() => notifyWithToast(showToast), [showToast]);

  // Names held by more than one backpack. Those rows have to say which backpack they
  // came from, or they are indistinguishable.
  const duplicateFileNames = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    files.forEach(({fileName}) => {
      if (seen.has(fileName)) {
        duplicates.add(fileName);
      }
      seen.add(fileName);
    });
    return duplicates;
  }, [files]);

  const renderFileChip = useCallback(
    ({appType, fileName}: UnifiedBackpackFile) => {
      const client = backpackApi.getClientForAppType(appType);
      if (!client) {
        return null;
      }
      // The universal backpack has no display name, so its rows stay unlabeled.
      const sourceDisplayName = duplicateFileNames.has(fileName)
        ? convertProjectTypeToDisplayName(appType as ProjectType) || undefined
        : undefined;
      const fileKey = fileKeyFor(appType, fileName);
      return (
        <BackpackFileChip
          key={fileKey}
          fileName={fileName}
          backpackApi={client}
          addAlert={notify}
          showToast={showToast}
          isRecentlyAdded={recentlyAddedKeys.has(fileKey)}
          validateFileName={validateFileName}
          saveFileToProject={saveFileToProject}
          createNewProjectFile={createNewProjectFile}
          findIdForFileName={findIdForFileName}
          supportedFileTypes={supportedFileTypes}
          setActionInProgress={setActionInProgress}
          disableActions={actionInProgress}
          appType={appType}
          sourceDisplayName={sourceDisplayName}
          addFileTooltipText={addFileTooltipText}
          addFileHandler={addFileHandler}
        />
      );
    },
    [
      backpackApi,
      duplicateFileNames,
      notify,
      showToast,
      recentlyAddedKeys,
      validateFileName,
      saveFileToProject,
      createNewProjectFile,
      findIdForFileName,
      supportedFileTypes,
      actionInProgress,
      addFileTooltipText,
      addFileHandler,
    ]
  );

  const handleSaveToBackpackClick = useCallback(async () => {
    if (!saveToBackpackButton) {
      return;
    }
    setActionInProgress(true);
    try {
      await saveToBackpackButton.onClick(fileNames, notify);
    } finally {
      setActionInProgress(false);
    }
  }, [saveToBackpackButton, fileNames, notify]);

  const visibleFiles = useMemo(() => {
    const matchingFiles =
      selectedExtension === ALL_FILES_ID
        ? files
        : files.filter(
            ({fileName}) =>
              findConfigForFile(fileName, populatedFileTypeConfigs).id ===
              selectedExtension
          );
    return sortBackpackFiles(matchingFiles, sortOrder);
  }, [files, populatedFileTypeConfigs, selectedExtension, sortOrder]);

  const [supportedFiles, unsupportedFiles] = useMemo(() => {
    const supported: UnifiedBackpackFile[] = [];
    const unsupported: UnifiedBackpackFile[] = [];
    visibleFiles.forEach(file => {
      if (isFileTypeSupported(file.fileName, supportedFileTypes)) {
        supported.push(file);
      } else {
        unsupported.push(file);
      }
    });
    return [supported, unsupported];
  }, [visibleFiles, supportedFileTypes]);

  if (!currentUserId) {
    return (
      <BackpackMessage
        type="neutral"
        iconName="lock"
        title="You're signed out"
        message="Please sign in to access your Backpack."
      />
    );
  }

  let panelContent;
  if (isLoading) {
    panelContent = (
      <div className={moduleStyles.messageContainer}>
        <BackpackMessage
          type="neutral"
          iconName="spinner"
          iconAnimation="spin"
          title="Your Backpack is loading"
          message="Files in your Backpack will appear here shortly."
        />
      </div>
    );
  } else if (loadError) {
    panelContent = (
      <div className={moduleStyles.messageContainer}>
        <BackpackMessage
          type="error"
          iconName="exclamation"
          title="An error occurred"
          message="Your Backpack failed to load, please try again."
          BottomComponent={
            <MuiButton
              variant="outlined"
              color="tertiary"
              size="small"
              onClick={() => loadFiles(true)}
              type="button"
              startIcon={<FontAwesomeV6Icon iconName="refresh" />}
            >
              {'Retry'}
            </MuiButton>
          }
        />
      </div>
    );
  } else {
    panelContent = (
      <>
        {files.length > 0 && (
          <BackpackListControls
            fileNames={fileNames}
            selectedExtension={selectedExtension}
            onExtensionChange={setSelectedExtension}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            populatedFileTypeConfigs={populatedFileTypeConfigs}
          />
        )}
        <div className={moduleStyles.fileListContainer}>
          {files.length === 0 && (
            <BackpackMessage
              type="neutral"
              iconName="backpack"
              title="Your Backpack is empty"
              message="Files you save to your Backpack will appear here."
            />
          )}
          {supportedFiles.map(renderFileChip)}
          {unsupportedFiles.length > 0 && (
            <details className={moduleStyles.unsupportedSection}>
              <summary className={moduleStyles.unsupportedSummary}>
                <span className={moduleStyles.unsupportedToggle}>
                  <Typography variant="body4" gutterBottom>
                    <Typography
                      variant="strong"
                      className={moduleStyles.unsupportedText}
                    >
                      {`Not supported in this ${workspaceNoun} (${unsupportedFiles.length})`}
                    </Typography>
                  </Typography>
                  <FontAwesomeV6Icon
                    iconName="chevron-down"
                    aria-hidden="true"
                  />
                </span>
              </summary>
              <div className={moduleStyles.unsupportedFileList}>
                {unsupportedFiles.map(renderFileChip)}
              </div>
            </details>
          )}
        </div>
      </>
    );
  }

  return (
    <div className={moduleStyles.unifiedBackpackPanel}>
      {panelContent}
      {saveToBackpackButton && (
        <MuiButton
          variant="outlined"
          color="tertiary"
          size="small"
          className={moduleStyles.saveButton}
          disabled={actionInProgress || viewingOldVersion}
          onClick={handleSaveToBackpackClick}
          type="button"
        >
          {saveToBackpackButton.text}
        </MuiButton>
      )}
    </div>
  );
};

export default UnifiedBackpackPanel;
