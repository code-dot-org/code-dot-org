import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Notification, {
  NotificationType,
} from '@cdo/apps/sharedComponents/Notification';
import i18n from '@cdo/locale';

export default class ParticipantFeedbackNotification extends Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    isProfessionalLearningCourse: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      numFeedbackLevels: 0,
    };
  }

  UNSAFE_componentWillMount() {
    const {studentId} = this.props;

    $.ajax({
      url: `/api/v1/teacher_feedbacks/count?student_id=${studentId}`,
      method: 'GET',
      dataType: 'json',
    }).done(data => {
      this.setState({
        numFeedbackLevels: data,
      });
    });
  }

  render() {
    const notificationDetails = i18n.feedbackNotificationDetails({
      numFeedbackLevels: this.state.numFeedbackLevels,
    });

    if (!this.state.numFeedbackLevels) {
      return null;
    }

    return (
      <Notification
        type={NotificationType.feedback}
        notice={
          this.props.isProfessionalLearningCourse
            ? i18n.feedbackNotificationInstructor()
            : i18n.feedbackNotification()
        }
        details={notificationDetails}
        buttonText={i18n.feedbackNotificationButton()}
        buttonLink="/feedback"
        dismissible={false}
      />
    );
  }
}
