import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import _ from 'lodash';
import UnitCalendarLessonChunk from './UnitCalendarLessonChunk';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';

export default class UnitCalendar extends React.Component {
  static propTypes = {
    weeklyInstructionalMinutes: PropTypes.number.isRequired,
    lessons: PropTypes.arrayOf(unitCalendarLesson).isRequired,
    weekWidth: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      hovering: ''
    };
  }

  generateSchedule = () => {
    const {lessons, weeklyInstructionalMinutes} = this.props;
    const lessonsCopy = _.cloneDeep(lessons);
    let allWeeks = [];
    let currWeek = [];
    let currMinutes = 0;
    // splitting lessons across weeks
    lessonsCopy.forEach(lesson => {
      lesson.isStart = false;
      lesson.isEnd = false;
      lesson.isMajority = false;
      const originalLessonDuration = lesson.duration;
      while (lesson.duration > 0) {
        let lessonClone = _.cloneDeep(lesson);
        if (currMinutes + lesson.duration <= weeklyInstructionalMinutes) {
          // If the rest of the current lesson fits into this week, put it in the schedule.
          if (originalLessonDuration === lesson.duration) {
            lessonClone.isStart = true;
          }
          if (originalLessonDuration - lesson.duration <= lesson.duration) {
            lessonClone.isMajority = true;
          }
          lessonClone.isEnd = true;
          currWeek.push(lessonClone);
          currMinutes = currMinutes + lesson.duration;
          lesson.duration = 0;
        } else if (currMinutes < weeklyInstructionalMinutes - 15) {
          // If there's more than 15 minutes left in the week,
          // add as much of the lesson as you can to this week.
          if (originalLessonDuration === lesson.duration) {
            lessonClone.isStart = true;
          }
          lessonClone.duration = weeklyInstructionalMinutes - currMinutes;
          if (lesson.duration - lessonClone.duration <= lessonClone.duration) {
            lessonClone.isMajority = true;
          }
          currWeek.push(lessonClone);
          lesson.duration = lesson.duration - lessonClone.duration;
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
    return allWeeks;
  };

  handleHover = id => {
    this.setState({hovering: id});
  };

  renderWeek = (week, weekNumber) => {
    const minuteWidth =
      this.props.weekWidth / this.props.weeklyInstructionalMinutes;
    return week.map((lessonChunk, index) => (
      <UnitCalendarLessonChunk
        key={`week-${weekNumber}-lesson-chunk-${index}`}
        minuteWidth={minuteWidth}
        lessonChunk={lessonChunk}
        isHover={lessonChunk.id === this.state.hovering}
        handleHover={this.handleHover}
      />
    ));
  };

  render() {
    const schedule = this.generateSchedule();
    return (
      <div>
        <table style={styles.table}>
          <tbody>
            {schedule.map((week, index) => (
              <tr key={`week-${index}`}>
                <td style={styles.weekColumn}>
                  {i18n.weekLabel({number: index + 1})}
                </td>
                <td style={styles.scheduleColumn}>
                  {this.renderWeek(week, index + 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table style={styles.key}>
          <tbody>
            <tr>
              <td style={styles.weekColumn}>Key</td>
              <td style={styles.scheduleColumn}>
                <div style={styles.keySection}>
                  <div>
                    <FontAwesome
                      icon="square-o"
                      style={{
                        color: color.teal,
                        ...styles.keyIcon
                      }}
                    />
                    {i18n.instructionalLesson()}
                  </div>
                  <div>
                    <FontAwesome
                      icon="check-circle"
                      style={{
                        color: color.purple,
                        ...styles.keyIcon
                      }}
                    />
                    {i18n.assessment()}
                  </div>
                  <div>
                    <FontAwesome icon="scissors" style={styles.keyIcon} />
                    {i18n.unpluggedLesson()}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

const styles = {
  weekColumn: {
    width: 100,
    backgroundColor: color.purple,
    color: 'white',
    textAlign: 'center',
    border: '1px solid ' + color.purple,
    borderCollapse: 'collapse',
    fontWeight: 'bold',
    minHeight: 50
  },
  scheduleColumn: {
    border: '1px solid ' + color.purple,
    borderCollapse: 'collapse',
    display: 'flex',
    minHeight: 50,
    margin: 0
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%'
  },
  key: {
    border: '1px solid ' + color.purple,
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: 20
  },
  keyIcon: {
    marginRight: 5
  },
  keySection: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '90%',
    alignItems: 'center',
    fontSize: 15
  }
};
