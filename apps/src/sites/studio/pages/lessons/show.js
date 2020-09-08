import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonOverview from '@cdo/apps/templates/lessonOverview/LessonOverview';

$(document).ready(function() {
  const lessonData = getScriptData('lesson');
  ReactDOM.render(
    <LessonOverview
      displayName={lessonData.title}
      overview={lessonData.overview}
    />,
    document.getElementById('show-container')
  );
});
