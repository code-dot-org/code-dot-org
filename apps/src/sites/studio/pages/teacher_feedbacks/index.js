import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import AllFeedbacks from '@cdo/apps/templates/feedback/AllFeedbacks';

$(document).ready(showFeedback);

function showFeedback() {
  const script = document.querySelector('script[data-feedback]');
  const feedbackData = JSON.parse(script.dataset.feedback);

  ReactDOM.render(
    // Question to self, should I follow this pattern?  Keep the more modern pattern? OR do a hybrid of keep this data here and fetch data in the lower component for lessons
    <AllFeedbacks feedbacksByLevel={feedbackData.all_feedbacks_by_level} />,
    document.getElementById('feedback-container')
  );
}
