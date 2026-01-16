import $ from 'jquery';
import React from 'react';

import AllFeedbacks from '@cdo/apps/templates/feedback/AllFeedbacks';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(showFeedback);

function showFeedback() {
  const script = document.querySelector('script[data-feedback]');
  const feedbackData = JSON.parse(script.dataset.feedback);

  createReactRoot(
    <AllFeedbacks feedbacksByLevel={feedbackData.all_feedbacks_by_level} />,
    document.getElementById('feedback-container')
  );
}
