import {DeleteFileFunction} from '@codebridge/codebridgeContext/types';
import {ProjectFile} from '@codebridge/types';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import {DialogType, DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenConfirmDeleteFileArgsType = {
  file: ProjectFile;
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  deleteFile: DeleteFileFunction;
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
  cleanupValidationFile: () => void;
};

// this is ~technically~ not a prompt in that it's merely a confirmation dialog,
// but this was still the most logical place to put it.
export const openConfirmDeleteFile = async ({
  file,
  dialogControl,
  deleteFile,
  sendCodebridgeAnalyticsEvent,
  cleanupValidationFile,
}: OpenConfirmDeleteFileArgsType) => {
  const results = await dialogControl?.showDialog({
    type: DialogType.GenericConfirmation,
    title: codebridgeI18n.areYouSure(),
    message: codebridgeI18n.deleteFileConfirm({filename: file.name}),
    confirmText: codebridgeI18n.delete(),
    destructive: true,
  });

  if (results.type === 'confirm') {
    // If we are deleting a validation file, we are in start mode, and we should
    // ensure that the override validation is set to an empty list.
    if (file.type === ProjectFileType.VALIDATION) {
      cleanupValidationFile();
    }
    deleteFile(file.id);
    sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_DELETE_FILE);
  }
};
