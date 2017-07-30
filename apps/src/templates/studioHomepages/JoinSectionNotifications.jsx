/** @file Notifications showing results of the join/leave section operation. */
import React, {PropTypes} from 'react';
import Notification from '@cdo/apps/templates/Notification';
import i18n from "@cdo/locale";

export default function JoinSectionNotifications({action, result, nameOrId}) {
  if (action === 'join' && result === 'success') {
    return <JoinSectionSuccessNotification sectionName={nameOrId}/>;
  } else if (action === 'leave' && result === 'success') {
    return <LeaveSectionSuccessNotification sectionName={nameOrId}/>;
  } else if (action === 'join' && result === 'section_notfound') {
    return <JoinSectionNotFoundNotification sectionId={nameOrId}/>;
  } else if (action === 'join' && result === 'fail') {
    return <JoinSectionFailNotification sectionId={nameOrId}/>;
  } else if (action === 'join' && result === 'exists') {
    return <JoinSectionExistsNotification sectionName={nameOrId}/>;
  }
  return null;
}
JoinSectionNotifications.propTypes = {
  action: PropTypes.string,
  result: PropTypes.string,
  nameOrId: PropTypes.string,
};

export const JoinSectionSuccessNotification = ({sectionName}) => (
  <Notification
    type="success"
    notice={i18n.sectionsNotificationSuccess()}
    details={i18n.sectionsNotificationJoinSuccess({sectionName})}
    dismissible={true}
  />
);
JoinSectionSuccessNotification.propTypes = {
  sectionName: PropTypes.string.isRequired
};

export const LeaveSectionSuccessNotification = ({sectionName}) => (
  <Notification
    type="success"
    notice={i18n.sectionsNotificationSuccess()}
    details={i18n.sectionsNotificationLeaveSuccess({sectionName})}
    dismissible={true}
  />
);
LeaveSectionSuccessNotification.propTypes = JoinSectionSuccessNotification.propTypes;

export const JoinSectionNotFoundNotification = ({sectionId}) => (
  <Notification
    type="failure"
    notice={i18n.sectionsNotificationFailure()}
    details={i18n.sectionsNotificationJoinNotFound({sectionId})}
    dismissible={true}
  />
);
JoinSectionNotFoundNotification.propTypes = {
  sectionId: PropTypes.string.isRequired
};

export const JoinSectionFailNotification =  ({sectionId}) => (
  <Notification
    type="failure"
    notice={i18n.sectionsNotificationFailure()}
    details={i18n.sectionsNotificationJoinFail({sectionId})}
    dismissible={true}
  />
);
JoinSectionFailNotification.propTypes = JoinSectionNotFoundNotification.propTypes;

export const JoinSectionExistsNotification = ({sectionName}) => (
  <Notification
    type="warning"
    notice={i18n.sectionsNotificationSuccess()}
    details={i18n.sectionsNotificationJoinExists({sectionName})}
    dismissible={true}
  />
);
JoinSectionExistsNotification.propTypes = JoinSectionSuccessNotification.propTypes;
