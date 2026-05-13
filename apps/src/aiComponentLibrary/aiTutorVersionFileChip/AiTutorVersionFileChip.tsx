import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {getFolderPath} from '@codebridge/utils';
import {Typography, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {ViewMode} from '@cdo/apps/weblab2/types';
import {
  setAiFilePathToPreview,
  setViewMode,
} from '@cdo/apps/weblab2/weblab2Redux';

import moduleStyles from './ai-tutor-version-file-chip.module.scss';

interface AiTutorVersionFileChipProps {
  /** The project file to display */
  file: ProjectFile;
  isInReview?: boolean;
  isAccepted?: boolean;
}

/**
 * A chip component for displaying AI Tutor version files.
 * Shows the file name with a status indicator:
 * - Green with plus icon for new files
 * - Gray with checkmark for updated files
 * If the file is in review, includes an eye icon button for preview for HTML files.
 * If the file is not in review and accepted, then includes a checkmark icon.
 * If the file is not in review and rejected, then includes an X mark icon.
 */
const AiTutorVersionFileChip: React.FC<AiTutorVersionFileChipProps> = ({
  file,
  isInReview = true,
  isAccepted = true,
}) => {
  const isNewFile = file.isAiTutorVersionCreated;
  const isUpdatedFile = file.isAiTutorVersionUpdated;
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source as MultiFileSource
  );
  const isHtmlFile = getFileExtension(file.name) === 'html';
  const dispatch = useAppDispatch();
  const handlePreviewClick = () => {
    const folderPath = getFolderPath(file.folderId, source.folders).substring(
      1
    );
    const filePath =
      folderPath === '' ? file.name : folderPath + '/' + file.name;
    dispatch(setAiFilePathToPreview({path: filePath, timestamp: Date.now()}));
    dispatch(setViewMode(ViewMode.PREVIEW));
    sendLab2AnalyticsEvent(
      EVENTS.AI_TUTOR_VERSION_FILE_PREVIEW_BUTTON_CLICKED,
      {
        fileName: file.name,
        fileType: getFileExtension(file.name),
        aiTutorVersionFileUpdated: isUpdatedFile ? 'true' : 'false',
        aiTutorVersionFileCreated: isNewFile ? 'true' : 'false',
      }
    );
  };

  const statusText = isNewFile
    ? 'New file created by AI Tutor'
    : 'File updated by AI Tutor';
  const acceptanceText = !isInReview
    ? isAccepted
      ? ', accepted'
      : ', rejected'
    : '';
  const accessibleLabel = `${statusText}: ${file.name}${acceptanceText}`;

  const hasPreviewButton = isHtmlFile && isInReview;

  return (
    <div
      className={classNames(moduleStyles.chip, {
        [moduleStyles.newFile]: isNewFile,
        [moduleStyles.updatedFile]: isUpdatedFile,
      })}
    >
      <div
        className={moduleStyles.fileInfo}
        role="status"
        aria-label={accessibleLabel}
      >
        <div className={moduleStyles.statusIndicator}>
          <FontAwesomeV6Icon
            iconName={isNewFile ? 'plus-circle' : 'pen-circle'}
            iconStyle="solid"
          />
        </div>
        <Typography className={moduleStyles.fileName} variant="body3">
          {file.name}
        </Typography>
        {!isInReview && isAccepted && (
          <FontAwesomeV6Icon
            iconName="check"
            iconStyle="solid"
            className={moduleStyles.acceptedIcon}
          />
        )}
        {!isInReview && !isAccepted && (
          <FontAwesomeV6Icon
            iconName="xmark"
            iconStyle="solid"
            className={moduleStyles.rejectedIcon}
          />
        )}
      </div>
      {/* Preview button - outside role="img" so it remains accessible */}
      {hasPreviewButton && (
        <span className={moduleStyles.previewButtonWrapper}>
          <WithTooltip
            tooltipProps={{
              text: 'Open in preview',
              size: 's',
              tooltipId: `${file.name}-preview-tooltip`,
              direction: 'onTop',
            }}
          >
            <MuiIconButton
              variant="text"
              color="tertiary"
              size="extraSmall"
              onClick={handlePreviewClick}
              aria-label={`Preview ${file.name}`}
              type="button"
            >
              <FontAwesomeV6Icon iconName="eye" iconStyle="solid" />
            </MuiIconButton>
          </WithTooltip>
        </span>
      )}
    </div>
  );
};

export default AiTutorVersionFileChip;
