import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonOverview from '@cdo/apps/templates/lessonOverview/LessonOverview';
import {sampleActivities} from '../../../../../test/unit/lib/levelbuilder/lesson-editor/activitiesTestData';

$(document).ready(function() {
  const lessonData = getScriptData('lesson');
  ReactDOM.render(
    <LessonOverview
      displayName={lessonData.title}
      overview={lessonData.overview}
      activities={sampleActivities} //TODO: Get real activities data getting passed here
    />,
    document.getElementById('show-container')
  );
});
