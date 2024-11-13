import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {useFileUploader, usePrompts} from '@codebridge/FileBrowser/hooks';
import {ProjectFolder} from '@codebridge/types';
import {getPossibleDestinationFoldersForFolder} from '@codebridge/utils';
import {useMemo} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

/**
 * Generates options for the context menu displayed for a folder row in the file browser.
 * @param folder - The ProjectFolder object representing the folder for which options are generated.
 * @param startFileUpload - a function to start a file upload, should be handed in from the return of `useFileUploader`
 * @returns An array of objects representing the context menu options.
 *   Each object has the following properties:
 *     - `condition`:  A boolean that determines if the option should be displayed.
 *     - `iconName`: The name of the icon to display for the option.
 *     - `labelText`: The text label to display for the option.
 *     - `clickHandler`: The function to be called when the option is clicked.
 */
export const useFolderRowOptions = (
  folder: ProjectFolder,
  startFileUpload: ReturnType<typeof useFileUploader>['startFileUpload']
) => {
  const {
    project: {folders: projectFolders},
  } = useCodebridgeContext();

  const {
    openConfirmDeleteFolder,
    openMoveFolderPrompt,
    openNewFilePrompt,
    openNewFolderPrompt,
    openRenameFolderPrompt,
  } = usePrompts();

  const dropdownOptions = useMemo(() => {
    const options = [];
    if (
      getPossibleDestinationFoldersForFolder({
        folder,
        projectFolders,
      }).length
    ) {
      options.push({
        condition: true,
        iconName: 'arrow-right',
        labelText: codebridgeI18n.moveFolder(),
        clickHandler: () => openMoveFolderPrompt({folderId: folder.id}),
      });
    }

    options.push(
      {
        condition: true,
        iconName: 'pencil',
        labelText: codebridgeI18n.renameFolder(),
        clickHandler: () => openRenameFolderPrompt({folderId: folder.id}),
      },
      {
        condition: true,
        iconName: 'folder-plus',
        labelText: codebridgeI18n.addSubFolder(),
        clickHandler: () => openNewFolderPrompt({parentId: folder.id}),
      },
      {
        condition: true,
        iconName: 'plus',
        labelText: codebridgeI18n.newFile(),
        clickHandler: () => openNewFilePrompt({folderId: folder.id}),
      },
      {
        condition: true,
        iconName: 'upload',
        labelText: codebridgeI18n.uploadFile(),
        clickHandler: () => startFileUpload(folder.id),
      },
      {
        condition: true,
        iconName: 'trash',
        labelText: codebridgeI18n.deleteFolder(),
        clickHandler: () => openConfirmDeleteFolder({folder}),
      }
    );

    return options;
  }, [
    folder,
    openConfirmDeleteFolder,
    openMoveFolderPrompt,
    openNewFilePrompt,
    openNewFolderPrompt,
    openRenameFolderPrompt,
    projectFolders,
    startFileUpload,
  ]);

  return dropdownOptions;
};
