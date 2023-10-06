import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import {asyncLoadCoteacherInvite} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import Button from '../Button';
import {BodyTwoText, StrongText} from '@cdo/apps/componentLibrary/typography';

const CoteacherInviteNotification = ({
  asyncLoadCoteacherInvite,
  coteacherInvite,
}) => {
  React.useEffect(() => {
    asyncLoadCoteacherInvite();
  }, [asyncLoadCoteacherInvite]);

  if (!coteacherInvite) {
    return null;
  }

  return (
    <Notification
      type={NotificationType.collaborate}
      iconStyles={styles.icon}
      notice={
        coteacherInvite.invited_by_name + ' invited you to be a co-teacher'
      }
      details={
        <BodyTwoText style={{marginBottom: 0}}>
          {coteacherInvite.invited_by_email} has invited you to co-teach
          <br />
          <StrongText>{coteacherInvite.section_name}</StrongText>
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
