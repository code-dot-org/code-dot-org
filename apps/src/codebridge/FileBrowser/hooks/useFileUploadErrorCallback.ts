import {useCallback} from 'react';

import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';

export const useFileUploadErrorCallback = () => {
  const dialogControl = useDialogControl();
  return useCallback(
    (error: string) => {
      // close out of our pop up
      document.body.click();
      dialogControl?.showDialog({
        type: DialogType.GenericAlert,
        title: error,
      });
    },
    [dialogControl]
  );
};
