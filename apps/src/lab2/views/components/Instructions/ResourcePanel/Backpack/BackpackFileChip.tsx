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
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {BackpackProps} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {fetchAndSaveFile} from './saveToBackpackHelper';

import moduleStyles from './backpack-file-chip.module.scss';

interface BackpackFileChipProps extends BackpackProps {
  fileName: string;
  backpackApi: BackpackClientApi;
  addAlert: (type: 'success' | 'danger', message: string) => void;
}

// TODO: add statsig logging
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
  // If we are in read-only mode, disable the add button.
  const addButtonDisabled = useAppSelector(isReadOnlyWorkspace);

  const handleAdd = async () => {
    const {isSupportFileName, newFileName} = validateFileName(fileName);
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
        await fetchAndSaveFile(
          backpackApi,
          channelId,
          addAlert,
          saveFile,
          createNewFile,
          findIdForFileName,
          fileName,
          newFileName
        );
      }
      return;
    }
    if (newFileName !== fileName) {
      // The file name is a duplicate, but not a support file.
      // Give user the choice to replace or import with the new name.
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericConfirmation,
        title: 'A file with this name already exists',
        message: `Would you like to replace the existing file with this file or import this file as ${newFileName}?`,
        confirmText: 'Replace existing file',
        neutralText: `Import as ${newFileName}`,
      });
      if (results.type === 'confirm') {
        // Import as replacement
        await fetchAndSaveFile(
          backpackApi,
          channelId,
          addAlert,
          saveFile,
          createNewFile,
          findIdForFileName,
          fileName
        );
      } else if (results.type === 'neutral') {
        // Import as new file
        await fetchAndSaveFile(
          backpackApi,
          channelId,
          addAlert,
          saveFile,
          createNewFile,
          findIdForFileName,
          fileName,
          newFileName
        );
      }
      return;
    } else {
      // Fetch backpack file content and import new file to project - not a duplicate file name.
      await fetchAndSaveFile(
        backpackApi,
        channelId,
        addAlert,
        saveFile,
        createNewFile,
        findIdForFileName,
        fileName,
        fileName
      );
    }
  };

  const handleDelete = async () => {
    // Show confirmation modal
    const results = await dialogControl?.showDialog({
      type: DialogType.GenericConfirmation,
      title: 'Are you sure?',
      message: `You are about to delete ${fileName} from your Backpack.`,
      confirmText: 'Delete',
      destructive: true,
    });
    if (results.type === 'confirm') {
      backpackApi.deleteFiles(
        [fileName],
        error => {
          addAlert(
            'danger',
            `Failed to delete ${fileName} from your Backpack.`
          );
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logError('Backpack file delete error', error);
        },
        () => {
          // TODO: log to statsig
        }
      );
    }
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
          disabled={addButtonDisabled}
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
