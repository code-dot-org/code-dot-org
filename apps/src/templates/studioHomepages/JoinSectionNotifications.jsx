/** @file Notifications showing results of the join/leave section operation. */
import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {studio} from '@cdo/apps/lib/util/urlHelpers';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import styles from './join-section-notifications.module.scss';

const SUCCESS_ICON = {iconName: 'circle-check'};
const ERROR_ICON = {iconName: 'triangle-exclamation'};

// Stable className the legacy `<Notification>` wrapper rendered. Several
// cucumber scenarios (e.g. teacher_tools/pl_sections.feature) still select on
// `.announcement-notification` to wait for the join-result banner; carry the
// class on each NotificationBanner so those selectors keep matching.
const LEGACY_TEST_HOOK = 'announcement-notification';
const bannerClass = classNames(styles.banner, LEGACY_TEST_HOOK);

export default function JoinSectionNotifications({
  action,
  result,
  name,
  id,
  sectionCapacity,
  showingPlSections,
  joiningPlSection,
  onDismiss,
}) {
  if (action === 'join' && result === 'success') {
    return (
      <JoinSectionSuccessNotification
        sectionName={name}
        showingPlSections={showingPlSections}
        joiningPlSection={joiningPlSection}
        onClose={onDismiss}
      />
    );
  } else if (action === 'leave' && result === 'success') {
    return (
      <LeaveSectionSuccessNotification
        sectionName={name}
        sectionId={id}
        onClose={onDismiss}
      />
    );
  } else if (action === 'join' && result === 'section_notfound') {
    return (
      <JoinSectionNotFoundNotification sectionId={id} onClose={onDismiss} />
    );
  } else if (action === 'join' && result === 'fail') {
    return <JoinSectionFailNotification sectionId={id} onClose={onDismiss} />;
  } else if (action === 'join' && result === 'exists') {
    return (
      <JoinSectionExistsNotification sectionName={name} onClose={onDismiss} />
    );
  } else if (action === 'join' && result === 'section_owned') {
    return <JoinSectionOwnedNotification sectionId={id} onClose={onDismiss} />;
  } else if (action === 'join' && result === 'cant_be_participant') {
    return (
      <JoinSectionParticipantNotification sectionId={id} onClose={onDismiss} />
    );
  } else if (action === 'join' && result === 'section_restricted') {
    return (
      <JoinSectionRestrictedNotification sectionId={id} onClose={onDismiss} />
    );
  } else if (action === 'join' && result === 'section_full') {
    return (
      <JoinSectionFullNotification
        sectionId={id}
        sectionCapacity={sectionCapacity}
        onClose={onDismiss}
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
  sectionCapacity: PropTypes.number,
  showingPlSections: PropTypes.bool,
  joiningPlSection: PropTypes.bool,
  onDismiss: PropTypes.func,
};

const JoinSectionSuccessNotification = ({
  sectionName,
  showingPlSections,
  joiningPlSection,
  onClose,
}) => {
  let notificationMessage = null;
  if (!showingPlSections && joiningPlSection) {
    // Notify user if they are joining a Professional Learning section not on the My PL page
    // so they'll have to go to the My PL page if they want to view it.
    notificationMessage = (
      <SafeMarkdown
        markdown={i18n.sectionsNotificationJoinSuccessForPlWrongPage({
          sectionName: sectionName,
          myPlUrl: studio('/my-professional-learning'),
        })}
      />
    );
  } else {
    notificationMessage = i18n.sectionsNotificationJoinSuccess({sectionName});
  }

  return (
    <NotificationBanner
      variant="success"
      className={bannerClass}
      icon={SUCCESS_ICON}
      title={i18n.sectionsNotificationSuccess()}
      description={notificationMessage}
      onClose={onClose}
    />
  );
};
JoinSectionSuccessNotification.propTypes = {
  sectionName: PropTypes.string.isRequired,
  showingPlSections: PropTypes.bool,
  joiningPlSection: PropTypes.bool,
  onClose: PropTypes.func,
};

const LeaveSectionSuccessNotification = ({sectionName, sectionId, onClose}) => (
  <NotificationBanner
    variant="success"
    className={bannerClass}
    icon={SUCCESS_ICON}
    title={i18n.sectionsNotificationSuccess()}
    description={i18n.sectionsNotificationLeaveSuccess({
      sectionName,
      sectionId,
    })}
    onClose={onClose}
  />
);
LeaveSectionSuccessNotification.propTypes =
  JoinSectionSuccessNotification.propTypes;

const JoinSectionNotFoundNotification = ({sectionId, onClose}) => (
  <NotificationBanner
    variant="error"
    role="alert"
    className={bannerClass}
    icon={ERROR_ICON}
    title={i18n.sectionsNotificationFailure()}
    description={i18n.sectionsNotificationJoinNotFound({sectionId})}
    onClose={onClose}
  />
);
JoinSectionNotFoundNotification.propTypes = {
  sectionId: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

const JoinSectionFullNotification = ({sectionId, sectionCapacity, onClose}) => (
  <NotificationBanner
    variant="error"
    role="alert"
    className={bannerClass}
    icon={ERROR_ICON}
    title={i18n.sectionsNotificationFailure()}
    description={i18n.sectionsNotificationJoinFull({
      sectionId,
      sectionCapacity,
    })}
    onClose={onClose}
  />
);
JoinSectionFullNotification.propTypes = {
  sectionId: PropTypes.string.isRequired,
  sectionCapacity: PropTypes.number.isRequired,
  onClose: PropTypes.func,
};

const JoinSectionRestrictedNotification = ({sectionId, onClose}) => (
  <NotificationBanner
    variant="error"
    role="alert"
    className={bannerClass}
    icon={ERROR_ICON}
    title={i18n.sectionsNotificationFailure()}
    description={i18n.sectionsNotificationJoinRestricted({sectionId})}
    onClose={onClose}
  />
);
JoinSectionRestrictedNotification.propTypes = {
  sectionId: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

const JoinSectionFailNotification = ({sectionId, onClose}) => (
  <NotificationBanner
    variant="error"
    role="alert"
    className={bannerClass}
    icon={ERROR_ICON}
    title={i18n.sectionsNotificationFailure()}
    description={i18n.sectionsNotificationJoinFail({sectionId})}
    onClose={onClose}
  />
);
JoinSectionFailNotification.propTypes =
  JoinSectionNotFoundNotification.propTypes;

const JoinSectionOwnedNotification = ({sectionId, onClose}) => (
  <NotificationBanner
    variant="error"
    role="alert"
    className={bannerClass}
    icon={ERROR_ICON}
    title={i18n.sectionsNotificationFailure()}
    description={i18n.sectionsNotificationAlreadyOwned({sectionId})}
    onClose={onClose}
  />
);
JoinSectionOwnedNotification.propTypes =
  JoinSectionNotFoundNotification.propTypes;

const JoinSectionParticipantNotification = ({sectionId, onClose}) => (
  <NotificationBanner
    variant="error"
    role="alert"
    className={bannerClass}
    icon={ERROR_ICON}
    title={i18n.sectionsNotificationFailure()}
    description={i18n.sectionsNotificationCantBeParticipant({
      sectionId,
    })}
    onClose={onClose}
  />
);
JoinSectionParticipantNotification.propTypes =
  JoinSectionNotFoundNotification.propTypes;

const JoinSectionExistsNotification = ({sectionName, onClose}) => (
  <NotificationBanner
    variant="success"
    className={bannerClass}
    icon={SUCCESS_ICON}
    title={i18n.sectionsNotificationSuccess()}
    description={i18n.sectionsNotificationJoinExists({sectionName})}
    onClose={onClose}
  />
);
JoinSectionExistsNotification.propTypes =
  JoinSectionSuccessNotification.propTypes;
