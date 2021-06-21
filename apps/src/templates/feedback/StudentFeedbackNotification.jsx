import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';
import $ from 'jquery';

export default class StudentFeedbackNotification extends Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      numFeedbackLevels: 0
    };
  }

  UNSAFE_componentWillMount() {
    const {studentId} = this.props;

    $.ajax({
      url: `/api/v1/teacher_feedbacks/count?student_id=${studentId}`,
      method: 'GET',
      dataType: 'json'
    }).done(data => {
      this.setState({
        numFeedbackLevels: data
      });
    });
  }

  render() {
    const notificationDetails = i18n.feedbackNotificationDetails({
      numFeedbackLevels: this.state.numFeedbackLevels
    });

    if (!this.state.numFeedbackLevels) {
      return null;
    }

    return (
      <Notification
        type={NotificationType.feedback}
        notice={i18n.feedbackNotification()}
        details={notificationDetails}
        buttonText={i18n.feedbackNotificationButton()}
        buttonLink="/feedback"
        dismissible={false}
        googleAnalyticsId="student-feedback"
      />
    );
  }
}
