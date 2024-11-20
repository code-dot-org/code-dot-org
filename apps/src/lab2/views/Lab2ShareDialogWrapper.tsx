import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import ShareDialogLegacy from '@cdo/apps/code-studio/components/ShareDialog';
import {hideShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import popupWindow from '@cdo/apps/code-studio/popup-window';
import {LABS_USING_NEW_SHARE_DIALOG} from '@cdo/apps/lab2/constants';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {isSignedIn as getIsSignedIn} from '@cdo/apps/templates/currentUserRedux';
import {
  getSubmissionStatus,
  SubmissionStatusType,
} from '@cdo/apps/templates/projects/submitProjectDialog/submitProjectApi';
import SubmitProjectDialog from '@cdo/apps/templates/projects/submitProjectDialog/SubmitProjectDialog';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {LabState} from '../lab2Redux';

import ShareDialog from './dialogs/ShareDialog';

/**
 * Wrapper around ShareDialog that plumbs in the necessary props for a Lab2 project.
 */
const Lab2ShareDialogWrapper: React.FunctionComponent<
  Lab2ShareDialogWrapperProps
> = ({shareDialogId, shareUrl, finishUrl}) => {
  const isProjectLevel =
    useSelector(
      (state: {lab: LabState}) => state.lab.levelProperties?.isProjectLevel
    ) || false;
  const projectType = useSelector(
    (state: {lab: LabState}) => state.lab.channel?.projectType
  );
  const channelId = useSelector(
    (state: {lab: LabState}) => state.lab.channel?.id
  );
  const isSignedIn: boolean = useSelector(
    (state: {
      currentUser: {signInState: 'Unknown' | 'SignedIn' | 'SignedOut'};
    }) => getIsSignedIn(state.currentUser)
  );
  const is13Plus = useSelector(
    (state: {currentUser: {under13: boolean}}) => !state.currentUser.under13
  );
  // State to track which dialog is displayed (share or submit).
  const [dialogPanel, setDialogPanel] = useState<'share' | 'submit'>('share');
  const isDialogOpen = useSelector(
    (state: {shareDialog: {isOpen: boolean}}) => state.shareDialog.isOpen
  );
  // We don't currently support dance party projects in Lab2.
  const selectedSong = null;
  // TODO: support thumbnail url.
  const thumbnailUrl = null;
  // TODO: support abuse reporting.
  const exceedsAbuseThreshold = false;
  // TODO: When we support publishing, we can use this logic to determine if we can publish
  // const canPublish = isSignedIn && projectType && AllPublishableProjectTypes.includes(projectType);
  const canPublish = false;
  // TODO: this should come from labRedux once we support publishing.
  const isPublished = false;
  const canShareSocial = isSignedIn && is13Plus;

  const [submissionStatus, setSubmissionStatus] = useState<
    SubmissionStatusType | undefined
  >(undefined);

  const fetchSubmissionStatusHandleError = (
    channelId: string,
    projectType: string
  ) => {
    getSubmissionStatus(channelId, projectType)
      .then(response => setSubmissionStatus(response))
      .catch(error => {
        if (!(error instanceof NetworkError && error.response.status === 403)) {
          MetricsReporter.logError({
            event: MetricEvent.SUBMISSION_STATUS_UNEXPECTED_ERROR,
            errorMessage: 'Unexpected error in getting submission status.',
            projectType: projectType,
            channelId: channelId,
          });
        }
      });
  };

  useEffect(() => {
    // Only signed-in users can submit projects to be considered for the featured project gallery.
    if (channelId && projectType && isSignedIn) {
      fetchSubmissionStatusHandleError(channelId, projectType);
    }
  }, [channelId, isSignedIn, projectType]);

  const dispatch = useAppDispatch();
  const onCloseSubmitProjectDialog = useCallback(() => {
    setDialogPanel('share');
    dispatch(hideShareDialog());
  }, [dispatch]);

  const onGoBack = () => {
    setDialogPanel('share');
    // If the project was submitted successfully, the submission status is updated (only for signed-in users).
    if (channelId && projectType && isSignedIn) {
      fetchSubmissionStatusHandleError(channelId, projectType);
    }
  };

  const onSubmitClick = () => {
    setDialogPanel('submit');
    analyticsReporter.sendEvent(
      EVENTS.SHARING_DIALOG_SUBMIT_TO_BE_FEATURED,
      {
        lab_type: projectType,
        channel_id: channelId,
      },
      PLATFORMS.STATSIG
    );
  };

  if (!isDialogOpen || !channelId || !projectType) {
    return null;
  }

  if (LABS_USING_NEW_SHARE_DIALOG.includes(projectType)) {
    return dialogPanel === 'share' ? (
      <ShareDialog
        dialogId={shareDialogId}
        shareUrl={shareUrl}
        finishUrl={finishUrl}
        projectType={projectType}
        onSubmitClick={onSubmitClick}
        submissionStatus={submissionStatus}
        channelId={channelId}
      />
    ) : (
      <SubmitProjectDialog
        onClose={onCloseSubmitProjectDialog}
        onGoBack={onGoBack}
        projectType={projectType}
        channelId={channelId}
      />
    );
  }

  return (
    <ShareDialogLegacy
      isProjectLevel={isProjectLevel}
      allowSignedOutShare={projectType === 'dance'}
      shareUrl={shareUrl}
      selectedSong={selectedSong}
      thumbnailUrl={thumbnailUrl}
      isAbusive={exceedsAbuseThreshold}
      canPrint={projectType === 'artist'}
      canPublish={canPublish}
      isPublished={isPublished}
      channelId={channelId}
      appType={projectType}
      onClickPopup={popupWindow}
      canShareSocial={canShareSocial}
      userSharingDisabled={false}
    />
  );
};

interface Lab2ShareDialogWrapperProps {
  shareDialogId?: string;
  shareUrl: string;
  finishUrl?: string;
}

export default Lab2ShareDialogWrapper;
