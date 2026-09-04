import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {Typography, IconButton as MuiIconButton, Tooltip} from '@mui/material';
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

import isFileTypeSupported from './isFileTypeSupported';
import {onClickAddFile} from './onClickAddFile';
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
  // Backpack this file came from, used to disambiguate same-named files.
  appType?: string;
  // Display name for the Lab this file was saved from, shown when another backpack holds the same name.
  sourceDisplayName?: string;
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
  appType,
  sourceDisplayName,
  addFileTooltipText = 'Add to project',
  addFileHandler,
}) => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  const idSuffix = appType ? `-${appType}` : '';
  const fileDetailText = [
    fileExtension?.toUpperCase(),
    sourceDisplayName && `(Saved from ${sourceDisplayName})`,
  ]
    .filter(Boolean)
    .join(' ');
  const fileIcon = useMemo(
    () =>
      getFileIconNameAndStyle({
        name: fileName,
        id: '',
        contents: '',
        folderId: '',
      }),
    [fileName]
  );
  const channelId =
    useAppSelector(state => state.lab.channel && state.lab.channel.id) || '';
  const dialogControl = useDialogControl();
  const inReadOnly = useAppSelector(isReadOnlyWorkspace);
  const isFileSupported = isFileTypeSupported(fileName, supportedFileTypes);
  // If the parent tells us to, we are in read-only mode, or the file type is unsupported, disable the add button.
  const addButtonDisabled = inReadOnly || !isFileSupported || disableActions;
  const addButtonTooltipText = useMemo(() => {
    if (!isFileSupported) {
      return 'File type not supported in this project';
    } else if (disableActions) {
      return 'An operation is currently in progress';
    } else if (inReadOnly) {
      return 'Cannot add files in read-only mode';
    } else {
      return addFileTooltipText;
    }
  }, [disableActions, inReadOnly, isFileSupported, addFileTooltipText]);

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

  const handleAdd = async () => {
    // Use the addFileHandler if provided; otherwise fall back to default logic.
    if (addFileHandler) {
      onClickAddFile(
        backpackApi,
        fileName,
        addAlert,
        setActionInProgress,
        addFileHandler
      );
      return;
    }
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
        newFileName
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
        <Typography
          className={moduleStyles.infoText}
          variant="body3"
          gutterBottom
        >
          <Typography variant="strong">{fileName}</Typography>
        </Typography>
        <Typography
          className={moduleStyles.infoText}
          variant="body4"
          gutterBottom
        >
          {fileDetailText}
        </Typography>
      </div>
      <div className={moduleStyles.fileActions}>
        {isRecentlyAdded ? (
          <Tags
            tagsList={[
              {
                tooltipId: `${fileName}-recently-added${idSuffix}`,
                label: 'Added',
                tooltipContent: 'Added',
                icon: {iconName: 'check', placement: 'left'},
              },
            ]}
            size="s"
          />
        ) : (
          <Tooltip title={addButtonTooltipText} placement="top">
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable only while the button is disabled, since the tooltip is the only place the reason appears */}
            <div tabIndex={addButtonDisabled ? 0 : undefined}>
              <MuiIconButton
                variant="outlined"
                color="tertiary"
                size="extraSmall"
                onClick={handleAdd}
                type="button"
                aria-label={addButtonTooltipText}
                disabled={addButtonDisabled}
              >
                <FontAwesomeV6Icon iconName="plus" />
              </MuiIconButton>
            </div>
          </Tooltip>
        )}
        <ActionDropdown
          name={`backpack-options-${fileName}${idSuffix}`}
          options={[
            {
              value: 'delete',
              label: 'Delete from Backpack',
              onClick: handleDelete,
              isOptionDestructive: true,
              icon: {iconName: 'trash', iconStyle: 'solid'},
            },
          ]}
          labelText={
            sourceDisplayName
              ? `${fileName} from ${sourceDisplayName} options`
              : `${fileName} options`
          }
          size={'xs'}
          triggerButtonProps={{
            color: 'tertiary',
            children: <FontAwesomeV6Icon iconName="ellipsis-vertical" />,
            variant: 'text',
            size: 'extraSmall',
          }}
          menuPlacement="right"
          disabled={disableActions}
        />
      </div>
    </div>
  );
};

export default BackpackFileChip;
