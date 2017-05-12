import React from 'react';
import ReactDOM from 'react-dom';
import CourseEditor from '@cdo/apps/templates/courseEditor/CourseEditor';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const scriptData = document.querySelector('script[data-course-editor]');
  const courseEditorData = JSON.parse(scriptData.dataset.courseEditor);

  // Eventually we want to do this all via redux
  ReactDOM.render(
    <CourseEditor
      title={courseEditorData.course_summary.title}
      descriptionStudent={courseEditorData.course_summary.description_student}
      descriptionTeacher={courseEditorData.course_summary.description_teacher}
      scriptNames={courseEditorData.script_names.sort()}
    />,
  document.getElementById('course_editor'));
}
