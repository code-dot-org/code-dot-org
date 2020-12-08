/** @file Notifications showing results of the join/leave section operation. */
import PropTypes from 'prop-types';
import React from 'react';
import Notification from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default function JoinSectionNotifications({
  action,
  result,
  sectionName,
  sectionCode
}) {
  if (action === 'join' && result === 'success') {
    return <JoinSectionSuccessNotification sectionName={sectionName} />;
  } else if (action === 'leave' && result === 'success') {
    return (
      <LeaveSectionSuccessNotification
        sectionName={sectionName}
        sectionCode={sectionCode}
      />
    );
  } else if (action === 'join' && result === 'section_notfound') {
    return <JoinSectionNotFoundNotification sectionCode={sectionCode} />;
  } else if (action === 'join' && result === 'fail') {
    return <JoinSectionFailNotification sectionCode={sectionCode} />;
  } else if (action === 'join' && result === 'exists') {
    return <JoinSectionExistsNotification sectionName={sectionName} />;
  }
  return null;
}
JoinSectionNotifications.propTypes = {
  action: PropTypes.string,
  result: PropTypes.string,
  sectionName: PropTypes.string,
  sectionCode: PropTypes.string
};

const JoinSectionSuccessNotification = ({sectionName}) => (
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

const LeaveSectionSuccessNotification = ({sectionName, sectionCode}) => (
  <Notification
    type="success"
    notice={i18n.sectionsNotificationSuccess()}
    details={i18n.sectionsNotificationLeaveSuccess({sectionName, sectionCode})}
    dismissible={true}
  />
);
LeaveSectionSuccessNotification.propTypes =
  JoinSectionSuccessNotification.propTypes;

const JoinSectionNotFoundNotification = ({sectionCode}) => (
  <Notification
    type="failure"
    notice={i18n.sectionsNotificationFailure()}
    details={i18n.sectionsNotificationJoinNotFound({sectionCode})}
    dismissible={true}
  />
);
JoinSectionNotFoundNotification.propTypes = {
  sectionCode: PropTypes.string.isRequired
};

const JoinSectionFailNotification = ({sectionCode}) => (
  <Notification
    type="failure"
    notice={i18n.sectionsNotificationFailure()}
    details={i18n.sectionsNotificationJoinFail({sectionCode})}
    dismissible={true}
  />
);
JoinSectionFailNotification.propTypes =
  JoinSectionNotFoundNotification.propTypes;

const JoinSectionExistsNotification = ({sectionName}) => (
  <Notification
    type="success"
    notice={i18n.sectionsNotificationSuccess()}
    details={i18n.sectionsNotificationJoinExists({sectionName})}
    dismissible={true}
  />
);
JoinSectionExistsNotification.propTypes =
  JoinSectionSuccessNotification.propTypes;
