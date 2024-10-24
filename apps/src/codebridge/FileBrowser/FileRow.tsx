import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import OverflowTooltip from '@codebridge/components/OverflowTooltip';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import {ProjectFile} from '@codebridge/types';
import {
  getFileIconNameAndStyle,
  getPossibleDestinationFoldersForFile,
  sendCodebridgeAnalyticsEvent,
} from '@codebridge/utils';
import classNames from 'classnames';
import fileDownload from 'js-file-download';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {usePrompts} from './hooks';
import StartModeFileDropdownOptions from './StartModeFileDropdownOptions';
import {setFileType} from './types';

import moduleStyles from './styles/filebrowser.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

interface FileRowProps {
  file: ProjectFile;
  isReadOnly: boolean;
  // If the pop-up menu is enabled, we will show the 3-dot menu button on hover.
  enableMenu: boolean;
  appName?: string;
  hasValidationFile: boolean; // If the project has a validation file already.
  isStartMode: boolean;
  handleDeleteFile: (fileId: string) => void;
  setFileType: setFileType;
}

const handleFileDownload = (file: ProjectFile, appName: string | undefined) => {
  fileDownload(file.contents, file.name);
  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_DOWNLOAD_FILE, appName);
};

/**
 * A single file row in the file browser. This component does not handle
 * drag and drop, that is handled by the parent component.
 */
const FileRow: React.FunctionComponent<FileRowProps> = ({
  file,
  isReadOnly,
  enableMenu,
  appName,
  hasValidationFile,
  isStartMode,
  handleDeleteFile,
  setFileType,
}) => {
  const {
    project: {files, folders},
    openFile,
    config: {editableFileTypes},
  } = useCodebridgeContext();
  const {openMoveFilePrompt, openRenameFilePrompt} = usePrompts();
  const {iconName, iconStyle, isBrand} = getFileIconNameAndStyle(file);
  const iconClassName = isBrand
    ? classNames('fa-brands', moduleStyles.rowIcon)
    : moduleStyles.rowIcon;
  const isLocked = !isStartMode && file.type === ProjectFileType.LOCKED_STARTER;

  const dropdownOptions = [
    {
      condition:
        !isLocked &&
        Boolean(
          getPossibleDestinationFoldersForFile({
            file,
            projectFiles: files,
            projectFolders: folders,
            isStartMode,
            validationFile: undefined,
          }).length
        ),
      iconName: 'arrow-right',
      labelText: codebridgeI18n.moveFile(),
      clickHandler: () => openMoveFilePrompt({fileId: file.id}),
    },
    {
      condition: !isLocked,
      iconName: 'pencil',
      labelText: codebridgeI18n.renameFile(),
      clickHandler: () => openRenameFilePrompt({fileId: file.id}),
    },
    {
      condition: editableFileTypes.includes(file.language),
      iconName: 'download',
      labelText: codebridgeI18n.downloadFile(),
      clickHandler: () => handleFileDownload(file, appName),
    },
    {
      condition: !isLocked,
      iconName: 'trash',
      labelText: codebridgeI18n.deleteFile(),
      clickHandler: () => handleDeleteFile(file.id),
    },
  ];

  return (
    <div className={moduleStyles.row} id={`uitest-file-${file.id}-row`}>
      <div className={moduleStyles.label} onClick={() => openFile(file.id)}>
        <FontAwesomeV6Icon
          iconName={iconName}
          iconStyle={iconStyle}
          className={iconClassName}
        />

        <OverflowTooltip
          tooltipProps={{
            text: file.name,
            tooltipId: `file-tooltip-${file.id}`,
            size: 's',
            direction: 'onBottom',
            className: darkModeStyles.tooltipBottom,
          }}
          tooltipOverlayClassName={moduleStyles.nameContainer}
          className={moduleStyles.nameContainer}
        >
          <span>{file.name}</span>
        </OverflowTooltip>
      </div>
      {!isReadOnly && enableMenu && (
        <PopUpButton
          iconName="ellipsis-v"
          className={moduleStyles['button-kebab']}
          id={`uitest-file-${file.id}-kebab`}
        >
          <span
            className={moduleStyles['button-bar']}
            id={`uitest-file-${file.id}-popup`}
          >
            {dropdownOptions.map(
              ({condition, iconName, labelText, clickHandler}, index) =>
                condition && (
                  <PopUpButtonOption
                    key={index}
                    iconName={iconName}
                    labelText={labelText}
                    clickHandler={clickHandler}
                  />
                )
            )}
            {isStartMode && (
              <StartModeFileDropdownOptions
                file={file}
                projectHasValidationFile={hasValidationFile}
                setFileType={setFileType}
              />
            )}
          </span>
        </PopUpButton>
      )}
    </div>
  );
};

export default FileRow;
