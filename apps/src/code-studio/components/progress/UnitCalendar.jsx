import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import _ from 'lodash';
import UnitCalendarLessonChunk from './UnitCalendarLessonChunk';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';

const weekWidth = 592;
const styles = {
  weekColumn: {
    minWidth: 100,
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
    width: weekWidth,
    display: 'flex',
    minHeight: 50
  },
  table: {
    border: '1px solid ' + color.purple,
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

export default class UnitCalendar extends React.Component {
  static propTypes = {
    weeklyInstructionalMinutes: PropTypes.number.isRequired,
    lessons: PropTypes.arrayOf(unitCalendarLesson).isRequired
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
    let prev = null;
    lessonsCopy.forEach(lesson => {
      lesson.isStart = false;
      lesson.isEnd = false;
      lesson.isMajority = false;
      let lessonDuration = lesson.duration;
      while (lessonDuration > 0) {
        let thisChunk = null;
        if (currMinutes + lessonDuration < weeklyInstructionalMinutes) {
          // If the rest of the current lesson fits into this week, put it in the schedule.
          currMinutes = currMinutes + lessonDuration;
          let thisLesson = _.cloneDeep(lesson);
          thisLesson.isEnd = true;
          currWeek.push(thisLesson);
          thisChunk = thisLesson;
          lessonDuration = 0;
        } else if (currMinutes < weeklyInstructionalMinutes - 5) {
          // If there's more than 5 minutes left in the week,
          // add as much of the lesson as you can to this week.
          let partialLesson = _.cloneDeep(lesson);
          partialLesson.duration = weeklyInstructionalMinutes - currMinutes;
          currWeek.push(partialLesson);
          thisChunk = partialLesson;
          lessonDuration = lessonDuration - partialLesson.duration;
          lesson.duration = lessonDuration;
          currMinutes = weeklyInstructionalMinutes;
        } else {
          // If there isn't enough time in this week to add this lesson, start a new week.
          allWeeks.push(currWeek);
          currWeek = [];
          currMinutes = 0;
        }
        if (thisChunk) {
          if (!prev || prev.title !== thisChunk.title) {
            thisChunk.isStart = true;
            thisChunk.isMajority = true;
          } else {
            thisChunk.isStart = false;
            if (prev.duration < thisChunk.duration) {
              thisChunk.isMajority = true;
              prev.isMajority = false;
            }
          }
          prev = thisChunk;
        }
      }
    });
    allWeeks.push(currWeek);
    return allWeeks;
  };

  handleHover = id => {
    this.setState({hovering: id});
  };

  renderWeek = week => {
    const minuteWidth = weekWidth / this.props.weeklyInstructionalMinutes;
    return week.map((lesson, index) => {
      return (
        <UnitCalendarLessonChunk
          key={`lesson-${index}`}
          minuteWidth={minuteWidth}
          lesson={lesson}
          isHover={lesson.id === this.state.hovering}
          handleHover={this.handleHover}
        />
      );
    });
  };

  render() {
    const schedule = this.generateSchedule();
    return (
      <div>
        <table style={styles.table}>
          <tbody>
            {schedule.map((week, index) => {
              return (
                <tr key={`week-${index}`}>
                  <td style={styles.weekColumn}>
                    {i18n.weekLabel({number: index + 1})}
                  </td>
                  <td style={styles.scheduleColumn}>{this.renderWeek(week)}</td>
                </tr>
              );
            })}
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
