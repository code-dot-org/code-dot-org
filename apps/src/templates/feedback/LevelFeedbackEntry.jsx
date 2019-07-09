import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import shapes from './shapes';

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
    width: '50%',
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
    width: '25%',
    marginTop: 15,
    fontStyle: 'italic'
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
      seenByStudent,
      lessonName,
      levelNum,
      linkToLevel,
      unitName,
      linkToUnit,
      lastUpdated,
      comment
    } = this.props.feedback;

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
        <div style={styles.time}>{lastUpdated}</div>
        <div style={styles.comment}>{comment}</div>
      </div>
    );
  }
}
