import React, {Component} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import UnitCalendar from './UnitCalendar';
import _ from 'lodash';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';

const styles = {
  dialog: {
    textAlign: 'left',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  button: {
    float: 'right',
    marginTop: 30
  }
};

export default class UnitCalendarDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func,
    lessons: PropTypes.arrayOf(unitCalendarLesson).isRequired,
    weeklyInstructionalMinutes: PropTypes.number.isRequired
  };

  generateSchedule = () => {
    const {lessons, weeklyInstructionalMinutes} = this.props;
    const lessonsCopy = _.cloneDeep(lessons);
    let allWeeks = [];
    let currWeek = [];
    let currMinutes = 0;

    // splitting lessons across weeks
    lessonsCopy.forEach(lesson => {
      let lessonDuration = lesson.duration;
      while (lessonDuration > 0) {
        if (currMinutes + lessonDuration < weeklyInstructionalMinutes) {
          // If the rest of the current lesson fits into this week, put it in the schedule.
          currMinutes = currMinutes + lessonDuration;
          currWeek.push(_.cloneDeep(lesson));
          lessonDuration = 0;
        } else if (currMinutes < weeklyInstructionalMinutes - 5) {
          // If there's more than 5 minutes left in the week,
          // add as much of the lesson as you can to this week.
          let partialLesson = _.cloneDeep(lesson);
          partialLesson.duration = weeklyInstructionalMinutes - currMinutes;
          currWeek.push(partialLesson);
          lessonDuration = lessonDuration - partialLesson.duration;
          lesson.duration = lessonDuration;
          currMinutes = weeklyInstructionalMinutes;
        } else {
          // If there isn't enough time in this week to add this lesson, start a new week.
          allWeeks.push(currWeek);
          currWeek = [];
          currMinutes = 0;
        }
      }
    });
    allWeeks.push(currWeek);

    // This is to determine where a lesson starts and ends and where the bulk of the lesson is.
    // This is important for the styling of the lesson chunk.
    let prev = null;
    for (let week = 0; week < allWeeks.length; week++) {
      for (let lesson = 0; lesson < allWeeks[week].length; lesson++) {
        let thisLesson = allWeeks[week][lesson];
        if (!prev) {
          thisLesson.isStart = true;
          thisLesson.isMajority = true;
        } else if (prev.title !== thisLesson.title) {
          // We just started a new lesson and as far as we know, this is the biggest chunk.
          // We also ended the previous lesson so we can say that is the last chunk.
          thisLesson.isStart = true;
          thisLesson.isMajority = true;
          prev.isEnd = true;
        } else {
          // This is a continuation of the previous lesson, we need to check if this chunk is larger.
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
        <h2>{i18n.weeklyLessonLayout()}</h2>
        <div>
          {i18n.weeklyLessonLayoutDescription({
            minutes: weeklyInstructionalMinutes
          })}
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
