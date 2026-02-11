import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import AllFeedbacks from '@cdo/apps/templates/feedback/AllFeedbacks';

$(document).ready(showFeedback);

function showFeedback() {
  const script = document.querySelector('script[data-feedback]');
  const feedbackData = JSON.parse(script.dataset.feedback);

  ReactDOM.render(
    <AllFeedbacks feedbacksByLevel={feedbackData.all_feedbacks_by_level} />,
    document.getElementById('feedback-container')
  );
}
