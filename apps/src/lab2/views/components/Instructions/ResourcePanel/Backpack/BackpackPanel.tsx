import Alert from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React, {useCallback, useEffect, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {BackpackProps} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import BackpackFileChip from './BackpackFileChip';

import moduleStyles from './backpack-panel.module.scss';

const BackpackPanel: React.FC<BackpackProps> = ({
  validateFileName,
  saveFile,
  createNewFile,
  findIdForFileName,
}) => {
  const backpackApi = useBackpackAPIContext();
  const [fileList, setFileList] = useState<string[] | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const [alertList, setAlertList] = useState<
    {type: 'success' | 'danger'; message: string}[]
  >([]);

  const loadBackpackFiles = useCallback(
    (showLoading: boolean) => {
      if (backpackApi) {
        if (showLoading) {
          setIsLoading(true);
        }
        setLoadError(null);
        backpackApi.getFileList(
          error => {
            setIsLoading(false);
            setLoadError('Failed to load backpack files');
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
    // Subscribe to backpack changes. Always reload when notified, as we get notified for file
    // adds or deletes.
    backpackApi?.addEventListener(() => {
      // We don't show the load view here to avoid the screen flickering when the backpack updates.
      loadBackpackFiles(false);
    });
  }, [loadBackpackFiles, backpackApi]);

  if (!backpackApi) {
    let titleMessage = 'Backpack is unavailable';
    let detailMessage = 'Please reload the page to try again.';
    if (!currentUserId) {
      titleMessage = "You're signed out";
      detailMessage = 'Please sign in to access your Backpack.';
    }
    return (
      <div className={moduleStyles.backpackPanelWithMessage}>
        <div className={moduleStyles.neutralIconContainer}>
          <FontAwesomeV6Icon
            iconName="lock"
            iconStyle="solid"
            className={moduleStyles.icon}
          />
        </div>
        <div className={moduleStyles.backpackMessageText}>
          <BodyTwoText>
            <StrongText>{titleMessage}</StrongText>
          </BodyTwoText>
          <BodyFourText>{detailMessage}</BodyFourText>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={moduleStyles.backpackPanelWithMessage}>
        <div className={moduleStyles.neutralIconContainer}>
          <FontAwesomeV6Icon
            iconName="spinner"
            iconStyle="solid"
            className={moduleStyles.icon}
            animationType={'spin'}
          />
        </div>
        <div className={moduleStyles.backpackMessageText}>
          <BodyTwoText>
            <StrongText>Backpack is loading</StrongText>
          </BodyTwoText>
          <BodyFourText>
            Files in your backpack will appear here shortly
          </BodyFourText>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={moduleStyles.backpackPanelWithMessage}>
        <div className={moduleStyles.errorIconContainer}>
          <FontAwesomeV6Icon
            iconName="exclamation"
            iconStyle="solid"
            className={moduleStyles.icon}
          />
        </div>
        <div className={moduleStyles.backpackMessageText}>
          <BodyTwoText>
            <StrongText>An error occurred</StrongText>
          </BodyTwoText>
          <BodyFourText>
            The backpack failed to load, please try again.
          </BodyFourText>
        </div>
        <Button
          iconLeft={{iconName: 'refresh'}}
          text="Retry"
          onClick={() => loadBackpackFiles(true)}
          size="s"
          type="secondary"
          color="gray"
        />
      </div>
    );
  }

  if (fileList && fileList.length === 0) {
    return (
      <div className={moduleStyles.backpackPanelWithMessage}>
        <div className={moduleStyles.neutralIconContainer}>
          <FontAwesomeV6Icon
            iconName="backpack"
            iconStyle="solid"
            className={moduleStyles.icon}
          />
        </div>
        <div className={moduleStyles.backpackMessageText}>
          <BodyTwoText>
            <StrongText>Your backpack is empty</StrongText>
          </BodyTwoText>
          <BodyFourText>
            Files you save to your backpack will appear here.
          </BodyFourText>
        </div>
      </div>
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
          backpackApi={backpackApi}
          addAlert={(type, message) =>
            setAlertList(prevAlerts => [...prevAlerts, {type, message}])
          }
          validateFileName={validateFileName}
          saveFile={saveFile}
          createNewFile={createNewFile}
          findIdForFileName={findIdForFileName}
        />
      ))}
    </div>
  );
};

export default BackpackPanel;
