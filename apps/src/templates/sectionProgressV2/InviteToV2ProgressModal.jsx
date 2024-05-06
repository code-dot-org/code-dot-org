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
  setDateProgressTableInvitationDelayed,
} from '@cdo/apps/templates/currentUserRedux';
import i18n from '@cdo/locale';

import styles from './progress-v2-invitation.module.scss';

const newProgressViewGraphic = require('@cdo/static/teacherDashboard/progressOpenBetaAnnouncementGraphic.png');

function InviteToV2ProgressModal({
  sectionId,
  onShowProgressTableV2Change,

  // from redux
  dateProgressTableInvitationDelayed,
  hasSeenProgressTableInvite,
  setHasSeenProgressTableInvite,
  setDateProgressTableInvitationDelayed,
}) {
  // const [invitationOpen, setInvitationOpen] = React.useState(true);
  const [invitationOpen, setInvitationOpen] = React.useState(false);

  React.useEffect(() => {
    const timeSinceInvitationLastDelayed = () => {
      const startingDate = new Date(dateProgressTableInvitationDelayed);
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
        if (!!dateProgressTableInvitationDelayed) {
          return timeSinceInvitationLastDelayed() > 3;
        } else {
          return true;
        }
      }
    };

    setInvitationOpen(showInvitation());
  }, [dateProgressTableInvitationDelayed, hasSeenProgressTableInvite]);

  const handleModalClose = React.useCallback(() => {
    setHasSeenProgressTableInviteData();
    setHasSeenProgressTableInvite(true);
    setInvitationOpen(false);
  }, [setHasSeenProgressTableInvite]);

  const handleDismiss = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_DISMISS_INVITATION, {
      sectionId,
    });
    setHasSeenProgressTableInviteData();
    setHasSeenProgressTableInvite(true);
    setInvitationOpen(false);
  }, [sectionId, setHasSeenProgressTableInvite]);

  // pass in onshowprogressV2 change and call that when accepted.
  // you will need to pass in the function to the modal

  const handleAcceptedInvitation = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_ACCEPT_INVITATION, {
      sectionId,
    });
    setHasSeenProgressTableInviteData();
    setHasSeenProgressTableInvite(true);
    onShowProgressTableV2Change();
  }, [sectionId, onShowProgressTableV2Change, setHasSeenProgressTableInvite]);

  const handleDelayInvitation = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_DELAY_INVITATION, {
      sectionId,
    });
    setDateInvitationDelayed(new Date());
    setDateProgressTableInvitationDelayed(new Date());
    setInvitationOpen(false);
  }, [sectionId, setDateProgressTableInvitationDelayed]);

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
      <AccessibleDialog
        onClose={handleModalClose}
        initialFocus={false}
        className={styles.modal}
      >
        <div
          role="region"
          aria-label={i18n.dialogAnnouncement()}
          className={styles.dialog}
        >
          <button
            id="ui-close-dialog"
            type="button"
            onClick={handleDismiss}
            aria-label={i18n.closeDialog()}
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
  onShowProgressTableV2Change: PropTypes.func.isRequired,
  setHasSeenProgressTableInvite: PropTypes.func.isRequired,
  sectionId: PropTypes.number,
  dateProgressTableInvitationDelayed: PropTypes.string,
  hasSeenProgressTableInvite: PropTypes.bool,
  setDateProgressTableInvitationDelayed: PropTypes.func.isRequired,
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
    setDateProgressTableInvitationDelayed: dateProgressTableInvitationDelayed =>
      dispatch(
        setDateProgressTableInvitationDelayed(
          dateProgressTableInvitationDelayed
        )
      ),
  })
)(InviteToV2ProgressModal);
