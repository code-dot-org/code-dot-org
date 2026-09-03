import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Snackbar, Fade, Typography} from '@mui/material';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {TransitionGroup} from 'react-transition-group';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectType} from '@cdo/apps/lab2/types';
import {convertProjectTypeToDisplayName} from '@cdo/apps/lab2/utils';
import {BackpackProps} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {BackpackEvent} from '@cdo/apps/sharedComponents/backpack/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import BackpackFileChip from './BackpackFileChip';
import BackpackMessage from './BackpackMessage';
import isFileTypeSupported from './isFileTypeSupported';

import moduleStyles from './unified-backpack-panel.module.scss';

const ALERT_AUTO_HIDE_MS = 3000;
let nextAlertId = 0;

interface AlertConfig {
  id: number;
  type: 'success' | 'danger' | 'info';
  message: string;
}

interface UnifiedBackpackFile {
  appType: string;
  fileName: string;
}

interface UnifiedBackpackPanelProps extends BackpackProps {
  openPanelCallback: () => void;
  backpackRefreshKey: number;
  onImageFlagged?: (
    file: File,
    fileType: string,
    uploadFunction: () => Promise<void>
  ) => void;
}

// No-op transition for the Snackbar's transition slot
// since the transition is handled by the inner TransitionGroup and Fade
const SnackbarPassthrough = React.forwardRef<
  HTMLDivElement,
  {children?: React.ReactNode}
>(({children}, ref) => <div ref={ref}>{children}</div>);

/**
 * Backpack panel behind the 'unified-backpack' experiment. It shows every backpack file the
 * user has as one list, rather than the lab's own backpack plus a section per other lab.
 */
const UnifiedBackpackPanel: React.FC<UnifiedBackpackPanelProps> = ({
  validateFileName,
  saveFileToProject,
  createNewProjectFile,
  findIdForFileName,
  openPanelCallback,
  supportedFileTypes,
  backpackRefreshKey,
  onImageFlagged,
  addFileTooltipText,
  addFileHandler,
}) => {
  const backpackApi = Lab2Registry.getInstance().getUnifiedBackpackApi();
  const currentUserId = useAppSelector(state => state.currentUser.userId);

  const [files, setFiles] = useState<UnifiedBackpackFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [alertList, setAlertList] = useState<AlertConfig[]>([]);
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);

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
        // Sort by name so the list reads as one backpack instead of several
        // concatenated ones.
        allFiles.sort((first, second) =>
          first.fileName.localeCompare(second.fileName)
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

  useEffect(() => {
    const listenerId = backpackApi.addEventListener(event => {
      if (
        event === BackpackEvent.FileAdded ||
        event === BackpackEvent.FileDeleted
      ) {
        // Reload without the loading view, so the list doesn't flicker on every change.
        loadFiles(false);
      }
    });
    return () => backpackApi.removeEventListener(listenerId);
  }, [backpackApi, loadFiles]);

  const removeAlert = useCallback((id: number) => {
    setAlertList(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  }, []);

  const addAlert = useCallback(
    (type: AlertConfig['type'], message: string, autoHide: boolean = true) => {
      const id = nextAlertId++;
      setAlertList(prevAlerts => [...prevAlerts, {id, type, message}]);
      openPanelCallback();
      if (autoHide) {
        setTimeout(() => removeAlert(id), ALERT_AUTO_HIDE_MS);
      }
      return id;
    },
    [openPanelCallback, removeAlert]
  );

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
      return (
        <BackpackFileChip
          key={`${appType}/${fileName}`}
          fileName={fileName}
          backpackApi={client}
          addAlert={addAlert}
          validateFileName={validateFileName}
          saveFileToProject={saveFileToProject}
          createNewProjectFile={createNewProjectFile}
          findIdForFileName={findIdForFileName}
          supportedFileTypes={supportedFileTypes}
          setActionInProgress={setActionInProgress}
          disableActions={actionInProgress}
          appType={appType}
          sourceDisplayName={sourceDisplayName}
          onImageFlagged={onImageFlagged}
          addFileTooltipText={addFileTooltipText}
          addFileHandler={addFileHandler}
        />
      );
    },
    [
      backpackApi,
      duplicateFileNames,
      addAlert,
      validateFileName,
      saveFileToProject,
      createNewProjectFile,
      findIdForFileName,
      supportedFileTypes,
      actionInProgress,
      onImageFlagged,
      addFileTooltipText,
      addFileHandler,
    ]
  );

  const [supportedFiles, unsupportedFiles] = useMemo(() => {
    const supported: UnifiedBackpackFile[] = [];
    const unsupported: UnifiedBackpackFile[] = [];
    files.forEach(file => {
      if (isFileTypeSupported(file.fileName, supportedFileTypes)) {
        supported.push(file);
      } else {
        unsupported.push(file);
      }
    });
    return [supported, unsupported];
  }, [files, supportedFileTypes]);

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

  if (isLoading) {
    return (
      <BackpackMessage
        type="neutral"
        iconName="spinner"
        iconAnimation="spin"
        title="Your Backpack is loading"
        message="Files in your Backpack will appear here shortly."
      />
    );
  }

  if (loadError) {
    return (
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
    );
  }

  return (
    <div className={moduleStyles.unifiedBackpackPanel}>
      <Snackbar
        open
        slots={{transition: SnackbarPassthrough}}
        className={moduleStyles.alertContainer}
      >
        <TransitionGroup className={moduleStyles.alertList}>
          {alertList.map(({id, type, message}) => (
            <Fade key={id} mountOnEnter unmountOnExit>
              <div>
                <Alert
                  type={type}
                  text={message}
                  size="s"
                  onClose={() => removeAlert(id)}
                />
              </div>
            </Fade>
          ))}
        </TransitionGroup>
      </Snackbar>
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
                    {`Not supported in this lab (${unsupportedFiles.length})`}
                  </Typography>
                </Typography>
                <FontAwesomeV6Icon iconName="chevron-down" aria-hidden="true" />
              </span>
            </summary>
            <div className={moduleStyles.unsupportedFileList}>
              {unsupportedFiles.map(renderFileChip)}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default UnifiedBackpackPanel;
