import React from 'react';
import ReactDOM from 'react-dom';
import CourseOfferingEditor from '@cdo/apps/lib/levelbuilder/CourseOfferingEditor';

$(document).ready(showCourseOfferingEditor);

function showCourseOfferingEditor() {
  const scriptData = document.querySelector(
    'script[data-course-offering-editor]'
  );
  const courseOfferingEditorData = JSON.parse(
    scriptData.dataset.courseOfferingEditor
  );

  ReactDOM.render(
    <CourseOfferingEditor initialCourseOffering={courseOfferingEditorData} />,
    document.getElementById('course_offering_editor')
  );
}
