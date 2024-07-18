import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';

import AllFeedbacks from '@cdo/apps/templates/feedback/AllFeedbacks';

$(document).ready(showFeedback);

function showFeedback() {
  const script = document.querySelector('script[data-feedback]');
  const feedbackData = JSON.parse(script.dataset.feedback);

  const root = createRoot(document.getElementById('feedback-container'));
  root.render(
    <AllFeedbacks feedbacksByLevel={feedbackData.all_feedbacks_by_level} />
  );
}
