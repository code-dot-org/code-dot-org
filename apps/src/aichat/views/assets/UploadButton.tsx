import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from '@mui/material';
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

export interface UploadButtonProps {
  isDisabled: boolean;
  levelName: string;
  buildAssetUrl: (asset: ChatAsset) => string;
  hasStarterAssets?: boolean;
  showLabel?: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  isDisabled,
  levelName,
  buildAssetUrl,
  hasStarterAssets = false,
  showLabel = true,
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
    let fileCountPdf = 0;
    let fileCountImage = 0;
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

      if (file.name.endsWith('.pdf')) {
        fileCountPdf += 1;
      } else {
        fileCountImage += 1;
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
        fileCountImage,
        fileCountPdf,
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
    const fileCount = assets.length;
    const fileCountPdf =
      assets?.filter(asset => asset.filename.endsWith('.pdf')).length || 0;
    const fileCountImage = fileCount - fileCountPdf;

    dispatch(
      sendAnalytics(EVENTS.AICHAT_MULTIMODAL_UPLOAD_STAGED, {
        source: AssetSource.LEVEL,
        fileCountSuccess: fileCount,
        fileCountImage,
        fileCountPdf,
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

  // TODO: Set of legacy DSCO props, remove once Dropdowns are moved to MUI.
  const DSCO_buttonPropsCommon = {
    type: 'secondary' as const,
    color: 'gray' as const,
  };

  const DSCO_buttonPropsWithLabel = {
    ...DSCO_buttonPropsCommon,
    text: aichatI18n.aichatAddFile(),
    iconLeft: {iconName: 'plus'},
  };

  const DSCO_buttonPropsIconOnly = {
    ...DSCO_buttonPropsCommon,
    icon: {iconName: 'plus', iconStyle: 'solid' as const},
  };

  const DSCO_commonProps = {
    size: 'xs',
    disabled: numStagedFiles >= MAX_NUM_FILES || isDisabled,
  } as const;

  const buttonPropsCommon: MuiButtonProps = {
    variant: 'outlined',
    color: 'secondary',
  };

  const buttonPropsWithLabel: MuiButtonProps = {
    ...buttonPropsCommon,
    children: aichatI18n.aichatAddFile(),
    startIcon: <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />,
  };

  const buttonPropsIconOnly: MuiButtonProps = {
    ...buttonPropsCommon,
    startIcon: <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />,
  };

  const commonProps = {
    size: 'extraSmall',
    disabled: numStagedFiles >= MAX_NUM_FILES || isDisabled,
  } as const;

  const uploadButton = hasStarterAssets ? (
    <ActionDropdown
      {...DSCO_commonProps}
      name="uploadDropdown"
      labelText={aichatI18n.upload()}
      triggerButtonProps={
        showLabel ? DSCO_buttonPropsWithLabel : DSCO_buttonPropsIconOnly
      }
      menuVerticalPlacement="top"
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
    <MuiButton
      type="button"
      {...(showLabel ? buttonPropsWithLabel : buttonPropsIconOnly)}
      {...commonProps}
      onClick={onDeviceUploadClick}
    />
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
