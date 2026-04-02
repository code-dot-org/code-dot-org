import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from '@mui/material';
import React, {ChangeEvent, useState} from 'react';

import StarterAssetsDialog from '@cdo/apps/lab2/views/components/starterAssetsDialog';
import {AssetData} from '@cdo/apps/lab2/views/components/starterAssetsDialog/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ACCEPTED_FILE_TYPES, MAX_NUM_FILES} from '../../constants';
import {addStagedFile, sendAnalytics, uploadFiles} from '../../redux';
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
    dispatch(uploadFiles({files: Array.from(files), buildAssetUrl}));
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
    text: 'Add file',
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
    children: 'Add file',
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
      labelText={'Upload'}
      triggerButtonProps={
        showLabel ? DSCO_buttonPropsWithLabel : DSCO_buttonPropsIconOnly
      }
      menuVerticalPlacement="top"
      options={[
        {
          value: 'fromLibrary',
          label: 'From Library',
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
          label: 'From Device',
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
