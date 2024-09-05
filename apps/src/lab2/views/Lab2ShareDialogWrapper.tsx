import React from 'react';
import {useSelector} from 'react-redux';

import ShareDialogLegacy from '@cdo/apps/code-studio/components/ShareDialog';
import popupWindow from '@cdo/apps/code-studio/popup-window';
import {LABS_USING_NEW_SHARE_DIALOG} from '@cdo/apps/lab2/constants';
import {isSignedIn as getIsSignedIn} from '@cdo/apps/templates/currentUserRedux';

import {LabState} from '../lab2Redux';

import ShareDialog from './dialogs/ShareDialog';

/**
 * Wrapper around ShareDialog that plumbs in the necessary props for a Lab2 project.
 */
const Lab2ShareDialogWrapper: React.FunctionComponent<
  Lab2ShareDialogWrapperProps
> = ({shareUrl}) => {
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
  const isOpen = useSelector(
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

  if (!channelId || !projectType) {
    return null;
  }

  if (LABS_USING_NEW_SHARE_DIALOG.includes(projectType)) {
    if (!isOpen) {
      return null;
    }

    return <ShareDialog shareUrl={shareUrl} projectType={projectType} />;
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
  shareUrl: string;
}

export default Lab2ShareDialogWrapper;
