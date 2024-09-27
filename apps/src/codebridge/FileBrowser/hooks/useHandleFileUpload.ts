import {
  getNextFileId,
  useCodebridgeContext,
} from '@codebridge/codebridgeContext';
import {FolderId, ProjectFile} from '@codebridge/types';
import {validateFileName} from '@codebridge/utils';
import {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';

import {useCheckForDuplicateFilename} from './useCheckForDuplicateFilename';

export const useHandleFileUpload = (files: Record<string, ProjectFile>) => {
  const checkForDuplicateFilename = useCheckForDuplicateFilename();
  const {newFile} = useCodebridgeContext();
  const dialogControl = useDialogControl();
  return useCallback(
    // first of all, we just click on the document body to close our pop up
    (folderId: FolderId, fileName: string, contents: string) => {
      // this is because we canceled the original click event inside of the FileUploader
      // of note - if additional clickhandlers were attached here, they won't be called.
      // So don't attach other handlers to this button.
      document.body.click();

      if (!validateFileName(fileName)) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: codebridgeI18n.invalidNameError(),
        });
        return;
      }
      const duplicate = checkForDuplicateFilename(fileName, folderId, files);
      if (duplicate) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: duplicate,
        });
        return;
      }

      const fileId = getNextFileId(Object.values(files));

      newFile({
        fileId,
        fileName,
        folderId: folderId,
        contents,
      });
    },
    [checkForDuplicateFilename, dialogControl, files, newFile]
  );
};
