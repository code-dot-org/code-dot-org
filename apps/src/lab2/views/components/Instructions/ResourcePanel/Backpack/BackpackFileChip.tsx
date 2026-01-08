import {Button} from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React, {useMemo} from 'react';

import {getFileIconNameAndStyle} from '@cdo/apps/codebridge';
import {BackpackProps} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import moduleStyles from './backpack-file-chip.module.scss';

interface BackpackFileChipProps extends BackpackProps {
  fileName: string;
  backpackApi: BackpackClientApi;
  addAlert: (type: 'success' | 'danger', message: string) => void;
}

const BackpackFileChip: React.FC<BackpackFileChipProps> = ({
  fileName,
  backpackApi,
  addAlert,
  validateFileName,
  saveFile,
  createNewFile,
  findIdForFileName,
}) => {
  const fileExtension = fileName.split('.').pop()?.toUpperCase();
  const fileIcon = useMemo(
    () =>
      getFileIconNameAndStyle({
        name: fileName,
        id: '',
        language: '',
        contents: '',
        folderId: '',
      }),
    [fileName]
  );
  const channelId =
    useAppSelector(state => state.lab.channel && state.lab.channel.id) || '';
  const dialogControl = useDialogControl();

  // TODO: log errors to cloudwatch
  // TODO: chain of modals to handle duplicates
  const handleAdd = async () => {
    const {isSupportFileName, newFileName} = validateFileName(fileName);
    console.log({fileName, isSupportFileName, newFileName});
    if (isSupportFileName) {
      // The user wants to import a file that has the same name as a hidden support file.
      // Give the user a choice to import with a new name or cancel the import.
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericConfirmation,
        title: 'A file with this name already exists',
        message: `This file already exists in the level's support code. Would you like to import it as ${newFileName}?`,
        confirmText: `Import as ${newFileName}`,
      });
      if (results.type === 'confirm') {
        await fetchAndSaveFile(fileName, newFileName);
      }
      return;
    }
    if (newFileName !== fileName) {
      // The file name is a duplicate, but not a support file.
      // Give user the choice to replace or import with the new name.
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericConfirmation,
        title: 'A file with this name already exists',
        message: `Would you like to replace the current file with this file or import this file as ${newFileName}?`,
        confirmText: 'Replace existing file',
        neutralText: `Import as ${newFileName}`,
      });
      if (results.type === 'confirm') {
        // Import as replacement
        await fetchAndSaveFile(fileName);
      } else if (results.type === 'neutral') {
        // Import as new file
        await fetchAndSaveFile(fileName, newFileName);
      }
      return;
    } else {
      // Fetch backpack file content and import new file to project - not a duplicate file name.
      await fetchAndSaveFile(fileName, fileName);
    }
  };

  const fetchAndSaveFile = async (
    selectedFileName: string,
    newFileName?: string
  ) => {
    const errorMessage = `An error occurred while adding ${fileName} to your project, please try again.`;
    const response = await backpackApi.fetchFileResponse(fileName);
    if (!response || response instanceof Error) {
      console.error('Error fetching backpack file:', response);
      addAlert('danger', errorMessage);
      return;
    }
    let fileContent = '';
    let url: string | undefined = undefined;
    if (response?.headers.get('Content-Type')?.startsWith('image/')) {
      // Handle image file content as a blob, and upload as an asset.
      // Store the url as the new file contents.
      const blob = await response.blob();
      const uuid = createUuid();
      const fileType = fileName.split('.').pop();
      const uploadUrl = `/v3/assets/${channelId}/${uuid}.${fileType}`;
      try {
        await HttpClient.put(uploadUrl, blob);
      } catch (error) {
        addAlert('danger', errorMessage);
        return;
      }
      url = uploadUrl;
    } else {
      fileContent = await response.text();
    }
    if (newFileName) {
      createNewFile(newFileName, fileContent, url);
    } else {
      const fileId = findIdForFileName(selectedFileName);
      if (fileId) {
        saveFile(fileId, fileContent, url);
      } else {
        // todo: should we just create a new file if we can't find an existing one?
        console.error(
          'Could not find file ID for file name:',
          selectedFileName
        );
        addAlert('danger', errorMessage);
        return;
      }
    }
  };

  const handleDelete = () => {
    console.log('deleting file from backpack:', fileName);
  };

  return (
    <div className={moduleStyles.backpackFileChip}>
      <div className={moduleStyles.fileIconContainer}>
        <FontAwesomeV6Icon
          iconName={fileIcon.iconName}
          iconStyle={fileIcon.iconStyle}
          className={moduleStyles.fileIcon}
          iconFamily={fileIcon.isBrand ? 'brands' : undefined}
        />
      </div>
      <div className={moduleStyles.fileInfo} title={fileName}>
        <BodyThreeText className={moduleStyles.infoText}>
          <StrongText>{fileName}</StrongText>
        </BodyThreeText>
        <BodyFourText className={moduleStyles.infoText}>
          {fileExtension}
        </BodyFourText>
      </div>
      <div className={moduleStyles.fileActions}>
        <Button
          size="xs"
          isIconOnly
          icon={{iconName: 'plus'}}
          color="gray"
          type="secondary"
          onClick={handleAdd}
        />
        <ActionDropdown
          name={`backpack-options-${fileName}`}
          options={[
            {
              value: 'delete',
              label: 'Delete from Backpack',
              onClick: handleDelete,
              isOptionDestructive: true,
              icon: {iconName: 'trash', iconStyle: 'solid'},
            },
          ]}
          labelText={`${fileName} options`}
          size={'xs'}
          triggerButtonProps={{
            color: 'gray',
            icon: {iconName: 'ellipsis-vertical'},
            isIconOnly: true,
            type: 'tertiary',
            size: 'xs',
          }}
          menuPlacement="right"
        />
      </div>
    </div>
  );
};

export default BackpackFileChip;
