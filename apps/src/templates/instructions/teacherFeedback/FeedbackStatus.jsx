import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import moment from 'moment/moment';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

class FeedbackStatus extends Component {
  static propTypes = {
    viewAs: PropTypes.oneOf(['Teacher', 'Student']).isRequired,
    latestFeedback: PropTypes.object.isRequired
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

  renderStudentView() {
    const {created_at} = this.props.latestFeedback;
    const formattedTime = moment.min(moment(), moment(created_at)).fromNow();
    return (
      <div style={styles.timeStudent} id="ui-test-feedback-time">
        {i18n.lastUpdated()}
        {formattedTime && (
          <span style={styles.timestamp}>{` ${formattedTime}`}</span>
        )}
      </div>
    );
  }

  renderTeacherViewStudentUpdated() {
    const {student_last_updated} = this.props.latestFeedback;
    const style = {
      ...styles.timeTeacher,
      ...styles.timeTeacherStudentSeen
    };
    const formattedTime = this.getFriendlyDate(student_last_updated);

    return (
      <div style={style} id="ui-test-feedback-time">
        {i18n.lastUpdatedByStudent()}
        <span style={styles.timestamp}>{` ${formattedTime}`}</span>
      </div>
    );
  }

  renderTeacherViewStudentSeen() {
    const {student_seen_feedback} = this.props.latestFeedback;
    const style = {
      ...styles.timeTeacher,
      ...styles.timeTeacherStudentSeen
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
        <span style={styles.timestamp}>{` ${formattedTime}`}</span>
      </div>
    );
  }

  renderTeacherViewStudentNotSeen() {
    const {created_at} = this.props.latestFeedback;
    const formattedTime = this.getFriendlyDate(created_at);
    return (
      <div style={styles.timeTeacher} id="ui-test-feedback-time">
        {i18n.lastUpdatedCurrentTeacher()}
        <span style={styles.timestamp}>{` ${formattedTime}`}</span>
      </div>
    );
  }

  render() {
    const {viewAs, latestFeedback} = this.props;

    if (!latestFeedback) {
      return null;
    }

    if (viewAs === ViewType.Student) {
      return this.renderStudentView();
    }

    if (viewAs === ViewType.Teacher) {
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
}

const styles = {
  checkboxIcon: {
    color: '#25c23c'
  },
  timestamp: {
    fontFamily: '"Gotham 7r", sans-serif'
  },
  timeStudent: {
    fontStyle: 'italic',
    fontSize: 12,
    color: color.cyan
  },
  timeTeacher: {
    paddingTop: 8,
    paddingLeft: 8,
    fontStyle: 'italic',
    fontSize: 12,
    color: color.cyan
  },
  timeTeacherStudentSeen: {
    color: '#25c23c'
  }
};

export default FeedbackStatus;
