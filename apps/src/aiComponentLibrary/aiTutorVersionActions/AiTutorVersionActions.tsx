import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useState, useCallback} from 'react';

import AiTutorVersionFileChip from '@cdo/apps/aiComponentLibrary/aiTutorVersionFileChip/AiTutorVersionFileChip';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectFile} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {
  acceptAiTutorVersion,
  rejectAiTutorVersion,
} from '@cdo/apps/weblab2/weblab2ReduxThunks';

import moduleStyles from './ai-tutor-version-actions.module.scss';

interface AiTutorVersionActionsProps {
  files: ProjectFile[];
}

/**
 * Component that displays AI Tutor modified files and provides Accept/Reject actions.
 * Used when AI Tutor suggests changes to project files.
 */
const AiTutorVersionActions: React.FC<AiTutorVersionActionsProps> = ({
  files,
}) => {
  const [commitDescription, setCommitDescription] = useState('');
  const [isAcceptMode, setIsAcceptMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useAppDispatch();

  const handleSaveAiTutorVersion = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await dispatch(acceptAiTutorVersion({files, commitDescription}));
    } catch (error) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(
          'Error saving and accepting AI Tutor version changes:',
          error as Error
        );
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, files, commitDescription, isSaving]);

  const handleReject = useCallback(() => {
    dispatch(rejectAiTutorVersion(files));
  }, [dispatch, files]);

  return (
    <div className={moduleStyles.container}>
      <div className={moduleStyles.fileList}>
        {files.map(file => (
          <AiTutorVersionFileChip key={file.id} file={file} />
        ))}
      </div>
      {!isAcceptMode && (
        <div className={moduleStyles.buttonContainer}>
          <MuiButton
            variant="outlined"
            color="tertiary"
            size="small"
            className={moduleStyles.actionButton}
            onClick={handleReject}
            type="button"
            startIcon={
              <FontAwesomeV6Icon
                iconStyle="solid"
                iconName="close"
                title="Reject"
              />
            }
          >
            Reject
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            className={moduleStyles.actionButton}
            onClick={() => setIsAcceptMode(true)}
            type="button"
            startIcon={
              <FontAwesomeV6Icon
                iconStyle="solid"
                iconName="check"
                title="Accept"
              />
            }
          >
            Accept
          </MuiButton>
        </div>
      )}
      {isAcceptMode && (
        <div className={moduleStyles.saveAiTutorVersionDescription}>
          <div className={moduleStyles.saveAiTutorVersionDescriptionInput}>
            <textarea
              id="ai-tutor-version-commit-description"
              onChange={e => setCommitDescription(e.target.value)}
              onKeyDown={e => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !isSaving &&
                  commitDescription.trim() !== ''
                ) {
                  e.preventDefault();
                  handleSaveAiTutorVersion();
                }
              }}
              value={commitDescription}
              className={moduleStyles.textArea}
              placeholder={
                'Describe what AI changed (maximum of 180 characters).'
              }
              maxLength={180}
            />
            This is what you'll see in the version history.
          </div>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            className={moduleStyles.saveAiTutorVersionButton}
            id="save-ai-tutor-version-button"
            disabled={isSaving || commitDescription.trim() === ''}
            onClick={handleSaveAiTutorVersion}
            type="button"
            startIcon={<FontAwesomeV6Icon iconName="save" iconStyle="solid" />}
          >
            Accept and save version
          </MuiButton>
        </div>
      )}
    </div>
  );
};

export default AiTutorVersionActions;
