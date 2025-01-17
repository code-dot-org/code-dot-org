import {findFiles, findSubFolders} from '@codebridge/codebridgeContext';
import {DeleteFolderFunction} from '@codebridge/codebridgeContext/types';
import {ProjectFolder} from '@codebridge/types';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {DialogType, DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenConfirmDeleteFileArgsType = {
  folder: ProjectFolder;
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  deleteFolder: DeleteFolderFunction;
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
  projectFiles: MultiFileSource['files'];
  projectFolders: MultiFileSource['folders'];
};

// this is ~technically~ not a prompt in that it's merely a confirmation dialog,
// but this was still the most logical place to put it.
export const openConfirmDeleteFolder = async ({
  folder,
  dialogControl,
  deleteFolder,
  sendCodebridgeAnalyticsEvent,
  projectFiles,
  projectFolders,
}: OpenConfirmDeleteFileArgsType) => {
  const folderName = folder.name;
  const folderCount = findSubFolders(
    folder.id,
    Object.values(projectFolders)
  ).length;
  const fileCount = findFiles(
    folder.id,
    Object.values(projectFiles),
    Object.values(projectFolders)
  ).length;

  const title = codebridgeI18n.areYouSure();
  const confirmation = codebridgeI18n.deleteFolderConfirm({folderName});
  let additionalWarning = '';
  if (fileCount && folderCount) {
    additionalWarning = codebridgeI18n.deleteFolderConfirmBoth({
      fileCount: `${fileCount}`,
      folderCount: `${folderCount}`,
      folderName,
    });
  } else if (fileCount) {
    additionalWarning = codebridgeI18n.deleteFolderConfirmFiles({
      fileCount: `${fileCount}`,
      folderName,
    });
  } else if (folderCount) {
    additionalWarning = codebridgeI18n.deleteFolderConfirmSubfolders({
      folderCount: `${folderCount}`,
      folderName,
    });
  }
  const message = confirmation + ' ' + additionalWarning;

  const results = await dialogControl?.showDialog({
    type: DialogType.GenericConfirmation,
    title,
    message,
    confirmText: codebridgeI18n.delete(),
    destructive: true,
  });

  if (results.type === 'confirm') {
    deleteFolder(folder.id);
    sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_DELETE_FOLDER);
  }
};
