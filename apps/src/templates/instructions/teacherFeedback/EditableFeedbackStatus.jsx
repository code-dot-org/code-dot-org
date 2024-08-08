import moment from 'moment/moment';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import teacherFeedbackStyles from '@cdo/apps/templates/instructions/teacherFeedback/teacherFeedbackStyles';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

class EditableFeedbackStatus extends Component {
  static propTypes = {
    latestFeedback: PropTypes.object.isRequired,
  };

  getFriendlyDate(feedbackSeen) {
    const now = moment();
    const dateFeedbackSeen = moment(feedbackSeen);
    const daysApart = now.diff(dateFeedbackSeen, 'days');

    if (daysApart === 0) {
      return i18n.today();
    } else if (daysApart === 1) {
      return i18n.yesterday();
    } else {
      return dateFeedbackSeen.format('l');
    }
  }

  renderTeacherViewStudentUpdated() {
    const {student_last_updated} = this.props.latestFeedback;
    const style = {
      ...styles.timeTeacher,
      ...styles.timeTeacherStudentSeen,
    };
    const formattedTime = this.getFriendlyDate(student_last_updated);

    return (
      <div style={style} id="ui-test-feedback-time">
        {i18n.lastUpdatedByStudent()}
        <span
          style={teacherFeedbackStyles.timestamp}
        >{` ${formattedTime}`}</span>
      </div>
    );
  }

  renderTeacherViewStudentSeen() {
    const {student_seen_feedback} = this.props.latestFeedback;
    const style = {
      ...styles.timeTeacher,
      ...styles.timeTeacherStudentSeen,
    };
    const formattedTime = this.getFriendlyDate(student_seen_feedback);

    return (
      <div style={style} id="ui-test-feedback-time">
        <FontAwesome
          icon="check"
          className="fa-check"
          style={styles.checkboxIcon}
        />
        {i18n.seenByStudent()}
        <span
          style={teacherFeedbackStyles.timestamp}
        >{` ${formattedTime}`}</span>
      </div>
    );
  }

  renderTeacherViewStudentNotSeen() {
    const {created_at} = this.props.latestFeedback;
    const formattedTime = this.getFriendlyDate(created_at);
    return (
      <div style={styles.timeTeacher} id="ui-test-feedback-time">
        {i18n.lastUpdatedCurrentTeacher()}
        <span
          style={teacherFeedbackStyles.timestamp}
        >{` ${formattedTime}`}</span>
      </div>
    );
  }

  render() {
    const {latestFeedback} = this.props;

    if (!latestFeedback) {
      return null;
    }

    if (
      latestFeedback.student_last_updated &&
      latestFeedback.student_last_updated > latestFeedback.created_at
    ) {
      //Teacher view if current teacher left feedback & student updated
      return this.renderTeacherViewStudentUpdated();
    }

    if (!!this.props.latestFeedback.student_seen_feedback) {
      //Teacher view if current teacher left feedback & student viewed
      return this.renderTeacherViewStudentSeen();
    }

    //Teacher view if current teacher left feedback & student did not view
    return this.renderTeacherViewStudentNotSeen();
  }
}

const styles = {
  checkboxIcon: {
    color: '#25c23c',
  },
  timeTeacher: {
    paddingLeft: 8,
    fontStyle: 'italic',
    fontSize: 12,
    color: color.cyan,
  },
  timeTeacherStudentSeen: {
    color: '#25c23c',
  },
};

export default EditableFeedbackStatus;
