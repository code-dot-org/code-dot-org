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
      lesson_name: 'Creating Functions',
      level_num: '8',
      link_to_level: '/',
      unit_name: 'CSP Unit 3 - Intro to Programming',
      link_to_unit: '/',
      updated_at: new Date().toLocaleString(),
      comment: 'Good job!'
    }
  ];

  ReactDOM.render(
    <AllFeedback feedbacks={feedbacks} />,
    document.getElementById('feedback-container')
  );
}
