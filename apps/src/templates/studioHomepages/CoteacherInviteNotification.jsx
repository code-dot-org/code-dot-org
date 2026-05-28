import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  asyncLoadCoteacherInvite,
  asyncLoadSectionData,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

// Legacy Notification rendered the `collaborate` type with a 'users' icon
// (see apps/src/sharedComponents/Notification.jsx). Keep the same glyph here
// for visual continuity.
const COLLABORATE_ICON = {iconName: 'users'};

const CoteacherInviteNotification = ({
  isForPl,
  asyncLoadCoteacherInvite,
  asyncLoadSectionData,
  coteacherInvite,
  coteacherInviteForPl,
  // Lets the consumer opt in to a re-load of section data that might remove
  // entries (e.g. after declining an invite to a hidden section).
  destructiveLoad = false,
}) => {
  const invite = useMemo(() => {
    if (!!coteacherInviteForPl && isForPl) {
      return coteacherInviteForPl;
    } else if (!!coteacherInvite && !isForPl) {
      return coteacherInvite;
    }
    return null;
  }, [coteacherInvite, coteacherInviteForPl, isForPl]);

  const buttonAction = api => {
    HttpClient.put(api, '', true)
      .then(() => {
        asyncLoadCoteacherInvite();
        asyncLoadSectionData(null, destructiveLoad);
      })
      .catch(err => console.error(err));
  };

  const acceptCoteacherInvite = (id, sectionId) => {
    analyticsReporter.sendEvent(EVENTS.COTEACHER_INVITE_ACCEPTED, {
      sectionId: sectionId,
    });
    buttonAction(`/api/v1/section_instructors/${id}/accept`);
  };

  const declineCoteacherInvite = (id, sectionId) => {
    analyticsReporter.sendEvent(EVENTS.COTEACHER_INVITE_DECLINED, {
      sectionId: sectionId,
    });
    buttonAction(`/api/v1/section_instructors/${id}/decline`);
  };

  if (!invite) {
    return null;
  }

  return (
    <NotificationBanner
      // variant="primary" in DSCO NotificationBanner paints brand-purple,
      // which is the closest match to the legacy `collaborate` type's
      // light_secondary_500 (purple) coloring.
      variant="primary"
      icon={COLLABORATE_ICON}
      title={i18n.coteacherInvite({
        invitedByName: invite.invited_by_name,
      })}
      description={
        <>
          {i18n.coteacherInviteDescription({
            invitedByEmail: invite.invited_by_email,
          })}
          <br />
          <strong>{invite.section_name}</strong>
        </>
      }
      actions={
        <>
          <MuiButton
            onClick={() => declineCoteacherInvite(invite.id, invite.section_id)}
            size="small"
            variant="outlined"
            color="secondary"
          >
            {'Decline'}
          </MuiButton>
          <MuiButton
            onClick={() => acceptCoteacherInvite(invite.id, invite.section_id)}
            size="small"
            variant="contained"
            color="primary"
          >
            {'Accept'}
          </MuiButton>
        </>
      }
    />
  );
};

export const UnconnectedCoteacherInviteNotification =
  CoteacherInviteNotification;

export default connect(
  state => ({
    coteacherInvite: state.teacherSections.coteacherInvite,
    coteacherInviteForPl: state.teacherSections.coteacherInviteForPl,
  }),
  {
    asyncLoadCoteacherInvite,
    asyncLoadSectionData,
  }
)(CoteacherInviteNotification);

CoteacherInviteNotification.propTypes = {
  isForPl: PropTypes.bool,
  asyncLoadCoteacherInvite: PropTypes.func.isRequired,
  asyncLoadSectionData: PropTypes.func.isRequired,
  coteacherInvite: PropTypes.object,
  coteacherInviteForPl: PropTypes.object,
  destructiveLoad: PropTypes.bool,
};
