import {MoveFileFunction} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectFile, ProjectType, FileId} from '@codebridge/types';
import {getFolderPath, validateFileName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {GenericDropdownProps} from '@cdo/apps/lab2/views/dialogs/GenericDropdown';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenMoveFilePromptArgsType = {
  fileId: FileId;
  projectFiles: ProjectType['files'];
  projectFolders: ProjectType['folders'];
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  moveFile: MoveFileFunction;
  isStartMode: boolean;
  validationFile: ProjectFile | undefined;
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
};

export const openMoveFilePrompt = async ({
  fileId,
  projectFiles,
  projectFolders,
  dialogControl,
  moveFile,
  isStartMode,
  validationFile,
  sendCodebridgeAnalyticsEvent,
}: OpenMoveFilePromptArgsType) => {
  const file = projectFiles[fileId];

  // iterate over all the folders in the project AND the default folder, which isn't actually in the list.
  const validFolders: GenericDropdownProps['items'] = [
    {id: DEFAULT_FOLDER_ID},
    ...Object.values(projectFolders),
  ]
    .filter(
      f =>
        !Boolean(
          validateFileName({
            fileName: file.name,
            folderId: f.id,
            projectFiles,
            isStartMode,
            validationFile,
          })
        )
    )
    .map(f => ({value: f.id, text: getFolderPath(f.id, projectFolders)}))
    .sort((a, b) => a.text.localeCompare(b.text));

  const results = await dialogControl?.showDialog({
    type: DialogType.GenericDropdown,
    title: codebridgeI18n.moveFilePrompt(),
    selectedValue: validFolders[0].value,
    items: validFolders,
    dropdownLabel: '',
  });

  if (results.type !== 'confirm') {
    return;
  }

  const destinationFolderId = extractUserInput(results);
  moveFile(fileId, destinationFolderId);

  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_MOVE_FILE);
};
