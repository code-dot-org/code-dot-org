import Button from '@code-dot-org/component-library/button';
import React, {useCallback} from 'react';

import {addChatEvent} from '@cdo/apps/aichat/redux/thunks/addChatEvent';
import {getNewRemoveId} from '@cdo/apps/aichat/redux/utils';
import {Notification} from '@cdo/apps/aichat/types/chatEvents';
import {
  setProjectSourceBeforeAiTutorVersion,
  setSource,
  setViewingAiTutorVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  setAiFilePathToPreview,
  setAiTutorVersionFiles,
} from '@cdo/apps/weblab2/redux';

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
  const prevSource = useAppSelector(
    state => state.lab2Project.projectSourceBeforeAiTutorVersion
  );
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  );

  const resetAiTutorVersion = useCallback(() => {
    dispatch(setViewingAiTutorVersion(false));
    dispatch(setAiFilePathToPreview(undefined));
    dispatch(setProjectSourceBeforeAiTutorVersion(undefined));
    dispatch(setAiTutorVersionFiles(undefined));
  }, [dispatch]);

  const handleAccept = useCallback(() => {
    const notification: Notification = {
      timestamp: Date.now(),
      removeId: getNewRemoveId(),
      text: "You accepted AI Tutor's changes.",
      notificationType: 'success',
      includeInChatHistory: true,
      hideTimestamp: true,
    };
    dispatch(addChatEvent(notification));
    resetAiTutorVersion();
    // Update current source so that isAiTutorVersionUpdated and isAiTutorVersionCreated are set to false.
    if (source) {
      const sourceToUpdate = source as MultiFileSource;
      const updatedSource = {
        ...sourceToUpdate,
        files: Object.fromEntries(
          Object.entries(sourceToUpdate.files).map(([fileId, file]) => [
            fileId,
            {
              ...file,
              isAiTutorVersionUpdated: false,
              isAiTutorVersionCreated: false,
            },
          ])
        ),
      };
      dispatch(setSource(updatedSource));
    }
  }, [dispatch, source, resetAiTutorVersion]);

  const handleReject = useCallback(() => {
    const notification: Notification = {
      timestamp: Date.now(),
      removeId: getNewRemoveId(),
      text: "You rejected AI Tutor's changes.",
      notificationType: 'error',
      includeInChatHistory: true,
      hideTimestamp: true,
    };
    dispatch(addChatEvent(notification));
    dispatch(setSource(prevSource || (source as MultiFileSource)));
    resetAiTutorVersion();
  }, [dispatch, prevSource, source, resetAiTutorVersion]);

  return (
    <>
      <div className={moduleStyles.fileList}>
        {files.map(file => (
          <div key={file.id} className={moduleStyles.fileItem}>
            {file.name}
            {': '}
            {file.isAiTutorVersionUpdated ? 'Updated' : 'Created'}
          </div>
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
        />
      </div>
    </>
  );
};

export default AiTutorVersionActions;
