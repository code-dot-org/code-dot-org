import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import classNames from 'classnames';
import React, {ChangeEvent, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import StarterAssetsDialog from '@cdo/apps/lab2/views/components/starterAssetsDialog';
import {AssetData} from '@cdo/apps/lab2/views/components/starterAssetsDialog/types';
import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ACCEPTED_FILE_TYPES, MAX_NUM_FILES} from '../../constants';
import aichatI18n from '../../locale';
import {
  addStagedFile,
  clearStagedFilesAlert,
  stagedFilesLimitExceeded,
  stagedFileUploadFinished,
} from '../../redux';

import styles from './upload-button.module.scss';

const UploadButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentChannelId = useAppSelector(state => state.lab.channel?.id);
  const numStagedFiles = useAppSelector(
    state => state.aichat.stagedFiles.length
  );
  const numAllowedFiles = MAX_NUM_FILES - numStagedFiles;
  const levelName = useAppSelector(state => state.lab.levelProperties?.name);
  const [showAssetManager, setShowAssetManager] = useState(false);

  const onUploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    // Clear the alert, if any
    dispatch(clearStagedFilesAlert());

    if (files.length > numAllowedFiles) {
      dispatch(stagedFilesLimitExceeded());
    }

    const allowedFiles = Array.from(files)
      .slice(0, numAllowedFiles)
      .map<[string, string, File]>(file => [
        // Create a unique key for each upload in case the same file is uploaded more than once.
        `${file.name}-${Date.now()}`,
        file.name,
        file,
      ]);

    for (const [key, filename] of allowedFiles) {
      dispatch(addStagedFile({key, asset: {filename, source: 'project'}}));
    }

    for (const [key, filename, file] of allowedFiles) {
      try {
        await HttpClient.put(
          `/v3/assets/${currentChannelId}/${encodeURIComponent(filename)}`,
          file
        );
        dispatch(stagedFileUploadFinished({key, status: 'uploaded'}));
      } catch (error) {
        let status: 'sizeLimitExceeded' | 'uploadFailed' = 'uploadFailed';
        if (error instanceof NetworkError && error.response.status === 413) {
          status = 'sizeLimitExceeded';
        } else {
          status = 'uploadFailed';
          // Only log if not a size limit exceeded error
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
  };

  const onSelectStarterAssets = (assets: AssetData[]) => {
    for (const asset of assets) {
      dispatch(
        addStagedFile({
          key: `${asset.filename}-${Date.now()}`,
          asset: {
            filename: asset.filename,
            source: 'level',
          },
          loaded: true,
        })
      );
    }
  };

  const [openFileInput, FileInput] = useHiddenFileInput(
    onUploadFiles,
    ACCEPTED_FILE_TYPES.join(','),
    true
  );

  if (!currentChannelId) {
    return null;
  }

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
      <ActionDropdown
        name="uploadDropdown"
        labelText={aichatI18n.upload()}
        disabled={numStagedFiles >= MAX_NUM_FILES}
        size="s"
        className={classNames(styles.upload, styles.dropdown)}
        triggerButtonProps={{
          type: 'secondary',
          color: 'gray',
          iconLeft: {iconName: 'upload'},
          text: aichatI18n.upload(),
        }}
        options={[
          {
            value: 'fromLibrary',
            label: 'From Library',
            icon: {iconName: 'copy'},
            onClick: () => setShowAssetManager(true),
          },
          {
            value: 'fromDevice',
            label: 'From Device',
            icon: {iconName: 'file-magnifying-glass'},
            onClick: openFileInput,
          },
        ]}
      />
    </>
  );
};

export default UploadButton;
