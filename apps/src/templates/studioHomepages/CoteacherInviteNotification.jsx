import React from 'react';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import Button from '../Button';
import {BodyTwoText, StrongText} from '@cdo/apps/componentLibrary/typography';

const CoteacherInviteNotification = () => {
  return (
    <Notification
      type={NotificationType.collaborate}
      iconStyles={styles.icon}
      notice={'Debra invited you to be a co-teacher'}
      details={
        <BodyTwoText style={{marginBottom: 0}}>
          d.zadinsky@cshoolname.org has invited you to co-teach
          <br />
          <StrongText>Intermediate CS - Block 3</StrongText>
        </BodyTwoText>
      }
      dismissible={false}
      buttonsStyles={styles.buttons}
      tooltipText={
        'As a co-teacher, you will be able to manage students in the section, view their work, and track their progress.'
      }
      buttons={[
        {
          text: 'Decline',
          link: 'https://google.com',
          newWindow: true,
          color: Button.ButtonColor.neutralDark,
          style: styles.declineButton,
        },
        {
          text: 'Accept',
          link: 'https://google.com',
          newWindow: true,
          color: Button.ButtonColor.brandSecondaryDefault,
          style: styles.acceptButton,
        },
      ]}
    />
  );
};

export default CoteacherInviteNotification;

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
