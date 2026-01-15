import Button from '@code-dot-org/component-library/button';
import React, {useState, useCallback} from 'react';

import AiTutorVersionFileChip from '@cdo/apps/aiComponentLibrary/aiTutorVersionFileChip/AiTutorVersionFileChip';
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

  const handleSaveAiTutorVersion = useCallback(() => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      dispatch(acceptAiTutorVersion({files, commitDescription}));
    } catch (error) {
      console.error(
        'Error saving and accepting AI Tutor version changes:',
        error
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
          <Button
            text="Reject"
            size="s"
            color="gray"
            type="secondary"
            iconLeft={{
              iconStyle: 'solid',
              iconName: 'close',
              title: 'Reject',
            }}
            onClick={handleReject}
            className={moduleStyles.actionButton}
          />
          <Button
            text="Accept"
            size="s"
            type="primary"
            color="purple"
            iconLeft={{
              iconStyle: 'solid',
              iconName: 'check',
              title: 'Accept',
            }}
            onClick={() => setIsAcceptMode(true)}
            className={moduleStyles.actionButton}
          />
        </div>
      )}
      {isAcceptMode && (
        <div className={moduleStyles.saveAiTutorVersionDescription}>
          <div className={moduleStyles.saveAiTutorVersionDescriptionInput}>
            <textarea
              id="ai-tutor-version-commit-description"
              onChange={e => setCommitDescription(e.target.value)}
              value={commitDescription}
              className={moduleStyles.textArea}
              placeholder={
                'Describe what AI changed (maximum of 180 characters).'
              }
              maxLength={180}
            />
            This is what you'll see in the version history.
          </div>
          <Button
            id="save-ai-tutor-version-button"
            size="s"
            type="primary"
            iconLeft={{
              iconName: 'save',
              iconStyle: 'solid',
            }}
            className={moduleStyles.saveAiTutorVersionButton}
            text={'Accept and save version'}
            onClick={handleSaveAiTutorVersion}
            disabled={isSaving || commitDescription.trim() === ''}
          />
        </div>
      )}
    </div>
  );
};

export default AiTutorVersionActions;
