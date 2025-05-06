import Modal from '@code-dot-org/component-library/modal';
import React, {ChangeEvent, useState} from 'react';

import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';
import {isNetworkError} from '@cdo/apps/util/HttpClient';

import {deleteFile, uploadFile} from './api';
import FileIcon from './FileIcon';
import {ErrorAlert, Loading} from './shared';
import {CommonProps, DialogProps} from './types';

import styles from './starter-assets-dialog.module.scss';

// Same as the list in dashboard/app/controllers/level_starter_assets_controller.rb
// TODO: Shared constants?
const ACCEPTED_FILE_TYPES = [
  '.jpg',
  '.jpeg',
  '.gif',
  '.png',
  '.mp3',
  '.wav',
  '.pdf',
];

export interface UploadProps extends CommonProps {
  mode: 'upload';
  clearError?: () => void;
}

const UploadAssetDialog: React.FC<DialogProps & UploadProps> = ({
  onClose,
  assets,
  addAsset,
  removeAsset,
  loading,
  levelName,
  handleError,
  errorMessage,
  clearError,
}) => {
  const [requestInProgress, setRequestInProgress] = useState<
    'upload' | 'delete'
  >();

  const onFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    setRequestInProgress('upload');
    try {
      // Starter Assets API only supports one file upload at a time.
      const asset = await uploadFile(files[0], levelName);
      addAsset(asset);
    } catch (error) {
      let userErrorMessage;
      if (isNetworkError(error) && error.getDetails().status === 413) {
        userErrorMessage =
          'Images must be less than 20 MB, and PDFs less than 5 MB. Please try a smaller asset.';
      }
      handleError(error as Error, userErrorMessage);
    }
    setRequestInProgress(undefined);
  };

  const [openFileInput, FileInput] = useHiddenFileInput(
    onFilesSelected,
    ACCEPTED_FILE_TYPES.join(',')
  );

  const onDelete = async (filename: string) => {
    clearError?.();
    setRequestInProgress('delete');
    try {
      await deleteFile(filename, levelName);
      removeAsset(filename);
    } catch (error) {
      handleError(error as Error);
    }
    setRequestInProgress(undefined);
  };

  const ModalBody = () => {
    return (
      <>
        <FileInput />
        <div className={styles.modalBody} id="dsco-dialog-description">
          {assets.map(asset => (
            <FileIcon
              key={asset.filename}
              asset={asset}
              levelName={levelName}
              onDelete={() => onDelete(asset.filename)}
            />
          ))}
        </div>
      </>
    );
  };

  const buttonText =
    requestInProgress === 'upload'
      ? 'Uploading...'
      : requestInProgress === 'delete'
      ? 'Deleting...'
      : 'Upload';

  return (
    <Modal
      id="starter-assets-dialog"
      onClose={onClose}
      title={'Manage Starter Assets'}
      primaryButtonProps={{
        text: buttonText,
        onClick: () => {
          clearError?.();
          openFileInput();
        },
        iconLeft: {
          iconName: requestInProgress ? 'spinner' : 'upload',
          animationType: requestInProgress ? 'spin' : undefined,
        },
        disabled: loading || !!requestInProgress,
      }}
      secondaryButtonProps={{text: 'Cancel', onClick: onClose}}
      customContent={loading ? <Loading /> : <ModalBody />}
      customBottomContent={
        errorMessage && <ErrorAlert message={errorMessage} />
      }
    />
  );
};

export default UploadAssetDialog;
