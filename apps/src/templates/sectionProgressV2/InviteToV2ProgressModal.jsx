import PropTypes from 'prop-types';
import React from 'react';

import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

export default function InviteToV2ProgressModal({onClose, invitationStatus}) {
  //   const [invitationStatus, setInvitationStatus] = React.useState();

  // These three could be combined into one function 1) Sends data, 2) closes the modal
  const handleDismiss = () => {
    onClose();
    console.log('dismissed' + invitationStatus);
    // In the future, send data
  };

  const handleAcceptedInvitation = () => {
    console.log('accepted invitation');
  };

  const handleDelayInvitation = () => {
    console.log('delayed invitation');
  };

  return (
    <AccessibleDialog onClose={handleDismiss}>
      <div
        role="region"
        aria-label={i18n.directionsForAssigningSections()}
        className={'null'}
      >
        <button
          id="ui-close-dialog"
          type="button"
          onClick={handleDismiss}
          className={'styles.xCloseButton'}
        >
          <i id="x-close" className="fa-solid fa-xmark" />
        </button>
        <Heading2>{i18n.progressTrackingAnnouncement()}</Heading2>
        <BodyTwoText>{i18n.progressTrackingInvite()}</BodyTwoText>
        <Button
          id="accept-invitation"
          text={i18n.tryItNow()}
          onClick={handleAcceptedInvitation}
          color={Button.ButtonColor.brandSecondaryDefault}
        />
        <Button
          id="remind-me-later-option"
          text={i18n.remindMeLater()}
          onClick={handleDelayInvitation}
          styleAsText
          color={Button.ButtonColor.brandSecondaryDefault}
        />
      </div>
    </AccessibleDialog>
  );
}

InviteToV2ProgressModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  invitationStatus: PropTypes.string, //dismissed, delayed, previouslyAccepted
};

// export default connect(
//     state => ({
//       currentUser: state.currentUser,
//       isLoading: state.progressV2Feedback.isLoading,
//       progressV2Feedback: state.progressV2Feedback.progressV2Feedback,
//       errorWhenCreatingOrLoading: state.progressV2Feedback.error,
//     }),
//     {
//       createProgressV2InvitationStatus,
//       fetchProgressV2InvitationStatus,
//     }
//   )(InviteToV2ProgressModal);
