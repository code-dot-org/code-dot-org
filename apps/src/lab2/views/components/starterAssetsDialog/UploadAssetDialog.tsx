import Modal from '@code-dot-org/component-library/modal';
import React, {ChangeEvent, useCallback, useState} from 'react';

import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';
import {isNetworkError} from '@cdo/apps/util/HttpClient';

import {deleteFile, uploadFile} from './api';
import {
  IMAGE_DIMENSION_WARNING,
  PDF_PAGE_LIMIT,
  PDF_PAGE_WARNING,
} from './constants';
import FileIcon from './FileIcon';
import {DialogAlert, Loading} from './shared';
import {CommonProps, UploadDialogProps} from './types';
import {getImageDimensions, getPageCount} from './utils';

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
}

const UploadAssetDialog: React.FC<UploadDialogProps & UploadProps> = ({
  onClose,
  assets,
  addAsset,
  removeAsset,
  loading,
  levelName,
  updateAlert,
  alert,
  clearAlert,
}) => {
  const [requestInProgress, setRequestInProgress] = useState<
    'upload' | 'delete'
  >();

  const onFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    // Starter Assets API only supports one file upload at a time.
    const file = files[0];

    if (file.name.endsWith('.pdf')) {
      const pageCount = (await getPageCount(file)) || 0;
      if (pageCount > PDF_PAGE_LIMIT) {
        updateAlert(
          `${file.name} is ${pageCount} pages long. PDFs must be less than ${PDF_PAGE_LIMIT} pages. Please try a smaller file.`,
          'danger'
        );
        return;
      } else if (pageCount > PDF_PAGE_WARNING) {
        updateAlert(
          `WARNING: ${file.name} is ${pageCount} pages long. PDFs with many pages and lots of text will increase response times, potentially resulting in timeouts.`,
          'warning'
        );
      }
    }

    if (file.type.includes('image')) {
      const {width, height} = await getImageDimensions(file);
      if (width > IMAGE_DIMENSION_WARNING || height > IMAGE_DIMENSION_WARNING) {
        updateAlert(
          `WARNING: ${file.name} is ${width} x ${height} pixels. Images with large dimensions may result in degraded performance.`,
          'warning'
        );
      }
    }

    setRequestInProgress('upload');
    try {
      const asset = await uploadFile(file, levelName);
      addAsset(asset);
    } catch (error) {
      const errorMessage =
        isNetworkError(error) && error.getDetails().status === 413
          ? 'Images must be less than 20 MB, and PDFs less than 5 MB. Please try a smaller asset.'
          : 'Something went wrong. Please try again.';
      updateAlert(errorMessage, 'danger', error as Error);
    }
    setRequestInProgress(undefined);
  };

  const [openFileInput, FileInput] = useHiddenFileInput(
    onFilesSelected,
    ACCEPTED_FILE_TYPES.join(',')
  );

  const onDelete = useCallback(
    async (filename: string) => {
      clearAlert();
      setRequestInProgress('delete');
      try {
        await deleteFile(filename, levelName);
        removeAsset(filename);
      } catch (error) {
        updateAlert(
          'Error deleting file. Please try again',
          'danger',
          error as Error
        );
      }
      setRequestInProgress(undefined);
    },
    [clearAlert, levelName, removeAsset, updateAlert]
  );

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
          clearAlert();
          openFileInput();
        },
        iconLeft: {
          iconName: requestInProgress ? 'spinner' : 'upload',
          animationType: requestInProgress ? 'spin' : undefined,
        },
        disabled: loading || !!requestInProgress,
      }}
      secondaryButtonProps={{text: 'Cancel', onClick: onClose}}
      customContent={
        loading ? (
          <Loading />
        ) : (
          <>
            <FileInput />
            <div className={styles.modalBody} id="dsco-dialog-description">
              {assets.map(asset => (
                <FileIcon
                  {...asset}
                  key={asset.filename}
                  levelName={levelName}
                  onDelete={onDelete}
                  showWarnings={true}
                />
              ))}
            </div>
          </>
        )
      }
      customBottomContent={alert && <DialogAlert {...alert} />}
    />
  );
};

export default UploadAssetDialog;
