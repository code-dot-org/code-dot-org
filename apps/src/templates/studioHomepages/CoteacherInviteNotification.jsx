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
    console.log(
      showCoteacherInviteNotification(coteacherInvite) ||
        showCoteacherForPlInviteNotification(coteacherInviteForPl)
    );
    return null;
  }

  const buttonAction = api => {
    HttpClient.put(api, '', true)
      .then(() => {
        asyncLoadCoteacherInvite();
        asyncLoadSectionData();
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

  if (showCoteacherInviteNotification(coteacherInvite) && !isForPl) {
    return (
      <Notification
        dismissible={false}
        type={NotificationType.collaborate}
        iconStyles={styles.icon}
        notice={i18n.coteacherInvite({
          invitedByName: coteacherInvite.invited_by_name,
        })}
        details={
          <BodyTwoText style={{marginBottom: 0}}>
            {i18n.coteacherInviteDescription({
              invitedByEmail: coteacherInvite.invited_by_email,
            })}
            <br />
            <StrongText>{coteacherInvite.section_name}</StrongText>
          </BodyTwoText>
        }
        tooltipText={i18n.coteacherTooltip()}
        buttonsStyles={styles.buttons}
        buttons={[
          {
            text: 'Decline',
            onClick: () =>
              declineCoteacherInvite(
                coteacherInvite.id,
                coteacherInvite.section_id
              ),
            color: Button.ButtonColor.neutralDark,
            style: styles.declineButton,
          },
          {
            text: 'Accept',
            onClick: () =>
              acceptCoteacherInvite(
                coteacherInvite.id,
                coteacherInvite.section_id
              ),
            color: Button.ButtonColor.brandSecondaryDefault,
            style: styles.acceptButton,
          },
        ]}
      />
    );
  }
  if (showCoteacherForPlInviteNotification(coteacherInviteForPl) && isForPl) {
    return (
      <Notification
        dismissible={false}
        type={NotificationType.collaborate}
        iconStyles={styles.icon}
        notice={i18n.coteacherInvite({
          invitedByName: coteacherInviteForPl.invited_by_name,
        })}
        details={
          <BodyTwoText style={{marginBottom: 0}}>
            {i18n.coteacherInviteDescription({
              invitedByEmail: coteacherInviteForPl.invited_by_email,
            })}
            <br />
            <StrongText>{coteacherInviteForPl.section_name}</StrongText>
          </BodyTwoText>
        }
        tooltipText={i18n.coteacherTooltip()}
        buttonsStyles={styles.buttons}
        buttons={[
          {
            text: 'Decline',
            onClick: () =>
              declineCoteacherInvite(
                coteacherInviteForPl.id,
                coteacherInviteForPl.section_id
              ),
            color: 'green',
            style: styles.declineButton,
          },
          {
            text: 'Accept',
            onClick: () =>
              acceptCoteacherInvite(
                coteacherInviteForPl.id,
                coteacherInviteForPl.section_id
              ),
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
