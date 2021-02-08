import React, {Component} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import UnitCalendar from './UnitCalendar';
import _ from 'lodash';

const styles = {
  dialog: {
    textAlign: 'left',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  detailsLine: {
    marginBottom: 32
  },
  row: {
    marginTop: 8,
    marginBottom: 8
  },
  button: {
    float: 'right',
    marginTop: 30
  },
  buttonIcon: {
    margin: 0,
    fontSize: 24
  },
  buttonLabel: {
    paddingLeft: 16
  }
};

export default class UnitCalendarDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func,
    lessons: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        duration: PropTypes.number.isRequired,
        assessment: PropTypes.bool.isRequired,
        unplugged: PropTypes.bool,
        url: PropTypes.string
      })
    ).isRequired,
    weeklyInstructionalMinutes: PropTypes.number.isRequired
  };

  generateSchedule = () => {
    const {lessons, weeklyInstructionalMinutes} = this.props;
    const lessonsCopy = _.cloneDeep(lessons);
    let allWeeks = [];
    let currWeek = [];
    let currMinutes = 0;
    console.log(lessonsCopy);
    console.log(weeklyInstructionalMinutes);
    lessonsCopy.forEach(lesson => {
      let lessonDuration = lesson.duration;
      while (lessonDuration > 0) {
        if (currMinutes + lessonDuration < weeklyInstructionalMinutes) {
          currMinutes = currMinutes + lessonDuration;
          currWeek.push(_.cloneDeep(lesson));
          lessonDuration = 0;
        } else if (currMinutes < weeklyInstructionalMinutes - 5) {
          let partialLesson = _.cloneDeep(lesson);
          partialLesson.duration = weeklyInstructionalMinutes - currMinutes;
          currWeek.push(partialLesson);
          lessonDuration = lessonDuration - partialLesson.duration;
          lesson.duration = lessonDuration;
          currMinutes = weeklyInstructionalMinutes;
        } else {
          allWeeks.push(currWeek);
          currWeek = [];
          currMinutes = 0;
        }
      }
    });
    allWeeks.push(currWeek);
    let prev = null;
    for (let week = 0; week < allWeeks.length; week++) {
      for (let lesson = 0; lesson < allWeeks[week].length; lesson++) {
        let thisLesson = allWeeks[week][lesson];
        if (!prev) {
          thisLesson.isStart = true;
          thisLesson.isMajority = true;
        } else if (prev.title !== thisLesson.title) {
          thisLesson.isStart = true;
          thisLesson.isMajority = true;
          prev.isEnd = true;
        } else {
          thisLesson.isStart = false;
          prev.isEnd = false;
          if (prev.duration < thisLesson.duration) {
            thisLesson.isMajority = true;
            prev.isMajority = false;
          }
        }
        prev = thisLesson;
      }
    }
    prev.isEnd = true;
    return allWeeks;
  };

  render() {
    const {weeklyInstructionalMinutes, isOpen, handleClose} = this.props;
    const schedule = this.generateSchedule();
    return (
      <BaseDialog
        isOpen={isOpen}
        handleClose={handleClose}
        style={styles.dialog}
        useUpdatedStyles
        hideCloseButton
      >
        <h2>Weekly Lesson Layout</h2>
        <div>
          A weekly chart of a suggested schedule based on{' '}
          {weeklyInstructionalMinutes} instructional minutes per week.
        </div>
        <UnitCalendar
          schedule={schedule}
          weeklyInstructionalMinutes={weeklyInstructionalMinutes}
        />
        <Button
          style={styles.button}
          text={i18n.closeDialog()}
          onClick={handleClose}
          color={Button.ButtonColor.orange}
        />
      </BaseDialog>
    );
  }
}
