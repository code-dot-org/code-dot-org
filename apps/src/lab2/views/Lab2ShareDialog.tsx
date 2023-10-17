import ShareDialog from '@cdo/apps/code-studio/components/ShareDialog';
import React from 'react';
import {useSelector} from 'react-redux';
import {LabState} from '../lab2Redux';
import {isSignedIn as getIsSignedIn} from '@cdo/apps/templates/currentUserRedux';
import popupWindow from '@cdo/apps/code-studio/popup-window';

/**
 * Wrapper around ShareDialog that plumbs in the necessary props for a Lab2 project.
 */
const Lab2ShareDialog: React.FunctionComponent<Lab2ShareDialogProps> = ({
  shareUrl,
}) => {
  const isProjectLevel =
    useSelector(
      (state: {lab: LabState}) => state.lab.levelProperties?.isProjectLevel
    ) || false;
  const appType = useSelector(
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

  // We don't currently support dance party projects in Lab2.
  const selectedSong = null;
  // TODO: support thumbnail url.
  const thumbnailUrl = null;
  // TODO: support abuse reporting.
  const exceedsAbuseThreshold = false;
  // TODO: When we support publishing, we can use this logic to determine if we can publish
  // const canPublish = isSignedIn && appType && AllPublishableProjectTypes.includes(appType);
  const canPublish = false;
  // TODO: this should come from labRedux once we support publishing.
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

interface Lab2ShareDialogProps {
  shareUrl: string;
}

export default Lab2ShareDialog;
