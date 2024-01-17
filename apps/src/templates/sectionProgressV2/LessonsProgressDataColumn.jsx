import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import {studentLessonProgressType} from '../progress/progressTypes';

//TODO fill out later
function LessonProgressDataColumn({
  lessons,
  lessonProgressByStudent,
  sortedStudents,
  addExpandedLesson,
}) {
  return (
    <div>
      {sortedStudents}
      {lessons}
    </div>
  );
}

LessonProgressDataColumn.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
  lessonProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLessonProgressType)
  ).isRequired,
  lessons: PropTypes.arrayOf(PropTypes.object).isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
};

export default connect(state => ({
  lessonProgressByStudent:
    state.sectionProgress.studentLessonProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(LessonProgressDataColumn);
