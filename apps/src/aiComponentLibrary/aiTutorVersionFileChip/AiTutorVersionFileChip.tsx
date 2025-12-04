import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {getFolderPath} from '@codebridge/utils';
import classNames from 'classnames';
import React from 'react';

import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {setAiFilePathToPreview} from '@cdo/apps/weblab2/weblab2Redux';

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
 * For HTML files, includes an eye icon button for preview.
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
  const isHtmlFile =
    file.language === 'html' || file.name.toLowerCase().endsWith('.html');
  const dispatch = useAppDispatch();
  const handlePreviewClick = () => {
    console.log('Preview clicked for file:', file.name);
    const folderPath = getFolderPath(file.folderId, source.folders).substring(
      1
    );
    const filePath =
      folderPath === '' ? file.name : folderPath + '/' + file.name;
    dispatch(setAiFilePathToPreview({path: filePath, timestamp: Date.now()}));
  };

  return (
    <div
      className={classNames(moduleStyles.chip, {
        [moduleStyles.newFile]: isNewFile,
        [moduleStyles.updatedFile]: isUpdatedFile,
      })}
    >
      <div className={moduleStyles.statusIndicator}>
        <FontAwesomeV6Icon
          iconName={isNewFile ? 'plus-circle' : 'pen-circle'}
          iconStyle="solid"
        />
      </div>
      <span className={moduleStyles.fileName}>{file.name}</span>
      {isHtmlFile && isInReview && (
        <Button
          onClick={handlePreviewClick}
          aria-label={`Preview ${file.name}`}
          size="xs"
          type="tertiary"
          color="gray"
          isIconOnly={true}
          icon={{iconName: 'eye', iconStyle: 'solid'}}
          className={moduleStyles.previewButton}
        />
      )}
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
  );
};

export default AiTutorVersionFileChip;
