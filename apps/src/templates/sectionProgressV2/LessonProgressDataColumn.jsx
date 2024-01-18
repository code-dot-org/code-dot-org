import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import {studentLessonProgressType} from '../progress/progressTypes';
import {connect} from 'react-redux';

function LessonProgressDataColumn({
  lesson,
  lessonProgressByStudent,
  sortedStudents,
  addExpandedLesson,
}) {
  return <div className={styles.lessonColumn}>{lesson.id}</div>;
}

LessonProgressDataColumn.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
  lessonProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLessonProgressType)
  ).isRequired,
  lesson: PropTypes.object.isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
};

export default connect(state => ({
  lessonProgressByStudent:
    state.sectionProgress.studentLessonProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(LessonProgressDataColumn);
