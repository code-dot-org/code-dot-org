import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default class StudentFeedbackNotification extends Component {
  static propTypes = {
    numFeedbackLevels: PropTypes.string.isRequired,
    linkToFeedbackOverview: PropTypes.string.isRequired
  };

  render() {
    const notificationDetails = i18n.feedbackNotificationDetails({
      numFeedbackLevels: this.props.numFeedbackLevels
    });

    return (
      <Notification
        type={NotificationType.feedback}
        notice={i18n.feedbackNotification()}
        details={notificationDetails}
        buttonText={i18n.feedbackNotificationButton()}
        buttonLink={this.props.linkToFeedbackOverview}
        dismissible={false}
      />
    );
  }
}
