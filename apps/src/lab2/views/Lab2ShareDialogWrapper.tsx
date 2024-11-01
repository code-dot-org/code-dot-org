import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import ShareDialogLegacy from '@cdo/apps/code-studio/components/ShareDialog';
import {
  hideShareDialog,
  showShareDialog,
} from '@cdo/apps/code-studio/components/shareDialogRedux';
import popupWindow from '@cdo/apps/code-studio/popup-window';
import {LABS_USING_NEW_SHARE_DIALOG} from '@cdo/apps/lab2/constants';
import {SubmissionStatusType} from '@cdo/apps/lab2/views/dialogs/types';
import {isSignedIn as getIsSignedIn} from '@cdo/apps/templates/currentUserRedux';
import {getSubmissionStatus} from '@cdo/apps/templates/projects/submitProjectDialog/submitProjectApi';
import SubmitProjectDialog from '@cdo/apps/templates/projects/submitProjectDialog/SubmitProjectDialog';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {LabState} from '../lab2Redux';

import ShareDialog from './dialogs/ShareDialog';

/**
 * Wrapper around ShareDialog that plumbs in the necessary props for a Lab2 project.
 */
const Lab2ShareDialogWrapper: React.FunctionComponent<
  Lab2ShareDialogWrapperProps
> = ({dialogId, shareUrl, finishUrl}) => {
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
  const isShareDialogOpen = useSelector(
    (state: {shareDialog: {isOpen: boolean}}) => state.shareDialog.isOpen
  );
  const [isSubmitProjectDialogOpen, setIsSubmitProjectDialogOpen] =
    useState(false);
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

  const dispatch = useAppDispatch();
  const [submissionStatus, setSubmissionStatus] = useState<
    SubmissionStatusType | undefined
  >(undefined);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getSubmissionStatus();
        console.log('response.status', response.status);
        setSubmissionStatus(response.status);
      } catch (error) {
        console.error('Error fetching submission status', error);
      }
    };
    fetchStatus();
  }, []);

  const onCloseSubmitProjectDialog = () => {
    setIsSubmitProjectDialogOpen(false);
  };

  const onGoBack = () => {
    setIsSubmitProjectDialogOpen(false);
    dispatch(showShareDialog());
  };

  const onSubmitClick = () => {
    setIsSubmitProjectDialogOpen(true);
    dispatch(hideShareDialog());
  };

  if (!channelId || !projectType) {
    return null;
  }

  if (LABS_USING_NEW_SHARE_DIALOG.includes(projectType)) {
    return (
      <>
        {isSubmitProjectDialogOpen && (
          <SubmitProjectDialog
            onClose={onCloseSubmitProjectDialog}
            onGoBack={onGoBack}
          />
        )}
        {isShareDialogOpen && (
          <ShareDialog
            dialogId={dialogId}
            shareUrl={shareUrl}
            finishUrl={finishUrl}
            projectType={projectType}
            onSubmitClick={onSubmitClick}
            submissionStatus={submissionStatus}
          />
        )}
      </>
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
  dialogId?: string;
  shareUrl: string;
  finishUrl?: string;
}

export default Lab2ShareDialogWrapper;
