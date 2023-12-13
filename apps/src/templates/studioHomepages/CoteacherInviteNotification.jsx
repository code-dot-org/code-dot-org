import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import {
  asyncLoadCoteacherInvite,
  asyncLoadSectionData,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import Button from '../Button';
import {BodyTwoText, StrongText} from '@cdo/apps/componentLibrary/typography';
import HttpClient from '@cdo/apps/util/HttpClient';
import DCDO from '@cdo/apps/dcdo';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

export const showCoteacherInviteNotification = coteacherInvite => {
  return !!coteacherInvite && DCDO.get('show-coteacher-ui', true);
};

export const showCoteacherForPlInviteNotification = coteacherInviteForPl => {
  return !!coteacherInviteForPl && DCDO.get('show-coteacher-ui', true);
};

const CoteacherInviteNotification = ({
  isForPl,
  asyncLoadCoteacherInvite,
  asyncLoadSectionData,
  coteacherInvite,
  coteacherInviteForPl,
}) => {
  if (
    !(
      showCoteacherInviteNotification(coteacherInvite) ||
      showCoteacherForPlInviteNotification(coteacherInviteForPl)
    )
  ) {
    return null;
  }

  let invite;

  if (showCoteacherForPlInviteNotification(coteacherInviteForPl) && isForPl) {
    invite = coteacherInviteForPl;
  } else if (showCoteacherInviteNotification(coteacherInvite) && !isForPl) {
    invite = coteacherInvite;
  }

  const buttonAction = api => {
    HttpClient.put(api, '', true)
      .then(() => {
        asyncLoadCoteacherInvite();
        asyncLoadSectionData();
      })
      .catch(err => console.error(err));
  };

  const acceptCoteacherInvite = id => {
    analyticsReporter.sendEvent(EVENTS.COTEACHER_INVITE_ACCEPTED, {
      sectionId: coteacherInvite.section_id,
    });
    buttonAction(`/api/v1/section_instructors/${id}/accept`);
  };

  const declineCoteacherInvite = id => {
    analyticsReporter.sendEvent(EVENTS.COTEACHER_INVITE_DECLINED, {
      sectionId: coteacherInvite.section_id,
    });
    buttonAction(`/api/v1/section_instructors/${id}/decline`);
  };

  if (invite) {
    return (
      <Notification
        dismissible={false}
        type={NotificationType.collaborate}
        iconStyles={styles.icon}
        notice={i18n.coteacherInvite({
          invitedByName: invite.invited_by_name,
        })}
        details={
          <BodyTwoText style={{marginBottom: 0}}>
            {i18n.coteacherInviteDescription({
              invitedByEmail: invite.invited_by_email,
            })}
            <br />
            <StrongText>{invite.section_name}</StrongText>
          </BodyTwoText>
        }
        tooltipText={i18n.coteacherTooltip()}
        buttonsStyles={styles.buttons}
        buttons={[
          {
            text: 'Decline',
            onClick: () => declineCoteacherInvite(invite.id, invite.section_id),
            color: Button.ButtonColor.neutralDark,
            style: styles.declineButton,
          },
          {
            text: 'Accept',
            onClick: () => acceptCoteacherInvite(invite.id, invite.section_id),
            color: Button.ButtonColor.brandSecondaryDefault,
            style: styles.acceptButton,
          },
        ]}
      />
    );
  } else {
    return null;
  }
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
};

// The Notification object uses styles instead of className for legacy reasons.
const styles = {
  acceptButton: {
    marginLeft: '20px',
    marginRight: '0px',
    lineHeight: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  declineButton: {
    marginRight: 0,
    display: 'flex',
    alignItems: 'center',
  },
  buttons: {
    // center vertically
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
