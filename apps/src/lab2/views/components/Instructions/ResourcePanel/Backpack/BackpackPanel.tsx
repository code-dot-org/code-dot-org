import Alert from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
import React, {useCallback, useEffect, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {BackpackProps} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import {BackpackEvent} from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import BackpackFileChip from './BackpackFileChip';
import BackpackMessage from './BackpackMessage';

import moduleStyles from './backpack-panel.module.scss';

const SHOW_RECENTLY_ADDED_DURATION_MS = 3000;

interface BackpackPanelProps extends BackpackProps {
  openPanelCallback: () => void;
}

type AlertConfig = {type: 'success' | 'danger'; message: string};

const BackpackPanel: React.FC<BackpackPanelProps> = ({
  validateFileName,
  saveFileToProject,
  createNewProjectFile,
  findIdForFileName,
  saveToBackpackButton,
  openPanelCallback,
}) => {
  const backpackApi = useBackpackAPIContext();
  const [fileList, setFileList] = useState<string[] | undefined>(undefined);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const [alertList, setAlertList] = useState<AlertConfig[]>([]);
  const [recentlyAddedFiles, setRecentlyAddedFiles] = useState<string[]>([]);

  const loadBackpackFiles = useCallback(
    (showLoading: boolean) => {
      if (backpackApi) {
        if (showLoading) {
          setIsLoading(true);
        }
        setLoadError(false);
        backpackApi.getFileList(
          error => {
            setIsLoading(false);
            setLoadError(true);
            Lab2Registry.getInstance()
              .getMetricsReporter()
              .logError('Backpack file list fetch error', error);
          },
          (fileList: string[]) => {
            setFileList(fileList);
            setIsLoading(false);
          }
        );
      }
    },
    [backpackApi]
  );

  useEffect(() => {
    // Show the load screen on initial load.
    loadBackpackFiles(true);
  }, [loadBackpackFiles, backpackApi]);

  useEffect(() => {
    // Subscribe to backpack changes. Always reload when notified, as we get notified for file
    // adds or deletes.
    const listenerId = backpackApi?.addEventListener((event, filename) => {
      // We don't show the load view here to avoid the screen flickering when the backpack updates.
      loadBackpackFiles(false);
      if (event === BackpackEvent.FileAdded) {
        setAlertList(prevAlerts => [
          ...prevAlerts,
          {
            type: 'success',
            message: `${filename} successfully saved to your Backpack!`,
          },
        ]);
        openPanelCallback();
        // Show that the file was recently added for SHOW_RECENTLY_ADDED_DURATION_MS milliseconds.
        setRecentlyAddedFiles(prevFiles => [...prevFiles, filename]);
        setTimeout(() => {
          setRecentlyAddedFiles(prevFiles =>
            prevFiles.filter(file => file !== filename)
          );
        }, SHOW_RECENTLY_ADDED_DURATION_MS);
      }
    });
    return () => {
      if (listenerId) {
        backpackApi?.removeEventListener(listenerId);
      }
    };
  }, [loadBackpackFiles, backpackApi, openPanelCallback]);

  if (!backpackApi) {
    let titleMessage = 'Your Backpack is unavailable';
    let detailMessage = 'Please reload the page to try again.';
    if (!currentUserId) {
      titleMessage = "You're signed out";
      detailMessage = 'Please sign in to access your Backpack.';
    }
    return (
      <BackpackMessage
        type="neutral"
        iconName="lock"
        title={titleMessage}
        message={detailMessage}
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
          <Button
            iconLeft={{iconName: 'refresh'}}
            text="Retry"
            onClick={() => loadBackpackFiles(true)}
            size="s"
            type="secondary"
            color="gray"
          />
        }
      />
    );
  }

  const isEmpty = fileList && fileList.length === 0;

  return (
    <div className={moduleStyles.backpackPanelWithFiles}>
      <div className={moduleStyles.fileListContainer}>
        {alertList.map((alert, index) => (
          <Alert
            type={alert.type}
            text={alert.message}
            key={index}
            size="s"
            onClose={() => {
              const newList = [...alertList];
              newList.splice(index, 1);
              setAlertList(newList);
            }}
          />
        ))}
        {isEmpty && (
          <BackpackMessage
            type="neutral"
            iconName="backpack"
            title="Your Backpack is empty"
            message="Files you save to your Backpack will appear here."
          />
        )}
        {fileList?.map(fileName => (
          <BackpackFileChip
            key={fileName}
            fileName={fileName}
            backpackApi={backpackApi}
            addAlert={(type, message) => {
              setAlertList(prevAlerts => [...prevAlerts, {type, message}]);
              openPanelCallback();
            }}
            validateFileName={validateFileName}
            saveFileToProject={saveFileToProject}
            createNewProjectFile={createNewProjectFile}
            findIdForFileName={findIdForFileName}
            isRecentlyAdded={recentlyAddedFiles.includes(fileName)}
          />
        ))}
      </div>
      {saveToBackpackButton && (
        <Button
          text={saveToBackpackButton.text}
          onClick={() => saveToBackpackButton.onClick(fileList || [])}
          size="s"
          type="secondary"
          color="gray"
          iconLeft={{iconName: 'save'}}
          className={moduleStyles.saveButton}
        />
      )}
    </div>
  );
};

export default BackpackPanel;
