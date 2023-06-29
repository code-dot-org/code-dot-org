import ShareDialog from '@cdo/apps/code-studio/components/ShareDialog';
import React from 'react';
import {useSelector} from 'react-redux';
import {LabState} from '../labRedux';
import {isSignedIn as getIsSignedIn} from '@cdo/apps/templates/currentUserRedux';
import popupWindow from '@cdo/apps/code-studio/popup-window';

const ProjectWrappedShareDialog: React.FunctionComponent<
  ProjectWrappedShareDialogProps
> = ({shareUrl}) => {
  const isProjectLevel = useSelector(
    (state: {lab: LabState}) => state.lab.isProjectLevel
  );
  const appType = useSelector(
    (state: {lab: LabState}) => state.lab.channel?.projectType
  );
  const channelId = useSelector(
    (state: {lab: LabState}) => state.lab.channel?.id
  );
  const isSignedIn: boolean = useSelector(
    (state: {
      currentUser: {signInState: 'Unknown' | 'SignedIn' | 'SignedOut'};
    }) => getIsSignedIn(state)
  );
  const is13Plus = useSelector(
    (state: {currentUser: {under13: boolean}}) => !state.currentUser.under13
  );
  // We don't current support dance party projects in labs.
  const selectedSong = null;
  // TODO: support thumbnail url.
  const thumbnailUrl = null;
  // TODO: support abuse reporting.
  const exceedsAbuseThreshold = false;
  const canPublish = false;
  // TODO: When we support publishing, we can use this logic to determine if we can publish
  //const canPublish = isSignedIn && appType && AllPublishableProjectTypes.includes(appType);
  // TODO: this should come from ProjectManager when we support publishing.
  const isPublished = false;
  const canShareSocial = isSignedIn && is13Plus;

  if (!channelId || !appType) {
    return null;
  }

  return (
    <ShareDialog
      isProjectLevel={isProjectLevel}
      allowSignedOutShare={appType === 'dance'}
      shareUrl={shareUrl}
      selectedSong={selectedSong}
      thumbnailUrl={thumbnailUrl}
      isAbusive={exceedsAbuseThreshold}
      canPrint={appType === 'artist'}
      canPublish={canPublish}
      isPublished={isPublished}
      channelId={channelId}
      appType={appType}
      onClickPopup={popupWindow}
      canShareSocial={canShareSocial}
      userSharingDisabled={false}
    />
  );
};

interface ProjectWrappedShareDialogProps {
  shareUrl: string;
}

export default ProjectWrappedShareDialog;
