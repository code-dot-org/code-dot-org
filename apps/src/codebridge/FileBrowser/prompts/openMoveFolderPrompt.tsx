import {MoveFolderFunction} from '@codebridge/codebridgeContext/types';
import {ProjectType, FolderId} from '@codebridge/types';
import {
  findFolder,
  getErrorMessage,
  getFolderLineage,
  validateFolderName,
} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenMoveFolderPromptArgsType = {
  folderId: FolderId;
  projectFolders: ProjectType['folders'];
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  appName: string;
  moveFolder: MoveFolderFunction;
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
};

export const openMoveFolderPrompt = async ({
  folderId,
  projectFolders,
  dialogControl,
  appName,
  moveFolder,
  sendCodebridgeAnalyticsEvent,
}: OpenMoveFolderPromptArgsType) => {
  const folder = projectFolders[folderId];
  const results = await dialogControl?.showDialog({
    type: DialogType.GenericPrompt,
    title: codebridgeI18n.moveFolderPrompt(),
    placeholder: codebridgeI18n.rootFolder(),
    requiresPrompt: false,

    // in this case, the destinationFolderName is where we want to move the folder -to-, not what we are
    // renaming the folder to.
    // i.e., if we have folder 'foo' and the user types in '/bar/baz', then we want to place folder `foo` into `bar/baz`,
    // not rename it as `bar/baz`
    validateInput: (destinationFolderName: string) => {
      try {
        const parentId = findFolder(destinationFolderName.split('/'), {
          folders: Object.values(projectFolders),
          required: true,
        });

        if (folderId === parentId) {
          return codebridgeI18n.moveFolderErrorSelf();
        }

        const destinationLineage = new Set(
          getFolderLineage(parentId, Object.values(projectFolders))
        );

        if (destinationLineage.has(folderId)) {
          return codebridgeI18n.moveFolderErrorChild();
        }

        return validateFolderName({
          folderName: folder.name,
          parentId,
          projectFolders,
        });
      } catch (e) {
        return getErrorMessage(e);
      }
    },
  });

  if (results.type !== 'confirm') {
    return;
  }

  const destinationFolderName = extractUserInput(results) || '';
  try {
    const parentId = findFolder(destinationFolderName.split('/'), {
      folders: Object.values(projectFolders),
      required: true,
    });
    moveFolder(folderId, parentId);
  } catch (e) {
    dialogControl?.showDialog({
      type: DialogType.GenericAlert,
      title: getErrorMessage(e),
    });
  }
  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_MOVE_FOLDER);
};
