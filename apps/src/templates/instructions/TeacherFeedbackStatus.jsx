import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import moment from 'moment/moment';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

class TeacherFeedbackStatus extends Component {
  static propTypes = {
    viewAs: PropTypes.oneOf(['Teacher', 'Student']).isRequired,
    latestFeedback: PropTypes.object.isRequired
  };

  studentViewAttributes(latestFeedback) {
    return {
      style: styles.timeStudent,
      time: moment.min(moment(), moment(latestFeedback.created_at)).fromNow(),
      message: i18n.lastUpdated()
    };
  }

  studentSeenAttributes(latestFeedback) {
    return {
      style: {
        ...styles.timeTeacher,
        ...styles.timeTeacherStudentSeen
      },
      message: i18n.seenByStudent(),
      time: this.getFriendlyDate(latestFeedback.student_seen_feedback),
      displayCheck: true
    };
  }

  studentNotSeenAttributes(latestFeedback) {
    return {
      style: {
        ...styles.timeTeacher
      },
      message: i18n.lastUpdatedCurrentTeacher(),
      time: this.getFriendlyDate(latestFeedback.created_at)
    };
  }

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

  hasStudentSeenFeedback() {
    return !!this.props.latestFeedback.student_seen_feedback;
  }

  render() {
    const {viewAs, latestFeedback} = this.props;

    if (!latestFeedback) {
      return null;
    }

    let attributes;
    if (viewAs === ViewType.Student) {
      attributes = this.studentViewAttributes(latestFeedback);
    } else if (viewAs === ViewType.Teacher) {
      if (this.hasStudentSeenFeedback()) {
        //Teacher view if current teacher left feedback & student viewed
        attributes = this.studentSeenAttributes(latestFeedback);
      } else {
        //Teacher view if current teacher left feedback & student did not view
        attributes = this.studentNotSeenAttributes(latestFeedback);
      }
    }

    const {style, time, message, displayCheck} = attributes;

    return (
      <div style={style} id="ui-test-feedback-time">
        {displayCheck && (
          <FontAwesome
            icon="check"
            className="fa-check"
            style={styles.checkboxIcon}
          />
        )}
        {`${message} `}
        {time && <span style={styles.timestamp}>{time}</span>}
      </div>
    );
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

export default TeacherFeedbackStatus;
