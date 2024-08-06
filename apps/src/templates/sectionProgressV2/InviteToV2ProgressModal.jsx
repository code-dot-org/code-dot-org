import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {default as LinkedButton} from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {
  setHasSeenProgressTableInvite,
  setDateProgressTableInvitationDelayed,
  setShowProgressTableV2,
} from '@cdo/apps/templates/currentUserRedux';
import i18n from '@cdo/locale';

import styles from './progress-v2-invitation.module.scss';

const newProgressViewGraphic = require('@cdo/static/teacherDashboard/progressOpenBetaAnnouncementGraphic.png');

const MILLISECONDS_IN_ONE_DAY = 1000 * 3600 * 24;

function InviteToV2ProgressModal({
  sectionId,
  setHasJustSwitchedToV2,

  // from redux
  dateProgressTableInvitationDelayed,
  hasSeenProgressTableInvite,
  setHasSeenProgressTableInvite,
  setShowProgressTableV2,
  setDateProgressTableInvitationDelayed,
}) {
  const [invitationOpen, setInvitationOpen] = React.useState(false);

  React.useEffect(() => {
    if (
      dateProgressTableInvitationDelayed === undefined ||
      hasSeenProgressTableInvite === undefined
    ) {
      // Do not proceed if data has not been fully loaded.
      return;
    }

    const numDaysSinceInvitationLastDelayed = () => {
      const startingDate = new Date(dateProgressTableInvitationDelayed);
      const today = new Date();
      const differenceInMilliseconds = today.getTime() - startingDate.getTime();
      const differenceInDays =
        differenceInMilliseconds / MILLISECONDS_IN_ONE_DAY;
      return Math.floor(differenceInDays);
    };

    const showInvitation = () => {
      const alreadyViewedInvitation = !!hasSeenProgressTableInvite;
      if (alreadyViewedInvitation) {
        return false;
      } else {
        if (!!dateProgressTableInvitationDelayed) {
          return numDaysSinceInvitationLastDelayed() > 3;
        } else {
          return true;
        }
      }
    };

    setInvitationOpen(showInvitation());
  }, [dateProgressTableInvitationDelayed, hasSeenProgressTableInvite]);

  const closeModal = () => {
    setInvitationOpen(false);
  };

  const handleDismiss = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_SEEN_INVITATION, {
      sectionId,
    });
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_DISMISS_INVITATION, {
      sectionId,
    });
    setHasSeenProgressTableInviteData(false);
    setHasSeenProgressTableInvite(true);
    closeModal();
  }, [sectionId, setHasSeenProgressTableInvite]);

  const handleAcceptedInvitation = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_SEEN_INVITATION, {
      sectionId,
    });
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_ACCEPT_INVITATION, {
      sectionId,
    });
    setHasSeenProgressTableInviteData(true);
    setHasSeenProgressTableInvite(true);
    setShowProgressTableV2(true);
    setHasJustSwitchedToV2(true);
    closeModal();
  }, [
    sectionId,
    setHasSeenProgressTableInvite,
    setShowProgressTableV2,
    setHasJustSwitchedToV2,
  ]);

  const handleDelayInvitation = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_SEEN_INVITATION, {
      sectionId,
    });
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_DELAY_INVITATION, {
      sectionId,
    });
    setDateInvitationDelayed(new Date());
    setDateProgressTableInvitationDelayed(new Date());
    closeModal();
  }, [sectionId, setDateProgressTableInvitationDelayed]);

  const setDateInvitationDelayed = date => {
    return $.post(`/api/v1/users/date_progress_table_invitation_last_delayed`, {
      date_progress_table_invitation_last_delayed: date,
    });
  };

  const setHasSeenProgressTableInviteData = acceptedInvitation => {
    return $.post(`/api/v1/users/has_seen_progress_table_v2_invitation`, {
      has_seen_progress_table_v2_invitation: true,
      show_progress_table_v2: acceptedInvitation,
    });
  };

  if (invitationOpen) {
    return (
      <AccessibleDialog
        onClose={closeModal}
        onDismiss={handleDismiss}
        initialFocus={false}
        className={styles.modal}
      >
        <div
          role="region"
          aria-label={i18n.dialogAnnouncement()}
          className={styles.dialog}
        >
          <img src={newProgressViewGraphic} alt="" />
          <Heading2>{i18n.progressTrackingAnnouncement()}</Heading2>
          <BodyTwoText>{i18n.progressTrackingInvite()}</BodyTwoText>
          <Button
            id="accept-invitation"
            text={i18n.tryItNow()}
            onClick={handleAcceptedInvitation}
            type="primary"
            size="l"
          />
          <LinkedButton
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
  setHasSeenProgressTableInvite: PropTypes.func.isRequired,
  sectionId: PropTypes.number,
  setHasJustSwitchedToV2: PropTypes.func.isRequired,
  dateProgressTableInvitationDelayed: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),
  hasSeenProgressTableInvite: PropTypes.bool,
  setDateProgressTableInvitationDelayed: PropTypes.func.isRequired,
  setShowProgressTableV2: PropTypes.func.isRequired,
};

export const UnconnectedInviteToV2ProgressModal = InviteToV2ProgressModal;

export default connect(
  state => ({
    dateProgressTableInvitationDelayed:
      state.currentUser.dateProgressTableInvitationDelayed,
    hasSeenProgressTableInvite: state.currentUser.hasSeenProgressTableInvite,
  }),
  dispatch => ({
    setHasSeenProgressTableInvite: hasSeenProgressTableInvite =>
      dispatch(setHasSeenProgressTableInvite(hasSeenProgressTableInvite)),
    setShowProgressTableV2: showProgressTableV2 =>
      dispatch(setShowProgressTableV2(showProgressTableV2)),
    setDateProgressTableInvitationDelayed: dateProgressTableInvitationDelayed =>
      dispatch(
        setDateProgressTableInvitationDelayed(
          dateProgressTableInvitationDelayed
        )
      ),
  })
)(InviteToV2ProgressModal);
