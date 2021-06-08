/** @file Notifications showing results of the join/leave section operation. */
import PropTypes from 'prop-types';
import React from 'react';
import Notification from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default function JoinSectionNotifications({
                                                   action,
                                                   result,
                                                   name,
                                                   id,
                                                   sectionCapacity
                                                 }) {
  if (action === 'join' && result === 'success') {
    return <JoinSectionSuccessNotification sectionName={name} />;
  } else if (action === 'leave' && result === 'success') {
    return (
      <LeaveSectionSuccessNotification sectionName={name} sectionId={id} />
    );
  } else if (action === 'join' && result === 'section_notfound') {
    return <JoinSectionNotFoundNotification sectionId={id} />;
  } else if (action === 'join' && result === 'fail') {
    return <JoinSectionFailNotification sectionId={id} />;
  } else if (action === 'join' && result === 'exists') {
    return <JoinSectionExistsNotification sectionName={name} />;
  } else if (action === 'join' && result === 'section_owned') {
    return <JoinSectionOwnedNotification sectionId={id} />;
  } else if (action === 'join' && result === 'section_restricted') {
    return <JoinSectionRestrictedNotification sectionId={id} />;
  } else if (action === 'join' && result === 'section_full') {
    return (
        <JoinSectionFullNotification
            sectionId={id}
            sectionCapacity={sectionCapacity}
        />
    );
  }
  return null;
}
JoinSectionNotifications.propTypes = {
  action: PropTypes.string,
  result: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
  sectionCapacity: PropTypes.number
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

const LeaveSectionSuccessNotification = ({sectionName, sectionId}) => (
  <Notification
    type="success"
    notice={i18n.sectionsNotificationSuccess()}
    details={i18n.sectionsNotificationLeaveSuccess({sectionName, sectionId})}
    dismissible={true}
  />
);
LeaveSectionSuccessNotification.propTypes =
  JoinSectionSuccessNotification.propTypes;

const JoinSectionNotFoundNotification = ({sectionId}) => (
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

const JoinSectionFullNotification = ({sectionId, sectionCapacity}) => (
    <Notification
        type="failure"
        notice={i18n.sectionsNotificationFailure()}
        details={i18n.sectionsNotificationJoinFull({
          sectionId,
          sectionCapacity
        })}
        dismissible={true}
    />
);
JoinSectionFullNotification.propTypes = {
  sectionId: PropTypes.string.isRequired,
  sectionCapacity: PropTypes.number.isRequired
};

const JoinSectionRestrictedNotification = ({sectionId}) => (
  <Notification
    type="failure"
    notice={i18n.sectionsNotificationFailure()}
    details={i18n.sectionsNotificationJoinRestricted({sectionId})}
    dismissible={true}
  />
);
JoinSectionRestrictedNotification.propTypes = {
  sectionId: PropTypes.string.isRequired
};

const JoinSectionFailNotification = ({sectionId}) => (
  <Notification
    type="failure"
    notice={i18n.sectionsNotificationFailure()}
    details={i18n.sectionsNotificationJoinFail({sectionId})}
    dismissible={true}
  />
);
JoinSectionFailNotification.propTypes =
  JoinSectionNotFoundNotification.propTypes;

const JoinSectionOwnedNotification = ({sectionId}) => (
  <Notification
    type="failure"
    notice={i18n.sectionsNotificationFailure()}
    details={i18n.sectionsNotificationAlreadyOwned({sectionId})}
    dismissible={true}
  />
);
JoinSectionOwnedNotification.propTypes =
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
