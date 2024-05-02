import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {default as LinkedButton} from '@cdo/apps/templates/Button';
import {
  setHasSeenProgressTableInvite,
  setShowProgressTableV2,
  setDateProgressTableInvtationDelayed,
} from '@cdo/apps/templates/currentUserRedux';
import i18n from '@cdo/locale';

import styles from './progress-v2-invitation.module.scss';

const newProgressViewGraphic = require('@cdo/static/teacherDashboard/progressOpenBetaAnnouncementGraphic.png');

function InviteToV2ProgressModal({
  sectionId,

  // from redux
  dateProgressTableInvtationDelayed,
  hasSeenProgressTableInvite,
  setHasSeenProgressTableInvite,
  setShowProgressTableV2,
}) {
  // const [invitationOpen, setInvitationOpen] = React.useState(true);
  const [invitationOpen, setInvitationOpen] = React.useState(false);

  React.useEffect(() => {
    const timeSinceInvitationLastDelayed = () => {
      const startingDate = new Date(dateProgressTableInvtationDelayed);
      const today = new Date();
      const differenceInMilliseconds = today.getTime() - startingDate.getTime();
      const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);
      return Math.floor(differenceInDays);
    };

    const showInvitation = () => {
      const alreadyViewedInvitation = !!hasSeenProgressTableInvite;
      if (alreadyViewedInvitation) {
        return false;
      } else {
        if (!!dateProgressTableInvtationDelayed) {
          return timeSinceInvitationLastDelayed() > 3;
        } else {
          return true;
        }
      }
    };

    setInvitationOpen(showInvitation());
  }, [dateProgressTableInvtationDelayed, hasSeenProgressTableInvite]);

  const handleDismiss = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_DISMISS_INVITATION, {
      sectionId,
    });
    setHasSeenProgressTableInviteData();
    setHasSeenProgressTableInvite(true);
    setInvitationOpen(false);
  }, [sectionId, setHasSeenProgressTableInvite]);

  const handleAcceptedInvitation = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_ACCEPT_INVITATION, {
      sectionId,
    });
    setHasSeenProgressTableInviteData();
    setHasSeenProgressTableInvite(true);
    setShowProgressTableV2(true);
  }, [sectionId, setShowProgressTableV2, setHasSeenProgressTableInvite]);

  const handleDelayInvitation = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_DELAY_INVITATION, {
      sectionId,
    });
    setDateInvitationDelayed(new Date());
    setDateProgressTableInvtationDelayed(new Date());
    setInvitationOpen(false);
  }, [sectionId]);

  const setDateInvitationDelayed = date => {
    return $.post(`/api/v1/users/date_progress_table_invitation_last_delayed`, {
      date_progress_table_invitation_last_delayed: date,
    });
  };

  const setHasSeenProgressTableInviteData = () => {
    return $.post(`/api/v1/users/has_seen_progress_table_v2_invitation`, {
      has_seen_progress_table_v2_invitation: true,
    });
  };

  if (invitationOpen) {
    return (
      <AccessibleDialog onClose={() => {}} className={styles.modal}>
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
  setShowProgressTableV2: PropTypes.func.isRequired,
  setHasSeenProgressTableInvite: PropTypes.func.isRequired,
  sectionId: PropTypes.number,
  dateProgressTableInvtationDelayed: PropTypes.string,
  hasSeenProgressTableInvite: PropTypes.bool,
};

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
    setDateProgressTableInvtationDelayed: dateProgressTableInviteLastDelayed =>
      dispatch(
        setDateProgressTableInvtationDelayed(dateProgressTableInviteLastDelayed)
      ),
  })
)(InviteToV2ProgressModal);
