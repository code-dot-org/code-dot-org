import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import {asyncLoadCoteacherInvite} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import Button from '../Button';
import {BodyTwoText, StrongText} from '@cdo/apps/componentLibrary/typography';
import HttpClient from '@cdo/apps/util/HttpClient';

const CoteacherInviteNotification = ({
  asyncLoadCoteacherInvite,
  coteacherInvite,
}) => {
  if (!coteacherInvite) {
    return null;
  }

  const acceptCoteacherInvite = id => {
    HttpClient.put(`/api/v1/section_instructors/${id}/accept`, '', true)
      .then(() => {
        asyncLoadCoteacherInvite();
      })
      .catch(err => console.error(err));
  };

  const declineCoteacherInvite = id => {
    HttpClient.put(`/api/v1/section_instructors/${id}/decline`, '', true)
      .then(() => {
        asyncLoadCoteacherInvite();
      })
      .catch(err => console.error(err));
  };

  return (
    <Notification
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
      dismissible={false}
      buttonsStyles={styles.buttons}
      tooltipText={i18n.coteacherTooltip()}
      buttons={[
        {
          text: 'Decline',
          onClick: () => declineCoteacherInvite(coteacherInvite.id),
          color: Button.ButtonColor.neutralDark,
          style: styles.declineButton,
        },
        {
          text: 'Accept',
          onClick: () => acceptCoteacherInvite(coteacherInvite.id),
          color: Button.ButtonColor.brandSecondaryDefault,
          style: styles.acceptButton,
        },
      ]}
    />
  );
};

export const UnconnectedCoteacherInviteNotification =
  CoteacherInviteNotification;

export default connect(
  state => ({
    coteacherInvite: state.teacherSections.coteacherInvite,
  }),
  {
    asyncLoadCoteacherInvite,
  }
)(CoteacherInviteNotification);

CoteacherInviteNotification.propTypes = {
  asyncLoadCoteacherInvite: PropTypes.func.isRequired,
  coteacherInvite: PropTypes.object,
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
