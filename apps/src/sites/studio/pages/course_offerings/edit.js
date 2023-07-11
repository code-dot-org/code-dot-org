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

  const scriptSelfPacedData = document.querySelector(
    'script[data-self-paced-pl-course-offerings]'
  );

  const selfPacedPLCourseOfferings = JSON.parse(
    scriptSelfPacedData.dataset.selfPacedPlCourseOfferings
  );

  ReactDOM.render(
    <CourseOfferingEditor
      initialCourseOffering={courseOfferingEditorData}
      selfPacedPLCourseOfferings={selfPacedPLCourseOfferings}
    />,
    document.getElementById('course_offering_editor')
  );
}
