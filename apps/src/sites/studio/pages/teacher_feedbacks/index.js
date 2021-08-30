import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import AllFeedback from '@cdo/apps/templates/feedback/AllFeedback';

$(document).ready(showFeedback);

function showFeedback() {
  const script = document.querySelector('script[data-feedback]');
  const feedbackData = JSON.parse(script.dataset.feedback);

  ReactDOM.render(
    <AllFeedback feedbackByLevel={feedbackData.all_feedback_by_level} />,
    document.getElementById('feedback-container')
  );
}
