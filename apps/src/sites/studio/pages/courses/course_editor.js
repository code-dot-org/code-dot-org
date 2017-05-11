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
      name={courseEditorData.course_summary.name}
      title={courseEditorData.course_summary.title}
      descriptionStudent={courseEditorData.course_summary.description_student}
      descriptionTeacher={courseEditorData.course_summary.description_teacher}
      scriptsInCourse={courseEditorData.course_summary.scripts.map(script => script.name)}
      scriptNames={courseEditorData.script_names.sort()}
    />,
  document.getElementById('course_editor'));
}
