import React, {Component} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import Button from '@cdo/apps/templates/Button';

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
    boxSizing: 'border-box',
    color: color.charcoal
  },
  lessonDetails: {
    width: '50%',
    margin: 15
  },
  button: {
    marginLeft: 25,
    marginRight: 25,
    marginTop: 18,
    marginBottom: 18
  },
  lessonLevel: {
    fontSize: 16,
    marginBottom: 10
  },
  label: {
    fontFamily: '"Gotham 5r", sans-serif',
    marginRight: 5,
    marginLeft: 10
  },
  time: {
    width: '25%',
    marginTop: 30,
    fontStyle: 'italic'
  }
};

export default class LevelFeedbackEntry extends Component {
  static propTypes = {
    seenByStudent: PropTypes.bool.isRequired,
    lessonName: PropTypes.string.isRequired,
    levelName: PropTypes.string.isRequired,
    courseName: PropTypes.string.isRequired,
    unitName: PropTypes.string.isRequired,
    lastUpdated: PropTypes.string.isRequired,
    linkToLevel: PropTypes.string.isRequired
  };

  render() {
    const {seenByStudent} = this.props;

    const buttonColor = seenByStudent
      ? Button.ButtonColor.gray
      : Button.ButtonColor.orange;

    const style = {
      backgroundColor: seenByStudent ? color.lightest_gray : color.white,
      ...styles.main
    };

    return (
      <div style={style}>
        <div style={styles.lessonDetails}>
          <div style={styles.lessonLevel}>
            <span style={styles.label}>
              {i18n.feedbackNotificationLesson()}
            </span>
            <span>{this.props.lessonName}</span>
            <span style={styles.label}>{i18n.feedbackNotificationLevel()}</span>
            <span>{this.props.levelName}</span>
          </div>
          <div style={styles.courseUnit}>
            <span style={styles.label}>
              {i18n.feedbackNotificationCourse()}
            </span>
            <span>{this.props.courseName}</span>
            <span style={styles.label}>{i18n.feedbackNotificationUnit()}</span>
            <span>{this.props.unitName}</span>
          </div>
        </div>
        <div style={styles.time}>
          <span style={styles.label}>
            {i18n.feedbackNotificationLastUpdated()}
          </span>
          <span>{this.props.lastUpdated}</span>
        </div>
        <Button
          href="/"
          color={buttonColor}
          text={i18n.feedbackNotificationButton()}
          target={'_blank'}
          style={styles.button}
        />
      </div>
    );
  }
}
