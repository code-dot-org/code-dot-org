import Alert from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {BackpackProps} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi, {
  BackpackEvent,
} from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import BackpackFileChip from './BackpackFileChip';
import BackpackMessage from './BackpackMessage';

import moduleStyles from './backpack-panel.module.scss';

const SHOW_RECENTLY_ADDED_DURATION_MS = 3000;

interface BackpackPanelProps extends BackpackProps {
  openPanelCallback: () => void;
}

type AlertConfig = {type: 'success' | 'danger'; message: string};
const PRIMARY_BACKPACK_KEY = 'PRIMARY';

const BackpackPanel: React.FC<BackpackPanelProps> = ({
  validateFileName,
  saveFileToProject,
  createNewProjectFile,
  findIdForFileName,
  saveToBackpackButton,
  openPanelCallback,
  supportedFileTypes,
}) => {
  const backpackContext = useBackpackAPIContext();
  const primaryBackpackApi = backpackContext?.primaryApi;
  const secondaryBackpackApis = useMemo(
    () => backpackContext?.secondaryApis || {},
    [backpackContext?.secondaryApis]
  );
  const [fileList, setFileList] = useState<string[] | undefined>(undefined);
  const [secondaryFileLists, setSecondaryFileLists] = useState<
    {[key: string]: string[]} | undefined
  >(undefined);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [listsLoading, setListsLoading] = useState<number>(0);
  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const [alertList, setAlertList] = useState<AlertConfig[]>([]);
  const [recentlyAddedFiles, setRecentlyAddedFiles] = useState<{
    [key: string]: string[];
  }>({PRIMARY_BACKPACK_KEY: []});
  const isLoading = listsLoading > 0;

  function loadForApi(
    backpackApi: BackpackClientApi | undefined,
    listCallback: (fileList: string[]) => void,
    showLoading: boolean
  ) {
    if (backpackApi) {
      if (showLoading) {
        setListsLoading(listsLoading => listsLoading + 1);
      }
      setLoadError(false);
      backpackApi.getFileList(
        error => {
          setListsLoading(listsLoading => listsLoading - 1);
          setLoadError(true);
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logError('Backpack file list fetch error', error);
        },
        (fileList: string[]) => {
          listCallback(fileList);
          setListsLoading(listsLoading => listsLoading - 1);
        }
      );
    }
  }

  const loadBackpackFiles = useCallback(
    (showLoading: boolean) => {
      loadForApi(primaryBackpackApi, setFileList, showLoading);
      if (secondaryBackpackApis) {
        Object.entries(secondaryBackpackApis).forEach(([appName, api]) => {
          loadForApi(
            api,
            fileList =>
              setSecondaryFileLists(prev => ({...prev, [appName]: fileList})),
            showLoading
          );
        });
      }
    },
    [primaryBackpackApi, secondaryBackpackApis]
  );

  useEffect(() => {
    // Show the load screen on initial load, and load all backpacks.
    loadBackpackFiles(true);
  }, [loadBackpackFiles, primaryBackpackApi, secondaryBackpackApis]);

  useEffect(() => {
    const eventListener =
      (appKey: string) => (event: BackpackEvent, filename: string) => {
        // We don't show the load view here to avoid the screen flickering when the backpack updates.
        const clientToLoad =
          appKey === PRIMARY_BACKPACK_KEY
            ? primaryBackpackApi
            : secondaryBackpackApis[appKey];
        const listCallback =
          appKey === PRIMARY_BACKPACK_KEY
            ? setFileList
            : (fileList: string[]) =>
                setSecondaryFileLists(prev => ({...prev, [appKey]: fileList}));
        loadForApi(clientToLoad, listCallback, false);
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
          setRecentlyAddedFiles(prevFiles => {
            let previousListForApp = prevFiles[appKey];
            if (!previousListForApp) {
              previousListForApp = [];
            }
            return {...prevFiles, [appKey]: [...previousListForApp, filename]};
          });
          setTimeout(() => {
            setRecentlyAddedFiles(prevFiles => {
              let previousListForApp = prevFiles[appKey];
              if (previousListForApp) {
                previousListForApp = previousListForApp.filter(
                  file => file !== filename
                );
              }
              return {...prevFiles, [appKey]: previousListForApp};
            });
          }, SHOW_RECENTLY_ADDED_DURATION_MS);
        }
      };

    // Subscribe to backpack changes. Always reload when notified, as we get notified for file
    // adds or deletes for that backpack.
    const primaryListenerId = primaryBackpackApi?.addEventListener(
      eventListener(PRIMARY_BACKPACK_KEY)
    );
    const secondaryListenerIds: {[key: string]: string} = {};
    Object.entries(secondaryBackpackApis)?.forEach(([appKey, api]) => {
      const listenerId = api.addEventListener(eventListener(appKey));
      secondaryListenerIds[appKey] = listenerId;
    });

    return () => {
      if (primaryListenerId) {
        primaryBackpackApi?.removeEventListener(primaryListenerId);
      }
      Object.entries(secondaryListenerIds).forEach(([appKey, listenerId]) => {
        secondaryBackpackApis[appKey]?.removeEventListener(listenerId);
      });
    };
  }, [
    loadBackpackFiles,
    primaryBackpackApi,
    openPanelCallback,
    secondaryBackpackApis,
  ]);

  const isBackpackEmpty = useMemo(() => {
    const emptyPrimaryBackpack =
      !fileList || (fileList && fileList.length === 0);
    let emptySecondaryBackpacks = true;
    if (secondaryFileLists) {
      emptySecondaryBackpacks = Object.values(secondaryFileLists)
        .map(secondaryList => secondaryList.length === 0)
        .every(isEmpty => isEmpty);
    }
    return emptyPrimaryBackpack && emptySecondaryBackpacks;
  }, [fileList, secondaryFileLists]);

  if (!primaryBackpackApi) {
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

  if (isBackpackEmpty) {
    return (
      <BackpackMessage
        type="neutral"
        iconName="backpack"
        title="Your Backpack is empty"
        message="Files you save to your Backpack will appear here."
      />
    );
  }

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
        {isBackpackEmpty && (
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
            backpackApi={primaryBackpackApi}
            addAlert={addAlert}
            validateFileName={validateFileName}
            saveFileToProject={saveFileToProject}
            createNewProjectFile={createNewProjectFile}
            findIdForFileName={findIdForFileName}
            isRecentlyAdded={recentlyAddedFiles.includes(fileName)}
            supportedFileTypes={supportedFileTypes}
          />
        ))}
              {secondaryFileLists && secondaryBackpackApis !== undefined
        ? Object.entries(secondaryFileLists).map(
            ([appName, secondaryFileList]) => (
              <div key={`backpack-${appName}`}>
                <BodyThreeText className={moduleStyles.backpackDivider}>
                  {appName}
                </BodyThreeText>
                {secondaryFileList?.map(fileName => (
                  <BackpackFileChip
                    key={fileName}
                    fileName={fileName}
                    backpackApi={
                      secondaryBackpackApis && secondaryBackpackApis[appName]
                    }
                    addAlert={(type, message) => {
                      setAlertList(prevAlerts => [
                        ...prevAlerts,
                        {type, message},
                      ]);
                      openPanelCallback();
                    }}
                    validateFileName={validateFileName}
                    saveFile={saveFile}
                    createNewFile={createNewFile}
                    findIdForFileName={findIdForFileName}
                    isRecentlyAdded={recentlyAddedFiles[appName]?.includes(
                      fileName
                    )}
                  />
                ))}
              </div>
            )
          )
      </div>
      {saveToBackpackButton && (
        <Button
          text={saveToBackpackButton.text}
          onClick={() =>
            saveToBackpackButton.onClick(fileList || [], (error: string) =>
              addAlert('danger', error)
            )
          }
          size="s"
          type="secondary"
          color="gray"
          className={moduleStyles.saveButton}
        />
      )}
    </div>
  );
};

export default BackpackPanel;
