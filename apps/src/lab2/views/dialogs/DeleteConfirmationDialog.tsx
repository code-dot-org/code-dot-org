import Typography from '@cdo/apps/componentLibrary/typography';
import React from 'react';
import {BaseDialogProps} from './DialogManager';
import moduleStyles from './confirm-dialog.module.scss';
import lab2I18n from '../../locale';
import commonI18n from '@cdo/locale';

interface DeleteConfirmationDialogProps extends BaseDialogProps {
  isFolder: boolean;
  nameToDelete: string;
}

/**
 * Delete confirmation dialog used in Lab2 labs.
 */
const DeleteConfirmationDialog: React.FunctionComponent<
  DeleteConfirmationDialogProps
> = ({handleConfirm, handleCancel, isFolder, nameToDelete}) => {
  const dialogMessage = isFolder
    ? commonI18n.deleteFolderConfirmation({folderName: nameToDelete})
    : commonI18n.deleteFileConfirmation({filename: nameToDelete});

  return (
    <div className={moduleStyles.confirmDialog}>
      <Typography semanticTag="h1" visualAppearance="heading-lg">
        {isFolder ? commonI18n.deleteFolderTitle() : commonI18n.deleteFileTitle()}
      </Typography>
      <Typography semanticTag="p" visualAppearance="body-two">
        {dialogMessage}
      </Typography>
      <div className={moduleStyles.buttonContainer}>
        <button
          className={moduleStyles.cancel}
          type="button"
          onClick={handleCancel}
        >
          {commonI18n.cancel()}
        </button>
        <button
          className={moduleStyles.confirm}
          type="button"
          onClick={handleConfirm}
        >
          {commonI18n.delete()}
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;
