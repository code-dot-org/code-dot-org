import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import shapes from './shapes';
import {UnlocalizedTimeAgo as TimeAgo} from '@cdo/apps/templates/TimeAgo';

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    minHeight: 72,
    width: '100%',
    marginBottom: 20,
    display: 'flex',
    flexFlow: 'wrap',
    boxSizing: 'border-box'
  },
  lessonDetails: {
    width: '75%',
    margin: 15
  },
  lessonLevel: {
    fontSize: 16,
    marginBottom: 8,
    color: color.teal
  },
  unit: {
    color: color.teal
  },
  label: {
    fontFamily: '"Gotham 5r", sans-serif',
    marginRight: 5,
    marginLeft: 10
  },
  time: {
    marginTop: 15,
    fontStyle: 'italic',
    color: color.light_gray,
    float: 'left'
  },
  comment: {
    width: '100%',
    fontStyle: 'italic',
    color: color.charcoal,
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 15,
    fontSize: 14
  }
};

export default class LevelFeedbackEntry extends Component {
  static propTypes = {feedback: shapes.feedback};

  render() {
    const {
      seen_on_feedback_page_at,
      student_first_visited_at,
      lessonName,
      levelNum,
      linkToLevel,
      unitName,
      linkToUnit,
      created_at,
      comment
    } = this.props.feedback;

    const seenByStudent = seen_on_feedback_page_at || student_first_visited_at;

    const style = {
      backgroundColor: seenByStudent ? color.lightest_teal : color.white,
      ...styles.main
    };

    return (
      <div style={style}>
        <div style={styles.lessonDetails}>
          <a href={linkToLevel}>
            <div style={styles.lessonLevel}>
              <span style={styles.label}>
                {i18n.feedbackNotificationLesson()}
              </span>
              <span>{lessonName}</span>
              <span style={styles.label}>
                {i18n.feedbackNotificationLevel()}
              </span>
              <span>{levelNum}</span>
            </div>
          </a>
          <a href={linkToUnit}>
            <div style={styles.unit}>
              <span style={styles.label}>
                {i18n.feedbackNotificationUnit()}
              </span>
              <span>{unitName}</span>
            </div>
          </a>
        </div>
        <TimeAgo style={styles.time} dateString={created_at} />
        <div style={styles.comment}>{comment}</div>
      </div>
    );
  }
}
