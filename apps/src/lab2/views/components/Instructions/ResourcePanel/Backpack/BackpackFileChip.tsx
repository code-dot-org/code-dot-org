import {Button} from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
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

import {
  fetchAndSaveFile,
  handleSaveDuplicateFile,
  handleSaveSupportFile,
} from './saveToBackpackHelper';

import moduleStyles from './backpack-file-chip.module.scss';

interface BackpackFileChipProps extends BackpackProps {
  fileName: string;
  backpackApi: BackpackClientApi;
  addAlert: (type: 'success' | 'danger', message: string) => void;
  isRecentlyAdded?: boolean;
}

const EXTENSIONS_WITH_PREVIEWS = ['png', 'jpg', 'jpeg'];

// TODO: add statsig logging
const BackpackFileChip: React.FC<BackpackFileChipProps> = ({
  fileName,
  backpackApi,
  addAlert,
  validateFileName,
  saveFileToProject,
  createNewProjectFile,
  findIdForFileName,
  isRecentlyAdded,
  supportedFileTypes,
}) => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
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
  const inReadOnly = useAppSelector(isReadOnlyWorkspace);
  const isFileSupported =
    fileExtension && supportedFileTypes.includes(fileExtension);
  // If we are in read-only mode or the file type is unsupported, disable the add button.
  const addButtonDisabled = inReadOnly || !isFileSupported;
  const addButtonTooltipText = useMemo(() => {
    if (inReadOnly) {
      return 'Cannot add files in read-only mode';
    } else if (!isFileSupported) {
      return 'File type not supported in this project';
    } else {
      return 'Add to project';
    }
  }, [inReadOnly, isFileSupported]);

  const filePreviewUrl = useMemo(() => {
    if (fileExtension && EXTENSIONS_WITH_PREVIEWS.includes(fileExtension)) {
      return `${backpackApi.getFileFetchUrl(fileName)}?cacheBust=${Date.now()}`;
    }
    return undefined;
    // We explicitly including `isRecentlyAdded` even though it isn't used so the
    // cache bust suffix gets refreshed. This allows an image that's been replaced to
    // be refreshed properly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backpackApi, fileExtension, fileName, isRecentlyAdded]);

  const handleAdd = async () => {
    const {isSupportFileName, newFileName} = validateFileName(fileName);
    if (isSupportFileName) {
      handleSaveSupportFile(
        dialogControl,
        backpackApi,
        channelId,
        addAlert,
        saveFileToProject,
        createNewProjectFile,
        findIdForFileName,
        fileName,
        newFileName
      );
      return;
    }
    if (newFileName !== fileName) {
      handleSaveDuplicateFile(
        dialogControl,
        backpackApi,
        channelId,
        addAlert,
        saveFileToProject,
        createNewProjectFile,
        findIdForFileName,
        fileName,
        newFileName
      );
      return;
    } else {
      // Fetch backpack file content and import new file to project - not a duplicate file name.
      await fetchAndSaveFile(
        backpackApi,
        channelId,
        addAlert,
        saveFileToProject,
        createNewProjectFile,
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
      {filePreviewUrl ? (
        <img
          src={filePreviewUrl}
          className={moduleStyles.filePreview}
          alt={fileName}
        />
      ) : (
        <div className={moduleStyles.fileIconContainer}>
          <FontAwesomeV6Icon
            iconName={fileIcon.iconName}
            iconStyle={fileIcon.iconStyle}
            className={moduleStyles.fileIcon}
            iconFamily={fileIcon.isBrand ? 'brands' : undefined}
          />
        </div>
      )}
      <div className={moduleStyles.fileInfo} title={fileName}>
        <BodyThreeText className={moduleStyles.infoText}>
          <StrongText>{fileName}</StrongText>
        </BodyThreeText>
        <BodyFourText className={moduleStyles.infoText}>
          {fileExtension?.toUpperCase()}
        </BodyFourText>
      </div>
      <div className={moduleStyles.fileActions}>
        {isRecentlyAdded ? (
          <Tags
            tagsList={[
              {
                tooltipId: `${fileName}-recently-added`,
                label: 'Added',
                tooltipContent: 'Added',
                icon: {iconName: 'check', placement: 'left'},
              },
            ]}
            size="s"
          />
        ) : (
          <WithTooltip
            tooltipProps={{
              text: addButtonTooltipText,
              tooltipId: `${fileName}-add-button-tooltip`,
              direction: 'onTop',
              size: 'xs',
            }}
          >
            <div>
              <Button
                size="xs"
                isIconOnly
                icon={{iconName: 'plus'}}
                color="gray"
                type="secondary"
                onClick={handleAdd}
                disabled={addButtonDisabled}
              />
            </div>
          </WithTooltip>
        )}
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
