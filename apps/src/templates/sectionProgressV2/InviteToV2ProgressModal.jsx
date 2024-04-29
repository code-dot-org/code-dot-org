import PropTypes from 'prop-types';
import React from 'react';

import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

import styles from './progress-v2-invitation.module.scss';

const newProgressViewGraphic = require('@cdo/static/teacherDashboard/progressOpenBetaAnnouncementGraphic.png');

export default function InviteToV2ProgressModal({
  setShowProgressTableV2,
  sectionId,
}) {
  const [invitationOpen, setInvitationOpen] = React.useState(true); // in the future this will use logic and data to determine if the invitation should start open or not

  const handleDismiss = () => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_DISMISS_INVITATION, {
      sectionId: sectionId,
    });
    setInvitationOpen(false);
  };

  const handleAcceptedInvitation = () => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_ACCEPT_INVITATION, {
      sectionId: sectionId,
    });
    new UserPreferences().setShowProgressTableV2(true);
    setShowProgressTableV2(true);
  };

  const handleDelayInvitation = () => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_DELAY_INVITATION, {
      sectionId: sectionId,
    });
    setInvitationOpen(false);
    new UserPreferences().setDateInvitationDelayed(new Date());
    // send data indicating the invitation was delayed
    console.log('delayed invitation');
  };

  if (invitationOpen) {
    return (
      <AccessibleDialog onClose={handleDismiss} className={styles.modal}>
        <div
          role="region"
          aria-label={i18n.directionsForAssigningSections()}
          className={styles.dialog}
        >
          <button
            id="ui-close-dialog"
            type="button"
            onClick={handleDismiss}
            className={styles.xCloseButton}
          >
            <i id="x-close" className="fa-solid fa-xmark" />
          </button>
          <img src={newProgressViewGraphic} alt="" />
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
            className={styles.remindMeLaterButton}
          />
        </div>
      </AccessibleDialog>
    );
  } else {
    return null;
  }
}

InviteToV2ProgressModal.propTypes = {
  setShowProgressTableV2: PropTypes.func.isRequired,
  sectionId: PropTypes.number.isRequired,
};
