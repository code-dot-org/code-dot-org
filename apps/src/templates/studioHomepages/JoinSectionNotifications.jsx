/** @file Notifications showing results of the join/leave section operation. */
import React from 'react';
import Notification from '@cdo/apps/templates/Notification';
import i18n from "@cdo/locale";

const JoinSectionNotifications = ({action, result, nameOrId}) => {
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
};
JoinSectionNotifications.propTypes = {
  action: React.PropTypes.string,
  result: React.PropTypes.string,
  nameOrId: React.PropTypes.string,
};
export default JoinSectionNotifications;

const JoinSectionSuccessNotification = React.createClass({
  propTypes: {sectionName: React.PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="success"
        notice={i18n.sectionsNotificationSuccess()}
        details={i18n.sectionsNotificationJoinSuccess({sectionName: this.props.sectionName})}
        dismissible={true}
      />
    );
  }
});

const LeaveSectionSuccessNotification = React.createClass({
  propTypes: {sectionName: React.PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="success"
        notice={i18n.sectionsNotificationSuccess()}
        details={i18n.sectionsNotificationLeaveSuccess({sectionName: this.props.sectionName})}
        dismissible={true}
      />
    );
  }
});

const JoinSectionNotFoundNotification = React.createClass({
  propTypes: {sectionId: React.PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="failure"
        notice={i18n.sectionsNotificationFailure()}
        details={i18n.sectionsNotificationJoinNotFound({sectionId: this.props.sectionId})}
        dismissible={true}
      />
    );
  }
});

const JoinSectionFailNotification = React.createClass({
  propTypes: {sectionId: React.PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="failure"
        notice={i18n.sectionsNotificationFailure()}
        details={i18n.sectionsNotificationJoinFail({sectionId: this.props.sectionId})}
        dismissible={true}
      />
    );
  }
});

const JoinSectionExistsNotification = React.createClass({
  propTypes: {sectionName: React.PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="warning"
        notice={i18n.sectionsNotificationSuccess()}
        details={i18n.sectionsNotificationJoinExists({sectionName: this.props.sectionName})}
        dismissible={true}
      />
    );
  }
});
