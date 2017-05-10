import React from 'react';
import ReactDOM from 'react-dom';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const scriptData = document.querySelector('script[data-course-editor]');
  const courseEditorData = JSON.parse(scriptData.dataset.courseEditor);

  // Eventually we want to do this all via redux
  ReactDOM.render(
    <div>
      Course Editor
      <pre>{JSON.stringify(courseEditorData, null, 2)}</pre>
    </div>,
  document.getElementById('course_editor'));
}
