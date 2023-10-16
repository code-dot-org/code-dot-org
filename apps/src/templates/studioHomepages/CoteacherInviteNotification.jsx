import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import {asyncLoadCoteacherInvite} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import Button from '../Button';
import {BodyTwoText, StrongText} from '@cdo/apps/componentLibrary/typography';
import HttpClient from '@cdo/apps/util/HttpClient';
import DCDO from '@cdo/apps/dcdo';

export const showCoteacherInviteNotification = coteacherInvite => {
  return !!coteacherInvite && DCDO.get('show-coteacher-ui', false);
};

const CoteacherInviteNotification = ({
  asyncLoadCoteacherInvite,
  coteacherInvite,
}) => {
  if (!showCoteacherInviteNotification(coteacherInvite)) {
    return null;
  }

  const buttonAction = api => {
    HttpClient.put(api, '', true)
      .then(() => {
        asyncLoadCoteacherInvite();
      })
      .catch(err => console.error(err));
  };

  const acceptCoteacherInvite = id =>
    buttonAction(`/api/v1/section_instructors/${id}/accept`);

  const declineCoteacherInvite = id =>
    buttonAction(`/api/v1/section_instructors/${id}/decline`);

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
