import {MoveFolderFunction} from '@codebridge/codebridgeContext/types';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {ProjectType, FolderId} from '@codebridge/types';
import {getFolderPath, validateFolderName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {GenericDropdownProps} from '@cdo/apps/lab2/views/dialogs/GenericDropdown';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenMoveFolderPromptArgsType = {
  folderId: FolderId;
  projectFolders: ProjectType['folders'];
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  moveFolder: MoveFolderFunction;
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
};

export const openMoveFolderPrompt = async ({
  folderId,
  projectFolders,
  dialogControl,
  moveFolder,
  sendCodebridgeAnalyticsEvent,
}: OpenMoveFolderPromptArgsType) => {
  const folder = projectFolders[folderId];

  // iterate over all the folders in the project AND the default folder, which isn't actually in the list.
  const possibleDestinationFolders: GenericDropdownProps['items'] = [
    {id: DEFAULT_FOLDER_ID},
    ...Object.values(projectFolders),
  ]
    .filter(
      f =>
        f.id !== folder.id &&
        !Boolean(
          validateFolderName({
            folderName: folder.name,
            parentId: f.id,
            projectFolders,
          })
        )
    )
    .map(f => ({value: f.id, text: getFolderPath(f.id, projectFolders)}))
    .sort((a, b) => a.text.localeCompare(b.text));

  const results = await dialogControl?.showDialog({
    type: DialogType.GenericDropdown,
    title: codebridgeI18n.moveFolderPrompt(),
    selectedValue: possibleDestinationFolders[0].value,
    items: possibleDestinationFolders,
    dropdownLabel: '',
  });

  if (results.type !== 'confirm') {
    return;
  }
  const destinationFolderId = extractUserInput(results);

  moveFolder(folderId, destinationFolderId);

  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_MOVE_FOLDER);
};
