import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import AllFeedbacks from '@cdo/apps/templates/feedback/AllFeedbacks';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(showFeedback);

function showFeedback() {
  const script = document.querySelector('script[data-feedback]');
  const feedbackData = JSON.parse(script.dataset.feedback);

  createReactRoot(
    <Provider store={getStore()}>
      <AllFeedbacks feedbacksByLevel={feedbackData.all_feedbacks_by_level} />
    </Provider>,
    document.getElementById('feedback-container')
  );
}
