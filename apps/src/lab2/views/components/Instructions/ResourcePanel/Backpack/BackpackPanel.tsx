import Alert from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
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

const BackpackPanel: React.FC<BackpackPanelProps> = ({
  validateFileName,
  saveFile,
  createNewFile,
  findIdForFileName,
  openPanelCallback,
}) => {
  const backpackContext = useBackpackAPIContext();
  const primaryBackpackApi = backpackContext?.primaryApi;
  const secondaryBackpackApis = backpackContext?.secondaryApis;
  const [fileList, setFileList] = useState<string[] | undefined>(undefined);
  const [secondaryFileLists, setSecondaryFileLists] = useState<
    {[key: string]: string[]} | undefined
  >(undefined);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [listsLoading, setListsLoading] = useState<number>(0);
  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const [alertList, setAlertList] = useState<AlertConfig[]>([]);
  const [recentlyAddedFiles, setRecentlyAddedFiles] = useState<string[]>([]);
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
    // Show the load screen on initial load.
    loadBackpackFiles(true);
  }, [loadBackpackFiles, primaryBackpackApi, secondaryBackpackApis]);

  useEffect(() => {
    // Subscribe to backpack changes. Always reload when notified, as we get notified for file
    // adds or deletes.
    const listenerId = primaryBackpackApi?.addEventListener(
      (event, filename) => {
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
      }
    );
    return () => {
      if (listenerId) {
        primaryBackpackApi?.removeEventListener(listenerId);
      }
    };
  }, [loadBackpackFiles, primaryBackpackApi, openPanelCallback]);

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
      {fileList?.map(fileName => (
        <BackpackFileChip
          key={fileName}
          fileName={fileName}
          backpackApi={primaryBackpackApi}
          addAlert={(type, message) => {
            setAlertList(prevAlerts => [...prevAlerts, {type, message}]);
            openPanelCallback();
          }}
          validateFileName={validateFileName}
          saveFile={saveFile}
          createNewFile={createNewFile}
          findIdForFileName={findIdForFileName}
          isRecentlyAdded={recentlyAddedFiles.includes(fileName)}
        />
      ))}
      {secondaryFileLists && secondaryBackpackApis !== undefined
        ? Object.entries(secondaryFileLists).map(
            ([appName, secondaryFileList]) => (
              <div>
                <div>{appName}</div>
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
                    isRecentlyAdded={recentlyAddedFiles.includes(fileName)}
                  />
                ))}
              </div>
            )
          )
        : undefined}
    </div>
  );
};

export default BackpackPanel;
