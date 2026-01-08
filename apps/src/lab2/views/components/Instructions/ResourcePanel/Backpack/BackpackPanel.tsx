import Alert from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React, {useCallback, useEffect, useState} from 'react';

import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import BackpackFileChip from './BackpackFileChip';

import moduleStyles from './backpack-panel.module.scss';

// TODO: plumb through generic methods for validating filename and saving/creating files
const BackpackPanel: React.FC = () => {
  const backpackApi = useBackpackAPIContext();
  const [fileList, setFileList] = useState<string[] | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const [alertList, setAlertList] = useState<
    {type: 'success' | 'danger'; message: string}[]
  >([]);

  const loadBackpackFiles = useCallback(() => {
    if (backpackApi) {
      setIsLoading(true);
      backpackApi.getFileList(
        () => {
          setIsLoading(false);
          setLoadError('Failed to load backpack files');
        },
        (fileList: string[]) => {
          setFileList(fileList);
          setIsLoading(false);
        }
      );
    }
  }, [backpackApi]);

  // todo: also fetch based on some refresh signal
  useEffect(() => {
    loadBackpackFiles();
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
          onClick={loadBackpackFiles}
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
        <Alert type={alert.type} text={alert.message} key={index} />
      ))}
      {fileList?.map(filename => (
        <BackpackFileChip
          key={filename}
          filename={filename}
          backpackApi={backpackApi}
          addAlert={(type, message) =>
            setAlertList(prevAlerts => [...prevAlerts, {type, message}])
          }
          validateFilename={filename => {
            return {isSupportFilename: false, isDuplicateFilename: false};
          }}
          saveFile={async (filename: string, contents: string) => {
            return true;
          }}
          createNewFile={async (filename: string, contents: string) => {
            return true;
          }}
        />
      ))}
    </div>
  );
};

export default BackpackPanel;
