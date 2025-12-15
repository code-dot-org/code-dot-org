import Button from '@code-dot-org/component-library/button';
import React, {useCallback} from 'react';

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
  const dispatch = useAppDispatch();

  const handleAccept = useCallback(() => {
    dispatch(acceptAiTutorVersion(files));
  }, [dispatch, files]);

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
          onClick={handleAccept}
          className={moduleStyles.actionButton}
        />
      </div>
    </div>
  );
};

export default AiTutorVersionActions;
