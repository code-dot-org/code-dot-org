import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import AllFeedback from '@cdo/apps/templates/feedback/AllFeedback';

$(document).ready(showFeedback);

function showFeedback() {
  // TODO: Erin B. delete in favor of real data
  // once TeacherFeedbacks are associated with ScriptLevels rather than Levels.
  const feedbacks = [
    {
      lessonName: 'Creating Functions',
      levelNum: '8',
      linkToLevel: '/',
      unitName: 'CSP Unit 3 - Intro to Programming',
      linkToUnit: '/',
      lastUpdated: new Date().toLocaleString(),
      comment: 'Good job!',
      seenByStudent: false
    }
  ];

  ReactDOM.render(
    <AllFeedback feedbacks={feedbacks} />,
    document.getElementById('feedback-container')
  );
}
