import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';

$(document).ready(function() {
  const lessonData = getScriptData('lesson');
  ReactDOM.render(
    <LessonEditor
      displayName={lessonData.name}
      overview={lessonData.overview}
    />,
    document.getElementById('edit-container')
  );
});
