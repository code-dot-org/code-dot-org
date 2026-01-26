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
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {BackpackProps} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
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
  disableActions: boolean;
  setActionInProgress: (inProgress: boolean) => void;
  isSecondaryBackpack?: boolean;
  onImageFlagged?: (
    file: File,
    fileType: string,
    uploadFunction: () => Promise<void>
  ) => void;
}

const EXTENSIONS_WITH_PREVIEWS = ['png', 'jpg', 'jpeg', 'gif'];

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
  disableActions,
  setActionInProgress,
  isSecondaryBackpack,
  onImageFlagged,
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
  // If the parent tells us to, we are in read-only mode, or the file type is unsupported, disable the add button.
  const addButtonDisabled = inReadOnly || !isFileSupported || disableActions;
  const addButtonTooltipText = useMemo(() => {
    if (disableActions) {
      return 'An operation is currently in progress';
    } else if (inReadOnly) {
      return 'Cannot add files in read-only mode';
    } else if (!isFileSupported) {
      return 'File type not supported in this project';
    } else {
      return 'Add to project';
    }
  }, [disableActions, inReadOnly, isFileSupported]);

  const filePreviewUrl = useMemo(() => {
    if (fileExtension && EXTENSIONS_WITH_PREVIEWS.includes(fileExtension)) {
      const url = backpackApi.getFileFetchUrl(fileName);
      if (url) {
        return `${url}?cacheBust=${Date.now()}`;
      }
    }
    return undefined;
    // We explicitly including `isRecentlyAdded` even though it isn't used so the
    // cache bust suffix gets refreshed. This allows an image that's been replaced to
    // be refreshed properly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backpackApi, fileExtension, fileName, isRecentlyAdded]);

  const handleAdd = async (isSecondaryBackpack?: boolean) => {
    setActionInProgress(true);
    const {isSupportFileName, newFileName} = validateFileName(fileName);
    if (isSupportFileName) {
      await handleSaveSupportFile(
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
    } else if (newFileName !== fileName) {
      await handleSaveDuplicateFile(
        dialogControl,
        backpackApi,
        channelId,
        addAlert,
        saveFileToProject,
        createNewProjectFile,
        findIdForFileName,
        fileName,
        newFileName,
        onImageFlagged,
        isSecondaryBackpack
      );
    } else {
      // Fetch backpack file content and import new file to project - not a duplicate file name.
      await fetchAndSaveFile({
        successMetric: EVENTS.IMPORT_FROM_BACKPACK_NEW,
        backpackApi,
        channelId,
        addAlert,
        saveFile: saveFileToProject,
        createNewFile: createNewProjectFile,
        findIdForFileName,
        selectedFileName: fileName,
        newFileName: fileName,
        onImageFlagged,
        isSecondaryBackpack,
      });
    }
    setActionInProgress(false);
  };

  const handleDelete = async () => {
    setActionInProgress(true);
    // Show confirmation modal
    const results = await dialogControl?.showDialog({
      type: DialogType.GenericConfirmation,
      title: 'Are you sure?',
      bodyComponent: (
        <>
          You are about to delete <strong>{fileName}</strong> from your
          Backpack.
        </>
      ),
      confirmText: 'Delete file',
      destructive: true,
      icon: {iconName: 'trash', iconStyle: 'solid'},
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
          setActionInProgress(false);
        },
        () => {
          // TODO: log to statsig
          setActionInProgress(false);
          sendLab2AnalyticsEvent(EVENTS.DELETE_FROM_BACKPACK, {
            fileType: fileExtension || '',
          });
        }
      );
    } else {
      setActionInProgress(false);
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
                onClick={() => handleAdd(isSecondaryBackpack)}
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
          disabled={disableActions}
        />
      </div>
    </div>
  );
};

export default BackpackFileChip;
