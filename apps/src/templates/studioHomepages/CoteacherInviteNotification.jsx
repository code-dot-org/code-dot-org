import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
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

export const showCoteacherInviteNotification = invite => {
  return !!invite && DCDO.get('show-coteacher-ui', true);
};

const CoteacherInviteNotification = ({
  isForPl,
  asyncLoadCoteacherInvite,
  asyncLoadSectionData,
  coteacherInvite,
  coteacherInviteForPl,
}) => {
  const invite = useMemo(() => {
    if (showCoteacherInviteNotification(coteacherInviteForPl) && isForPl) {
      return coteacherInviteForPl;
    } else if (showCoteacherInviteNotification(coteacherInvite) && !isForPl) {
      return coteacherInvite;
    }
    return null;
  }, [coteacherInvite, coteacherInviteForPl, isForPl]);

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

  if (!invite) {
    return null;
  }
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
