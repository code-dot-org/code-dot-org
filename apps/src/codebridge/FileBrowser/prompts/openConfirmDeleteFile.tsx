import {DeleteFileFunction} from '@codebridge/codebridgeContext/types';
import {ProjectFile} from '@codebridge/types';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';
import {DialogType, DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenConfirmDeleteFileArgsType = {
  file: ProjectFile;
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  deleteFile: DeleteFileFunction;
  sendLab2AnalyticsEvent: (
    eventName: string,
    payload?: Record<string, string>
  ) => void;
};

// this is ~technically~ not a prompt in that it's merely a confirmation dialog,
// but this was still the most logical place to put it.
export const openConfirmDeleteFile = async ({
  file,
  dialogControl,
  deleteFile,
  sendLab2AnalyticsEvent,
}: OpenConfirmDeleteFileArgsType) => {
  const results = await dialogControl?.showDialog({
    type: DialogType.GenericConfirmation,
    title: codebridgeI18n.areYouSure(),
    message: codebridgeI18n.deleteFileConfirm({filename: file.name}),
    confirmText: codebridgeI18n.delete(),
    destructive: true,
  });

  if (results.type === 'confirm') {
    deleteFile({fileId: file.id});
    sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_DELETE_FILE, {
      fileType: getFileExtension(file.name),
    });
  }
};
