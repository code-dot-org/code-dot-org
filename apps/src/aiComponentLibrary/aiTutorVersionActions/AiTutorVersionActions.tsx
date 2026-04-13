import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import React, {useState, useCallback, useEffect, useLayoutEffect} from 'react';

import ChatEventLogger from '@cdo/apps/aichat/chatEventLogger';
import AiTutorVersionFileChip from '@cdo/apps/aiComponentLibrary/aiTutorVersionFileChip/AiTutorVersionFileChip';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {isViewingAiTutorVersionFileUpdates} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {ProjectFile} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import getRejectNotification from '@cdo/apps/weblab2/helpers/getRejectNotification';
import {
  acceptAiTutorVersion,
  rejectAiTutorVersion,
} from '@cdo/apps/weblab2/weblab2ReduxThunks';

import moduleStyles from './ai-tutor-version-actions.module.scss';

interface AiTutorVersionActionsProps {
  files: ProjectFile[];
  onRequestScrollToBottom: () => void;
}

/**
 * Component that displays AI Tutor modified files and provides Accept/Reject actions.
 * Used when AI Tutor suggests changes to project files.
 */
const AiTutorVersionActions: React.FC<AiTutorVersionActionsProps> = ({
  files,
  onRequestScrollToBottom,
}) => {
  const [commitDescription, setCommitDescription] = useState('');
  const [isAcceptMode, setIsAcceptMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const viewingAiTutorVersionFileUpdates = useAppSelector(
    isViewingAiTutorVersionFileUpdates
  );

  const dispatch = useAppDispatch();

  const confirmAiTutorLevelNavigation = useCallback(
    () =>
      window.confirm(
        "You have pending AI Tutor changes. If you leave this level now, you'll lose those changes. Do you want to continue to another level?"
      ),
    []
  );

  useLifecycleNotifier(
    LifecycleEvent.LevelChangeRequested,
    confirmAiTutorLevelNavigation
  );

  // Warn the user if they attempt to reload the page before accepting or
  // rejecting the proposed updates.
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Chrome requires returnValue to be set.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const possiblyRejectOnPageHide = async (event: PageTransitionEvent) => {
      if (viewingAiTutorVersionFileUpdates) {
        const notification = getRejectNotification(files);
        const payload = {
          newChatEvent: notification,
          aichatContext: ChatEventLogger.getInstance().aichatContext,
          authenticity_token: await getAuthenticityToken(),
        };

        navigator.sendBeacon(
          '/aichat_events/log_chat_event',
          new Blob([JSON.stringify(payload)], {type: 'application/json'})
        );
      }
    };

    window.addEventListener('pagehide', possiblyRejectOnPageHide);

    return () =>
      window.removeEventListener('pagehide', possiblyRejectOnPageHide);
  }, [files, viewingAiTutorVersionFileUpdates]);

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

  // Scroll to the bottom of the page when switching to accept mode,
  // so that the commit description input and save button are visible to the user.
  useLayoutEffect(() => {
    if (isAcceptMode) {
      onRequestScrollToBottom();
    }
  }, [isAcceptMode, onRequestScrollToBottom]);

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
                iconName="xmark"
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
          <div className={moduleStyles.saveAiTutorVersionActions}>
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              className={moduleStyles.saveAiTutorVersionButton}
              id="save-ai-tutor-version-button"
              disabled={isSaving || commitDescription.trim() === ''}
              onClick={handleSaveAiTutorVersion}
              type="button"
              startIcon={
                <FontAwesomeV6Icon iconName="save" iconStyle="solid" />
              }
            >
              Accept and save version
            </MuiButton>
            <WithTooltip
              tooltipProps={{
                text: 'Reject AI Changes',
                size: 's',
                tooltipId: 'secondary-reject-ai-tutor-version-tooltip',
                direction: 'onBottom',
              }}
            >
              <MuiIconButton
                variant="outlined"
                color="tertiary"
                size="small"
                onClick={handleReject}
                type="button"
                aria-label="Reject AI Changes"
              >
                <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
              </MuiIconButton>
            </WithTooltip>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiTutorVersionActions;
