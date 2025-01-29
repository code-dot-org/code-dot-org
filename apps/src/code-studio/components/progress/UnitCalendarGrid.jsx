import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import UnitCalendarLessonChunk from './UnitCalendarLessonChunk';

import styles from './unit-calendar.module.scss';

export default function UnitCalendarGrid({
  weeklyInstructionalMinutes,
  lessons,
  weekWidth,
}) {
  const [hovering, setHovering] = React.useState('');

  const schedule = React.useMemo(() => {
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
  }, [lessons, weeklyInstructionalMinutes]);

  const renderWeek = React.useCallback(
    (week, weekNumber) => {
      const minuteWidth = weekWidth / weeklyInstructionalMinutes;
      return week.map((lessonChunk, index) => (
        <UnitCalendarLessonChunk
          key={`week-${weekNumber}-lesson-chunk-${index}`}
          minuteWidth={minuteWidth}
          lessonChunk={lessonChunk}
          isHover={lessonChunk.id === hovering}
          handleHover={setHovering}
        />
      ));
    },
    [hovering, weeklyInstructionalMinutes, weekWidth]
  );

  return (
    <div>
      <table className={styles.table}>
        <tbody>
          {schedule.map((week, index) => (
            <tr key={`week-${index}`}>
              <td className={styles.weekColumn}>
                {i18n.weekLabel({number: index + 1})}
              </td>
              <td className={styles.scheduleColumn}>
                {renderWeek(week, index + 1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className={styles.key}>
        <tbody>
          <tr>
            <td className={styles.weekColumn}>Key</td>
            <td className={styles.scheduleColumn}>
              <div className={styles.keySection}>
                <div className={styles.keyCell}>
                  <FontAwesome
                    icon="square-o"
                    style={{
                      color: color.teal,
                    }}
                    className={styles.keyIcon}
                  />
                  {i18n.instructionalLesson()}
                </div>
                <div className={styles.keyCell}>
                  <FontAwesome
                    icon="check-circle"
                    style={{
                      color: color.purple,
                    }}
                    className={styles.keyIcon}
                  />
                  {i18n.assessment()}
                </div>
                <div className={styles.keyCell}>
                  <FontAwesome icon="scissors" className={styles.keyIcon} />
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

UnitCalendarGrid.propTypes = {
  weeklyInstructionalMinutes: PropTypes.number.isRequired,
  lessons: PropTypes.arrayOf(unitCalendarLesson).isRequired,
  weekWidth: PropTypes.number.isRequired,
};
