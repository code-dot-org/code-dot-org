import {Button, ButtonProps} from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import classNames from 'classnames';
import React, {ChangeEvent, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import StarterAssetsDialog from '@cdo/apps/lab2/views/components/starterAssetsDialog';
import {AssetData} from '@cdo/apps/lab2/views/components/starterAssetsDialog/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_MB,
  MAX_NUM_FILES,
} from '../../constants';
import aichatI18n from '../../locale';
import {
  addStagedFile,
  clearStagedFilesAlert,
  sendAnalytics,
  stagedFilesLimitExceeded,
  stagedFileUploadFinished,
} from '../../redux';
import {AssetSource, ChatAsset} from '../../types';

import styles from './upload-button.module.scss';

interface UploadButtonProps {
  isDisabled: boolean;
  levelName: string;
  buildAssetUrl: (asset: ChatAsset) => string;
  hasStarterAssets?: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  isDisabled,
  levelName,
  buildAssetUrl,
  hasStarterAssets = false,
}) => {
  const dispatch = useAppDispatch();
  const numStagedFiles = useAppSelector(
    state => state.aichat.stagedFiles.length
  );
  const numAllowedFiles = MAX_NUM_FILES - numStagedFiles;
  const [showAssetManager, setShowAssetManager] = useState(false);

  const onUploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    // Clear the alert, if any.
    dispatch(clearStagedFilesAlert());

    const excessFileCount = files.length - numAllowedFiles;
    if (excessFileCount > 0) {
      dispatch(stagedFilesLimitExceeded());
    }

    const allowedFiles = Array.from(files)
      .slice(0, numAllowedFiles)
      .map<[string, ChatAsset, File]>(file => [
        // Create a unique key for each upload in case the same file is uploaded more than once.
        `${file.name}-${Date.now()}`,
        {filename: file.name, source: AssetSource.PROJECT},
        file,
      ]);

    for (const [key, asset] of allowedFiles) {
      dispatch(addStagedFile({key, asset}));
    }

    let uploadSuccessCount = 0;
    let sizeLimitExceededCount = 0;
    let uploadFailureCount = 0;
    for (const [key, asset, file] of allowedFiles) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        sizeLimitExceededCount += 1;
        dispatch(
          stagedFileUploadFinished({
            key,
            status: 'sizeLimitExceeded',
          })
        );
        continue; // Skip uploading this file if it exceeds the size limit.
      }

      try {
        await HttpClient.put(buildAssetUrl(asset), file);
        uploadSuccessCount += 1;

        dispatch(stagedFileUploadFinished({key, status: 'uploaded'}));
      } catch (error) {
        let status: 'sizeLimitExceeded' | 'uploadFailed' = 'uploadFailed';
        if (error instanceof NetworkError && error.response.status === 413) {
          sizeLimitExceededCount += 1;
          status = 'sizeLimitExceeded';
        } else {
          uploadFailureCount += 1;
          status = 'uploadFailed';
          // Only log if not a size limit exceeded error.
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logError('Error uploading asset', error as Error, {
              filename: file.name,
            });
        }

        dispatch(
          stagedFileUploadFinished({
            key,
            status,
          })
        );
      }
    }

    dispatch(
      sendAnalytics(EVENTS.AICHAT_MULTIMODAL_UPLOAD_STAGED, {
        source: AssetSource.PROJECT,
        fileCountSuccess: uploadSuccessCount,
        fileCountFailureSizeLimitExceeded: sizeLimitExceededCount,
        fileCountFailureUnknownCause: uploadFailureCount,
        fileCountFailureNumberExceeded: Math.max(excessFileCount, 0),
      })
    );
  };

  const onSelectStarterAssets = (assets: AssetData[]) => {
    for (const asset of assets) {
      dispatch(
        addStagedFile({
          key: `${asset.filename}-${Date.now()}`,
          asset: {
            filename: asset.filename,
            source: AssetSource.LEVEL,
          },
          loaded: true,
        })
      );
    }

    dispatch(
      sendAnalytics(EVENTS.AICHAT_MULTIMODAL_UPLOAD_STAGED, {
        source: AssetSource.LEVEL,
        fileCountSuccess: assets.length,
      })
    );
  };

  const [openFileInput, FileInput] = useHiddenFileInput(
    onUploadFiles,
    ACCEPTED_FILE_TYPES.join(','),
    true
  );

  const onDeviceUploadClick = () => {
    openFileInput();
    dispatch(
      sendAnalytics(EVENTS.AICHAT_MULTIMODAL_UPLOAD_OPENED, {
        source: AssetSource.PROJECT,
      })
    );
  };

  const buttonProps: ButtonProps = {
    type: 'secondary',
    color: 'gray',
    iconLeft: {iconName: 'plus'},
    text: aichatI18n.aichatAddFile(),
  };

  const commonProps = {
    size: 's',
    disabled: numStagedFiles >= MAX_NUM_FILES || isDisabled,
  } as const;

  const uploadButton = hasStarterAssets ? (
    <ActionDropdown
      {...commonProps}
      name="uploadDropdown"
      labelText={aichatI18n.upload()}
      triggerButtonProps={buttonProps}
      className={classNames(styles.upload, styles.dropdown)}
      options={[
        {
          value: 'fromLibrary',
          label: aichatI18n.fromLibrary(),
          icon: {iconName: 'copy'},
          onClick: () => {
            setShowAssetManager(true);
            dispatch(
              sendAnalytics(EVENTS.AICHAT_MULTIMODAL_UPLOAD_OPENED, {
                source: AssetSource.LEVEL,
              })
            );
          },
        },
        {
          value: 'fromDevice',
          label: aichatI18n.fromDevice(),
          icon: {iconName: 'file-magnifying-glass'},
          onClick: onDeviceUploadClick,
        },
      ]}
    />
  ) : (
    <Button {...buttonProps} {...commonProps} onClick={onDeviceUploadClick} />
  );

  return (
    <>
      {levelName && showAssetManager && (
        <StarterAssetsDialog
          levelName={levelName}
          onClose={() => setShowAssetManager(false)}
          mode="select"
          onSelect={onSelectStarterAssets}
          limit={numAllowedFiles}
        />
      )}
      <FileInput />
      {uploadButton}
    </>
  );
};

export default UploadButton;
